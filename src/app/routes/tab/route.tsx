import {
  LoaderFunctionArgs,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import {Outlet, useLoaderData, useLocation} from "@remix-run/react";
import React, {useEffect, useState} from "react";

import {getUserInfoByUserId} from "../../../lib/dataRetrieve/getUserInfo";
import {commitSession, destroySession, getSession} from "../../session";
import BtmNav from "../_components/BtmNav";
import TabTopNav from "./components/TabTopNav";
import TopNav from "./components/TopNav";

export async function loader({request}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    success: boolean;
    email: string | null;
    error: {msg: string} | undefined;
  }>
> {
  const session = await getSession(request.headers.get("cookie"));

  if (!session.has("userId")) {
    session.flash("error", "User not login");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  let userData;
  if (session.data.userId) {
    userData = await getUserInfoByUserId(parseInt(session.data.userId));
  }
  if (!userData || !userData.history) {
    return json(
      {
        success: false,
        email: null,
        error: {msg: "User Information cannot load."},
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }

  const email = userData.email;

  return json(
    {
      success: true,
      email: email,
      error: undefined,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
}

export default function tab(): React.JSX.Element {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const data = useLoaderData<typeof loader>();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [title, setTitle] = useState("Pineapple Studio");

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const location = useLocation();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect((): void => {
    const regex: RegExp = /\/tab\/(\d).*/gm;

    const m: RegExpExecArray | null = regex.exec(location.pathname);
    const type: string = m ? m.at(1) ?? "" : "";
    let newTitle: string = "Pineapple Studio";

    switch (type) {
      case "1":
        newTitle = "Home";
        break;
      case "2":
        newTitle = "Library";
        break;
      case "3":
        newTitle = "Search Online";
        break;
      case "4":
        newTitle = "Profile";
        break;
    }

    if (newTitle !== title) {
      setTitle(newTitle);
    }
  }, [data, setTitle, title, location]);

  return (
    <>
      <TabTopNav title={title} additionalClassName={"lg:hidden"} />
      <TopNav
        email={
          data.success && data && data.email ? data.email : "Pineapple User"
        }
      />
      <div className="mx-6 lg:mx-12">
        <Outlet />
      </div>
      <BtmNav />
    </>
  );
}
