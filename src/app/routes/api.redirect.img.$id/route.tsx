import {LoaderFunctionArgs} from "@remix-run/node";

import {getItemIdBySrcId} from "../../../lib/dataRetrieve/getItemInfo";
import {getItemById} from "../../../lib/database/item";

export async function loader({params}: LoaderFunctionArgs) {
  const id = params.id;

  if (!id) {
    const imgUrl: string = "https://picsum.photos/600.webp";

    const img: Response = await fetch(imgUrl);

    return new Response(img.body, {
      status: 200,
      headers: {
        "Content-Type": "application/image",
      },
    });
  }

  let imgUrl = "https://picsum.photos/600.webp";

  let item;
  if (isNaN(+id)) {
    const newId = await getItemIdBySrcId(id);
    if (newId) {
      item = await getItemById(newId);
    }
  } else if (!isNaN(+id)) {
    item = await getItemById(+id);
  }

  if (item && item.image && item.image != "") {
    imgUrl = item.image;
  }

  const img: Response = await fetch(imgUrl);

  return new Response(img.body, {
    status: 200,
    headers: {
      "Content-Type": "application/image",
    },
  });
}
