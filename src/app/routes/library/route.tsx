import {LoaderFunctionArgs, json, redirect} from "@remix-run/node";
import {Outlet, useLoaderData} from "@remix-run/react";
import React from "react";

import {getFolderInfo} from "../../../lib/dataRetrieve/getFolderInfo";
import {
  getItemInfoByItemId,
  getItemInfoBySrcId,
} from "../../../lib/dataRetrieve/getItemInfo";
import {Folder} from "../../../lib/interfaces";
import {destroySession, getSession} from "../../session";
import {ItemInfoMutex} from "../browser/MUTEX";
import LibraryTopNav from "./components/LibraryTopNav";

export async function loader({params, request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));

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

  const id = params.id;
  if (!id) {
    return json({
      success: false,
      data: {},
      error: {context: "unknown url requested"},
    });
  }

  const regex = new RegExp(
    "^https?:\\/\\/[a-zA-z\\-0-9.]+:?\\d{0,5}\\/library\\/(folder|item)\\/(e?d?i?t?i?n?g?)\\/?\\d+$",
    "gm",
  );

  const m = regex.exec(request.url);
  const type = m ? m.at(1) ?? "" : "";

  const isEditing: boolean = m ? m.at(2) === "editing" : false;

  if (!type) {
    return json({
      success: false,
      data: {},
      error: {context: "unknown url requested"},
    });
  }

  let title: string | undefined = undefined;

  const userId = +session.data.userId;

  if (type === "folder") {
    const folderInfo: Folder | null = await getFolderInfo(
      +id,
      +session.data.userId,
    );
    title = folderInfo?.name;
  } else if (type === "item") {
    let itemInfo;
    if (isNaN(+id)) {
      await ItemInfoMutex.runExclusive(async () => {
        itemInfo = await getItemInfoBySrcId(id, userId);
      });
    } else if (!isNaN(+id)) {
      itemInfo = await getItemInfoByItemId(+id, +session.data.userId);
    }
    title = itemInfo?.title;
  }

  if (!title) {
    if (type === "folder") {
      return json({
        success: true,
        data: {title: "Browser Folder"},
        error: null,
      });
    } else if (type === "item") {
      return json({
        success: true,
        data: {title: "Browser Item"},
        error: null,
      });
    }
  }

  if (type === "folder") {
    title = "Folder: " + title;
  }

  if (isEditing) {
    title = title + " Editing";
  }

  return json({
    success: true,
    data: {title: title},
    error: null,
  });
}

export default function tab(): React.JSX.Element {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <LibraryTopNav
        leftSection={[
          <div key={"btn-sm"}>
            <a
              key={"btn-sm"}
              className="btn btn-circle lg:hidden"
              href="/tab/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
                />
              </svg>
            </a>

            <a
              key={"btn-lg"}
              className="btn max-lg:hidden lg:visible"
              href="/tab/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
                />
              </svg>
              Back
            </a>
          </div>,
        ]}
        title={
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          !data.success ? "Pineapple Studio" : data.data!.title
        }
      />
      <Outlet />
    </>
  );
}
