import {LoaderFunctionArgs, redirect} from "@remix-run/node";

export async function loader({params}: LoaderFunctionArgs) {
  const id: string | undefined = params.id;
  if (!id) {
    return redirect("/tab/2");
  }
  return null;
}
