import {LoaderFunctionArgs, json} from "@remix-run/node";

import {getItemInfoExample} from "../../../lib/database/functions";

export async function loader({params}: LoaderFunctionArgs) {
  const id: string | undefined = params.id;

  if (!id) {
    json({
      success: false,
      data: {},
      error: {msg: "no id requested"},
    });
    return null;
  }
  const data = getItemInfoExample(id);

  console.log({
    success: true,
    data: data,
    error: {},
  });
  return null;
}
