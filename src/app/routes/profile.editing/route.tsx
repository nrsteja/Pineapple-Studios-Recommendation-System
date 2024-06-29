import {LoaderFunctionArgs, json, redirect} from "@remix-run/node";
import {Outlet, useLoaderData} from "@remix-run/react";
import React from "react";

import {destroySession, getSession} from "../../session";
import LibraryTopNav from "../library/components/LibraryTopNav";

export async function loader({request}: LoaderFunctionArgs) {
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

  const regex = new RegExp(
    "^https?:\\/\\/[a-zA-z\\-0-9.]+:?\\d{0,5}\\/profile\\/editing\\/(f?i?r?s?t?-?t?i?m?e?)$",
    "gm",
  );

  const m = regex.exec(request.url);

  const isFirstTime: boolean = m ? m.at(1) === "first-time" : false;

  let title: string | undefined = undefined;

  if (isFirstTime) {
    title = "Adding Preference";
  } else {
    title = "Edit Profile";
  }

  return json({
    success: true,
    data: {title: title},
    error: null,
  });
}

export default function tab_index(): React.JSX.Element {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <LibraryTopNav
        leftSection={[
          <>
            <a
              key={"btn-sm"}
              className="btn btn-circle lg:hidden"
              href="/tab/4">
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
              href="/tab/4">
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
          </>,
        ]}
        title={
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          !data.success ? "Profile Editing" : data.data!.title
        }
      />
      <Outlet />
    </>
  );
}
