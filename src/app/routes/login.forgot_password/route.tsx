import {ActionFunctionArgs, json, redirect} from "@remix-run/node";
import {Form, Link, useActionData, useNavigation} from "@remix-run/react";
import React from "react";

import {getUserByEmail} from "../../../lib/database/user";
import {TextField} from "../_components/TextField";

//import {email} from "../login.otp"

//import {email} from "../login.otp"

type FormData = {
  email: string;
};

export async function action({request}: ActionFunctionArgs) {
  const formData = await request.formData();
  const data: FormData = {
    email: formData.get("email") as string,
  };

  const user = await getUserByEmail(data.email);

  const errors: {[key: string]: string} = {};

  if (!user) {
    errors.email = "Sorry you are not registered yet!";
  }
  if (data.email == "") {
    errors.email = "Invalid email: Email cannot be empty";
  }

  if (Object.keys(errors).length > 0) {
    return json({
      errors,
      value: data,
    });
  }

  if (user) {
    return redirect(
      "/login/change_password?email=${encodeURIComponent(user.email)}",
    );
  }
}

export default function tab_index(): React.JSX.Element {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <div id={"login-form"}>
        <Form
          className="card w-full shrink-0 bg-base-100 shadow-2xl"
          method={"POST"}
          action={"/login/forgot_password"}>
          <fieldset
            className="card-body"
            disabled={navigation.state === "submitting"}>
            <TextField id={"email"} label={"Email"} type={"email"} />

            {actionData ? (
              <p className="form-control">
                <label htmlFor={"wrong-email"} className="label text-error">
                  {actionData?.errors.email}
                </label>
              </p>
            ) : null}

            <p className="form-control mb-3 mt-6">
              <button
                type={"submit"}
                className="btn btn-primary group-invalid:pointer-events-none group-invalid:opacity-30">
                {navigation.state === "submitting"
                  ? "Resetting up..."
                  : "Reset Password"}
              </button>
            </p>
            <p className="text-center">
              Back to login page?{" "}
              <Link className="text-blue-700 underline" to="/login">
                Login
              </Link>
            </p>
          </fieldset>
        </Form>
      </div>
    </>
  );
}
