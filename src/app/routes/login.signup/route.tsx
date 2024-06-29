import {
  ActionFunctionArgs,
  Session,
  SessionData,
  json,
  redirect,
} from "@remix-run/node";
import {Form, NavLink, useActionData, useNavigation} from "@remix-run/react";
import React, {useState} from "react";
import {SessionFlashData, commitSession, getSession} from "src/app/session";
import {createNewUser} from "src/lib/dataRetrieve/createUser";

import {TextField} from "../_components/TextField";

//import {action} from "../../../lib/connection/signup"

type FormData = {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export async function action({request}: ActionFunctionArgs) {
  const formData = await request.formData();
  const data: FormData = {
    email: formData.get("email") as string,
    userName: formData.get("username") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const errors: {[key: string]: string} = {};

  if (!data.userName) {
    errors.userName = "Invalid Name";
  }

  if (!data.email) {
    errors.email = "Invalid Email";
  }

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  if (!data.password || !passwordRegex.test(data.password)) {
    errors.password =
      "Password must be at least 8 characters long, include a number, an uppercase letter, and a symbol.";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  if (Object.keys(errors).length > 0) {
    return json({
      errors,
      value: data,
    });
  }

  const userResult = await createNewUser(
    data.email,
    data.userName,
    data.password,
  );

  if (!userResult || (userResult && "error" in userResult)) {
    errors.email = userResult ? userResult.error : "";
    return json({
      errors,
      value: data,
    });
  }

  // User creation was successful

  const session: Session<SessionData, SessionFlashData> = await getSession();
  session.set("userId", userResult.id.toString());
  session.set("startTime", new Date());

  return redirect("/profile/editing/first-time", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function tab_index(): React.JSX.Element {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <div id={"login-form"}>
        <Form
          className="card w-full shrink-0 bg-base-100 shadow-2xl"
          method={"POST"}
          action={"/login/signup"}>
          <fieldset
            className="card-body"
            disabled={navigation.state === "submitting"}>
            <TextField id={"username"} label={"Username"} type={"username"} />

            {actionData ? (
              <p className="form-control">
                <label htmlFor={"wrong-email"} className="label text-error">
                  {actionData?.errors.name}
                </label>
              </p>
            ) : null}

            <TextField id={"email"} label={"Email"} type={"email"} />

            {actionData ? (
              <p className="form-control">
                <label htmlFor={"wrong-email"} className="label text-error">
                  {actionData?.errors.email}
                </label>
              </p>
            ) : null}

            <TextField
              id="password"
              label="Password"
              type="password"
              showToggle={true}
            />

            {actionData ? (
              <p className="form-control max-sm:max-w-64 max-xs:max-w-48 sm:w-80">
                <label htmlFor={"wrong-password"} className="label text-error">
                  {actionData?.errors.password}
                </label>
              </p>
            ) : null}

            <TextField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              showToggle={true}
            />

            {actionData && actionData.errors.confirmPassword ? (
              <p className="form-control">
                <label
                  htmlFor={"wrong-confirm-password"}
                  className="label text-error">
                  {actionData.errors.confirmPassword}
                </label>
              </p>
            ) : null}

            <p className="form-control mb-3 mt-6">
              <button
                type={"submit"}
                className="btn btn-primary group-invalid:pointer-events-none group-invalid:opacity-30">
                {navigation.state === "submitting"
                  ? "Signing up..."
                  : "Sign Up"}
              </button>
            </p>
            <p className="text-center">
              Already have an account?{" "}
              <NavLink className="underline" to="/login">
                Login
              </NavLink>
            </p>
          </fieldset>
        </Form>
      </div>
    </>
  );
}
