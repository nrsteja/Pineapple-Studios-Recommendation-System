import {ActionFunctionArgs, Session, json, redirect} from "@remix-run/node";
import {ItemInfo} from "src/lib/interfaces";

import {
  getItemIdBySrcId,
  getItemInfoByItemId,
  getItemInfoBySrcId,
} from "../../../lib/dataRetrieve/getItemInfo";
import {
  addTagForItem,
  removeTagForItem,
} from "../../../lib/dataRetrieve/handleItemTag";
import {
  SessionData,
  SessionFlashData,
  destroySession,
  getSession,
} from "../../session";
import {ItemInfoMutex} from "../browser/MUTEX";

export async function action({request}: ActionFunctionArgs) {
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

  const userId: number = +session.data.userId;

  let itemInfo: ItemInfo | undefined;
  if (isNaN(+id)) {
    await ItemInfoMutex.runExclusive(async () => {
      itemInfo = await getItemInfoBySrcId(id, userId);
    });
  } else if (!isNaN(+id)) {
    itemInfo = await getItemInfoByItemId(+id, +session.data.userId);
  }

  if (!itemInfo) {
    return json({
      success: false,
      data: undefined,
      error: {msg: "no form data provided"},
    });
  }

  const oldTag: string[] = itemInfo.tag;

  const addingTags: string[] =
    tags.filter((x: string) => !oldTag.includes(x)) ?? [];
  const deleteTags: string[] =
    oldTag.filter((x: string) => !tags.includes(x)) ?? [];

  let result: boolean = true;
  for (const i of addingTags) {
    console.log(i);
    if (!i) {
      return json({
        success: false,
        data: undefined,
        error: {msg: "no form data provided"},
      });
    }

    const addingResult:
      | {id: number; name: string; userId: number; itemId: number}
      | {error: string}
      | undefined = await addTagForItem(+session.data.userId, i, numID);

    if (!addingResult) {
      result = false;
    } else if ("error" in addingResult) {
      return json({
        success: false,
        data: undefined,
        error: {msg: addingResult.error},
      });
    }
  }

  for (const i of deleteTags) {
    console.log(i);
    if (!i) {
      return json({
        success: false,
        data: undefined,
        error: {msg: "no form data provided"},
      });
    }

    const addingResult:
      | undefined
      | null
      | {
          id: number;
          name: string;
          userId: number;
          itemId: number;
        }
      | {error: string} = await removeTagForItem(
      +session.data.userId,
      i,
      numID,
    );

    if (!addingResult) {
      result = false;
    } else if ("error" in addingResult) {
      return json({
        success: false,
        data: undefined,
        error: {msg: addingResult.error},
      });
    }
  }

  if (!result) {
    return json({
      success: false,
      error: {msg: "Unable to add item to tags: " + tags.toString()},
    });
  }

  // return redirect("/library/item/" + id);

  return json({
    success: true,
    error: {msg: "able to add item to tags: " + tags.toString()},
  });
}
