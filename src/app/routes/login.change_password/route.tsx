import {ActionFunctionArgs, json, redirect} from "@remix-run/node";
import {Form, useActionData, useNavigation} from "@remix-run/react";
import React from "react";

import {getUserByEmail, updatePassword} from "../../../lib/database/user";
import {TextField} from "../_components/TextField";

//import {email} from "../login.otp"

//import {email} from "../login.otp"

type FormData = {
  password: string;
  confirm_password: string;
};

export async function action({request}: ActionFunctionArgs) {
  const formData = await request.formData();
  const data: FormData = {
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const errors: {[key: string]: string} = {};

  if (!data.password) {
    errors.password = "Invalid Password: Password cannot be empty";
  } else {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(data.password)) {
      errors.password =
        "Password must be at least 8 characters long, include a number, an uppercase letter, and a symbol.";
    }
  }

  if (data.confirm_password !== data.password) {
    errors.confirm_password = "Passwords do not match";
  }

  if (Object.keys(errors).length > 0) {
    return json({
      errors,
      value: data,
    });
  }

  // Assume that email is the identifier for the user and is available in the session or from another source.
  const email = "john@gmail.com";
  const user = await getUserByEmail(email);
  if (user) {
    // Assuming that the updatePassword function takes the userId and the new password as arguments.
    await updatePassword(user.id.toString(), data.password);
    return redirect("/login");
  } else {
    // If the user is not found, send an error message.
    return json({error: "User not found."});
  }
}

type ActionData = {
  errors?: {
    password?: string;
    confirm_password?: string;
  };
};

export default function tab_index(): React.JSX.Element {
  const navigation = useNavigation();
  const actionData = useActionData<ActionData>();

  return (
    <>
      <div id={"login-form"}>
        <Form
          className="card w-full shrink-0 bg-base-100 shadow-2xl"
          method={"POST"}
          action={"/login/change_password"}>
          <fieldset
            className="card-body"
            disabled={navigation.state === "submitting"}>
            <TextField
              id={"password"}
              label={"New Password"}
              type={"password"}
            />

            {actionData?.errors?.password && (
              <p className="form-control">
                <label htmlFor="wrong-password" className="label text-error">
                  {actionData.errors.password}
                </label>
              </p>
            )}

            <TextField
              id={"confirm_password"}
              label={"Confirm Password"}
              type={"password"}
            />

            {actionData?.errors?.confirm_password && (
              <p className="form-control">
                <label
                  htmlFor="wrong-confirm_password"
                  className="label text-error">
                  {actionData.errors.confirm_password}
                </label>
              </p>
            )}

            <p className="form-control mb-3 mt-6">
              <button
                type={"submit"}
                className="btn btn-primary group-invalid:pointer-events-none group-invalid:opacity-30">
                {navigation.state === "submitting"
                  ? "Resetting up..."
                  : "Reset Password"}
              </button>
            </p>
          </fieldset>
        </Form>
      </div>
    </>
  );
}
