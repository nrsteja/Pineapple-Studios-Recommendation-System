import {ActionFunctionArgs, Session, json, redirect} from "@remix-run/node";
import {
  Form,
  Link,
  NavLink,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import React from "react";
import {
  SessionData,
  SessionFlashData,
  commitSession,
  getSession,
} from "src/app/session";

import {getUserByEmail} from "../../../lib/database/user";
import {TextField} from "../_components/TextField";

type FormData = {
  email: string;
  password: string;
};

export async function action({request}: ActionFunctionArgs) {
  const formData: globalThis.FormData = await request.formData();
  const data: FormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  let errors: {email: string; password: string} = {
    email: "",
    password: "",
  };
  const value = {};

  if (!data.email) {
    errors = {
      email: "Empty Email",
      password: "",
    };

    return json({
      errors,
      value,
    });
  }

  if (!data.password) {
    errors = {
      email: "",
      password: "Empty Password",
    };

    return json({
      errors,
      value,
    });
  }

  const user: {id: number; password: string} | null = await getUserByEmail(
    data.email,
  );

  if (!user) {
    errors = {
      email: "User not found",
      password: "",
    };

    return json({
      errors,
      value,
    });
  }

  if (user.password !== data.password) {
    errors = {
      email: "",
      password: "Wrong password",
    };

    return json({
      errors,
      value,
    });
  }

  const session: Session<SessionData, SessionFlashData> = await getSession();
  session.set("userId", user.id.toString());
  session.set("startTime", new Date());

  //returns a redirect response to a specific URL ("/tab"), along with the
  // cookie containing the session information.
  return redirect("/tab/1", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Login(): React.JSX.Element {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <div id={"login-form"}>
        <Form
          className="card w-full shrink-0 bg-base-100 shadow-2xl"
          method={"POST"}
          action={"/login?index"}>
          <fieldset
            className="card-body"
            disabled={navigation.state === "submitting"}>
            <TextField id={"email"} label={"Email"} type={"username"} />

            {actionData ? (
              <p className="form-control">
                <label htmlFor={"wrong-email"} className="label text-error">
                  {actionData?.errors.email}
                </label>
              </p>
            ) : null}

            <TextField
              id={"password"}
              label={"Password"}
              type={"password"}
              showToggle={true}
            />

            {actionData ? (
              <p className="form-control">
                <label htmlFor={"wrong-password"} className="label text-error">
                  {actionData?.errors.password}
                </label>
              </p>
            ) : null}

            <p className="form-control">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor={"forget-password"} className="label">
                <div className="tooltip" data-tip="Not Implemented Yet">
                  <Link
                    id="forget-password"
                    to="#"
                    className="link-diabled link-hover link label-text-alt">
                    Forget password?
                  </Link>
                </div>
              </label>
            </p>
            <p className="form-control mb-3 mt-3">
              <button
                type={"submit"}
                className="btn btn-primary group-invalid:pointer-events-none group-invalid:opacity-30">
                {navigation.state === "submitting" ? "Login..." : "Login"}
              </button>
            </p>
            <p className="text-center">
              {"Don't have an account? "}
              <Link className="underline" to="/login/signup">
                Register
              </Link>
            </p>
          </fieldset>
        </Form>

        <div className="divider">OR</div>
        <div className="card w-full shrink-0 bg-base-100 shadow-2xl">
          <Form className="card-body">
            <div className="form-control">
              <div className="tooltip w-full" data-tip="Not Implemented Yet">
                <NavLink
                  className="btn btn-disabled btn-neutral btn-wide min-w-full"
                  to="/login/gmail">
                  Login with Gmail
                </NavLink>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
