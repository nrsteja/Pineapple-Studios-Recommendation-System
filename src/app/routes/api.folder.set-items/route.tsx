import {
  ActionFunctionArgs,
  Session,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";

import {getFolderInfo} from "../../../lib/dataRetrieve/getFolderInfo";
import {getItemIdBySrcId} from "../../../lib/dataRetrieve/getItemInfo";
import {
  addItemToFolderOrSeries,
  removeItemFromFolderOrSeries,
} from "../../../lib/dataRetrieve/handleFolder";
import {Folder} from "../../../lib/interfaces";
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

  const formData = await request.formData();

  const id = formData.get("folder") as string;
  const strItems = formData.getAll("item") as string[];

  const items: number[] = strItems.map((i) => {
    let numItemID: number = -1;

    if (isNaN(+i)) {
      const newItemId = getItemIdBySrcId(i);
      newItemId
        .then((value) => {
          if (!value) {
            return json({
              success: false,
              data: undefined,
              error: {msg: "item Id cannot find"},
            });
          }
          numItemID = value ?? -1;
        })
        .catch((error) => {
          return json({
            success: false,
            data: undefined,
            error: {msg: "no form data provided. " + error},
          });
        });
    } else if (!isNaN(+i)) {
      numItemID = +i;
    }
    return numItemID;
  });

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

  const userId: number = +session.data.userId;

  const itemInfo: null | Folder = await getFolderInfo(numID, userId);

  if (!itemInfo) {
    return json({
      success: false,
      data: undefined,
      error: {msg: "no form data provided"},
    });
  }

  const oldTag: number[] = itemInfo.items.map((e) => e.id as number);

  const addingItems: number[] =
    items.filter((x: number) => !oldTag.includes(x)) ?? [];
  const deleteItems: number[] =
    oldTag.filter((x: number) => !items.includes(x)) ?? [];

  let result: boolean = true;
  for (const i of addingItems) {
    if (!i) {
      return json({
        success: false,
        data: undefined,
        error: {msg: "no form data provided"},
      });
    }

    result =
      result && (await addItemToFolderOrSeries(+session.data.userId, numID, i));
  }

  for (const i of deleteItems) {
    if (!i) {
      return json({
        success: false,
        data: undefined,
        error: {msg: "no form data provided"},
      });
    }

    result =
      result &&
      (await removeItemFromFolderOrSeries(+session.data.userId, numID, i));
  }

  if (!result) {
    console.log(result);

    return json({
      success: false,
      error: {msg: "Unable to add some items to libraries"},
    });
  }
  console.log("REDIRECT");
  // return redirect("/library/folder/" + numID, {status: 302});
  return json({
    success: true,
    error: {msg: "able to set some items of libraries"},
  });
}
