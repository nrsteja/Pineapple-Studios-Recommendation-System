import {LoaderFunctionArgs, MetaFunction, redirect} from "@remix-run/node";

import {commitSession, getSession} from "../../session";
import TestComponent from "../_components/TestComponent";

export const meta: MetaFunction = () => {
  return [
    {title: "New Remix App"},
    {
      name: "description",
      content: "Welcome to Remix!",
    },
  ];
};

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));

  if (!session.has("userId")) {
    session.flash("error", "User not login");
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return redirect("/tab/1", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Index() {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.8",
      }}>
      <h1>Welcome to Login</h1>
      <TestComponent />
    </div>
  );
}
