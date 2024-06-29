import {LoaderFunctionArgs, Session, json, redirect} from "@remix-run/node";

import {getItemIdBySrcId} from "../../../lib/dataRetrieve/getItemInfo";
import {addItemToFolderOrSeries} from "../../../lib/dataRetrieve/handleFolder";
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

  const id = formData.get("folder") as string;
  const items = formData.getAll("items") as string[];

  if (!id) {
    return json({
      success: false,
      data: undefined,
      error: {msg: "no form data provided"},
    });
  }

  let numID: number = -1;
  if (!isNaN(+id)) {
    numID = +id;
  }

  let result: boolean = true;
  for (const i of items) {
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
      (await addItemToFolderOrSeries(+session.data.userId, numID, numItemID));
  }

  if (!result) {
    console.log(result);

    return json({
      success: false,
      error: {msg: "Unable to add some items to libraries"},
    });
  }

  return redirect("/library/folder/" + id);
}
