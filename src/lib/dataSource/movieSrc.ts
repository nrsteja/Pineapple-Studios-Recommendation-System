import {json} from "@remix-run/node";

export function hello(name: string) {
  return json({name: name});
}
