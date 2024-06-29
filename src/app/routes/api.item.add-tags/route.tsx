import {LoaderFunctionArgs, Session, json, redirect} from "@remix-run/node";

import {getItemIdBySrcId} from "../../../lib/dataRetrieve/getItemInfo";
import {addTagForItem} from "../../../lib/dataRetrieve/handleItemTag";
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
  const tags = formData.getAll("tag") as string[];
  console.log(tags);
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
  for (const i of tags) {
    console.log(i);
    if (!i) {
      return json({
        success: false,
        data: undefined,
        error: {msg: "no form data provided"},
      });
    }

    const returnResult:
      | {id: number; name: string; userId: number; itemId: number}
      | {error: string}
      | undefined = await addTagForItem(+session.data.userId, i, numID);

    if (!returnResult) {
      result = false;
    } else if ("error" in returnResult) {
      return json({
        success: false,
        data: undefined,
        error: {msg: returnResult.error},
      });
    }
  }

  if (!result) {
    console.log(result);

    return json({
      success: false,
      error: {msg: "Unable to add item to tags: " + tags.toString()},
    });
  }

  return json({
    success: true,
    error: {msg: "able to add item to tags: " + tags.toString()},
  });
}
