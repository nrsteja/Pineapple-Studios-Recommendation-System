import {LoaderFunctionArgs, redirect} from "@remix-run/node";

export async function loader({params}: LoaderFunctionArgs) {
  const id = params.id;
  if (!id) {
    return redirect("/tab/2");
  }
  return null;
}
