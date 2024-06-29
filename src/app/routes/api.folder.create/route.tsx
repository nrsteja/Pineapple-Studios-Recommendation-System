import {LoaderFunctionArgs, Session, json, redirect} from "@remix-run/node";

import {createFolder} from "../../../lib/dataRetrieve/createFolder";
import {getItemIdBySrcId} from "../../../lib/dataRetrieve/getItemInfo";
import {getUserInfoByUserId} from "../../../lib/dataRetrieve/getUserInfo";
import {
  addItemToFolderOrSeries,
  setFolderToSeries,
  unSetFolderFromSeries,
  updateFolderWithNewName,
} from "../../../lib/dataRetrieve/handleFolder";
import {
  SessionData,
  SessionFlashData,
  commitSession,
  destroySession,
  getSession,
} from "../../session";

export async function action({request}: LoaderFunctionArgs) {
  const session: Session<SessionData, SessionFlashData> = await getSession(
    request.headers.get("cookie"),
  );
  if (!session.has("userId") || !session.data.userId) {
    session.flash("error", "User not login");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  if (isNaN(+session.data.userId)) {
    session.flash("error", "User id is not a number");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  let userData;
  if (session.data.userId) {
    userData = await getUserInfoByUserId(parseInt(session.data.userId));
  }

  if (!userData || !userData.history) {
    return json(
      {
        success: false,
        user: null,
        error: {msg: "User Information cannot load."},
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }

  const formData = await request.formData();

  const name = formData.get("name") as string;
  const isSeries = (formData.get("isSeries") as string) === "true";
  const items = formData.getAll("items") as string[];

  if (
    !name ||
    isSeries === null ||
    isSeries === undefined ||
    !items ||
    items.length === 0
  ) {
    return json({
      success: false,
      data: -1,
      error: {msg: "no form data provided"},
    });
  }

  const folderResult: {
    id: number;
    name: string;
    isSeries: boolean;
    libraryId: number | null;
  } | null = await createFolder(name, +session.data.userId);

  if (!folderResult) {
    console.log(folderResult);

    return json({
      success: false,
      data: -1,
      error: {msg: "Unable to create the folder"},
    });
  }

  let result: boolean = true;

  await updateFolderWithNewName(folderResult.id, name);

  if (isSeries) {
    await setFolderToSeries(folderResult.id);
  } else {
    await unSetFolderFromSeries(folderResult.id);
  }

  for (const i in items) {
    if (!i) {
      return json({
        success: false,
        data: undefined,
        error: {msg: "no form data provided"},
      });
    }

    let numItemID: number = -1;

    if (isNaN(+i)) {
      numItemID = (await getItemIdBySrcId(i)) ?? -1;
    } else if (!isNaN(+i)) {
      numItemID = +i;
    }

    result =
      result &&
      (await addItemToFolderOrSeries(
        +session.data.userId,
        folderResult.id,
        numItemID,
      ));
  }

  if (!result) {
    console.log(result);
    return json({
      success: false,
      data: -1,
      error: {msg: "Unable to create the folder"},
    });
  }

  // return redirect("/library/folder/" + folderResult.id);
  return json({
    success: true,
    data: folderResult.id,
    error: {msg: "able to create the folder"},
  });
}
