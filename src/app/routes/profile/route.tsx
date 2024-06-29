import {LoaderFunctionArgs, redirect} from "@remix-run/node";
import {Outlet} from "@remix-run/react";
import React from "react";

import {destroySession, getSession} from "../../session";

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));

  if (!session.has("userId")) {
    session.flash("error", "User not login");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
  return session.data;
}

export default function tab_index(): React.JSX.Element {
  return (
    <>
      <Outlet />
    </>
  );
}
