import {LoaderFunctionArgs, Session, json, redirect} from "@remix-run/node";

import {getItemIdBySrcId} from "../../../lib/dataRetrieve/getItemInfo";
import {removeItemFromFolderOrSeries} from "../../../lib/dataRetrieve/handleFolder";
import {
  SessionData,
  SessionFlashData,
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

  const formData = await request.formData();

  const id = formData.get("item") as string;
  const folders = formData.getAll("folder") as string[];

  if (!id) {
    return json({
      success: false,
      data: undefined,
      error: {msg: "no form data provided"},
    });
  }

  let numID: number = -1;
  if (isNaN(+id)) {
    numID = (await getItemIdBySrcId(id)) ?? -1;
  } else if (!isNaN(+id)) {
    numID = +id;
  }

  let result: boolean = true;
  for (const i of folders) {
    if (!i) {
      return json({
        success: false,
        data: undefined,
        error: {msg: "no form data provided"},
      });
    }

    let numFolderID: number = -1;
    if (!isNaN(+i)) {
      numFolderID = +i;
    }

    result =
      result &&
      (await removeItemFromFolderOrSeries(
        +session.data.userId,
        numFolderID,
        numID,
      ));
  }

  if (!result) {
    console.log(result);

    return json({
      success: false,
      error: {msg: "Unable to remove item from some libraries"},
    });
  }

  return redirect("/library/item/" + id);
}
