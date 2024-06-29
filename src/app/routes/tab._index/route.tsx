import {TypedResponse, redirect} from "@remix-run/node";

export async function loader(): Promise<TypedResponse<never>> {
  return redirect("/tab/1");
}
