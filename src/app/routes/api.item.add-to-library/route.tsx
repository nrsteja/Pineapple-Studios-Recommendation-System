import {
  ActionFunctionArgs,
  Session,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";

import {
  getItemInfoByItemId,
  getItemInfoBySrcId,
} from "../../../lib/dataRetrieve/getItemInfo";
import {addItemToLibrary} from "../../../lib/dataRetrieve/handleLibraryItems";
import {ItemInfo} from "../../../lib/interfaces";
import {
  SessionData,
  SessionFlashData,
  destroySession,
  getSession,
} from "../../session";

export async function action({
  request,
}: ActionFunctionArgs): Promise<
  TypedResponse<{success: boolean; error: {msg: string}}> | TypedResponse<never>
> {
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

  const formData: FormData = await request.formData();

  const id: string = formData.get("id") as string;

  if (!id) {
    return json({
      success: false,
      data: undefined,
      error: {msg: "no form data provided"},
    });
  }

  let numID: number = -1;
  if (isNaN(+id)) {
    numID =
      ((await getItemInfoBySrcId(id, +session.data.userId)) ?? {id: -1}).id ??
      -1;
  } else if (!isNaN(+id)) {
    numID = +id;
  }

  const itemInfo: ItemInfo | undefined = await getItemInfoByItemId(
    numID,
    +session.data.userId,
  );

  if (itemInfo?.isInLibrary) {
    return redirect("/library/item/" + id);
  }

  const result: boolean = await addItemToLibrary(+session.data.userId, numID);

  if (!result) {
    return json({
      success: false,
      error: {msg: "Unable to add item to library"},
    });
  }

  return redirect("/library/item/" + id);
}
