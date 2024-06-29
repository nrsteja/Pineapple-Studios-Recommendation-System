import {LoaderFunctionArgs, Session, json, redirect} from "@remix-run/node";

import {createFolder} from "../../../lib/dataRetrieve/createFolder";
import {getUserInfoByUserId} from "../../../lib/dataRetrieve/getUserInfo";
import {
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

  if (!name || isSeries === null || isSeries === undefined) {
    return json({
      success: false,
      data: undefined,
      error: {
        msg: "no form data provided name: " + name + " isSeries: " + isSeries,
      },
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
      error: {msg: "Unable to create the folder"},
    });
  }

  await updateFolderWithNewName(folderResult.id, name);

  if (isSeries && !folderResult.isSeries) {
    const aResult = await setFolderToSeries(folderResult.id);
    if (aResult) {
      return json({
        success: false,
        data: -1,
        error: {msg: aResult.error},
      });
    }
  } else if (!isSeries && folderResult.isSeries) {
    const aResult = await unSetFolderFromSeries(folderResult.id);
    if (aResult) {
      return json({
        success: false,
        data: -1,
        error: {msg: aResult.error},
      });
    }
  }

  return json({
    success: true,
    data: folderResult.id,
    error: {msg: "able to create the folder"},
  });
}
