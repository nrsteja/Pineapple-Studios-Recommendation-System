import {LoaderFunctionArgs, json, redirect} from "@remix-run/node";
import {Outlet, useLoaderData, useNavigate} from "@remix-run/react";
import React from "react";

import {
  getItemInfoByItemId,
  getItemInfoBySrcId,
} from "../../../lib/dataRetrieve/getItemInfo";
import {destroySession, getSession} from "../../session";
import {ItemInfoMutex} from "./MUTEX";
import {BrowserTopNav} from "./components/BrowserTopNav";

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
  const user = +session.data.userId;

  if (!id) {
    return json({
      success: false,
      data: {},
      error: {context: "unknown url requested"},
    });
  }

  let itemInfo;
  if (isNaN(+id)) {
    await ItemInfoMutex.runExclusive(async () => {
      itemInfo = await getItemInfoBySrcId(id, user);
    });
  } else if (!isNaN(+id)) {
    itemInfo = await getItemInfoByItemId(+id, user);
  }

  const title: string = itemInfo?.title ?? "Browser Item";

  return json({
    success: true,
    data: {title: title},
    error: {},
  });
}

export default function tab(): React.JSX.Element {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const data = useLoaderData<typeof loader>();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = useNavigate();
  return (
    <>
      <BrowserTopNav
        leftSection={
          <>
            <a
              key={"btn-sm"}
              className="btn btn-circle lg:hidden"
              href="/tab/1">
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
              href="/tab/1">
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
          </>
        }
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
