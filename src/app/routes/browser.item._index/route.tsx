import {LoaderFunctionArgs, redirect} from "@remix-run/node";

export async function loader({params, request}: LoaderFunctionArgs) {
  const paramId = params.id;
  const url = new URL(request.url);
  const searchId = url.searchParams.get("id");

  if (
    (!searchId && !paramId) ||
    (searchId && paramId && searchId !== paramId)
  ) {
    return redirect("/tab/1");
  }

  const combineId = paramId ?? searchId;

  if (!combineId) {
    return redirect("/tab/1");
  }
  return redirect("/browser/item-page/?id=" + combineId);
}
