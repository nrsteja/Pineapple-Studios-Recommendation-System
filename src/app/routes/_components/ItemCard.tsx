import React, {useState} from "react";

import {SimpleItem} from "../../../lib/interfaces";
import {HeartButton} from "./HeartButton";

interface ItemCardProps {
  data: SimpleItem;
  func: () => void;
  btnContent?: React.ReactNode;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  data,
  func,
  btnContent = (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24">
        <path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" fill="#ffffff" />
      </svg>
      Add to Library
    </>
  ),
}: ItemCardProps) => {
  const [fav, setFav] = useState(false);

  const type = ["Book", "Song", "Movie"];

  return (
    <div className="col-span group relative m-3 h-[12vw] overflow-visible">
      <a href={`/browser/item/${data.id}`} className="relative h-[12vw] w-full">
        <img
          src={data.img}
          alt={data.title || "Item"}
          draggable={false}
          className="-z-40 h-[12vw] w-full cursor-pointer rounded-md object-cover shadow-xl transition group-hover:opacity-90 sm:group-hover:opacity-0"
        />
        {data.tag.find((str) => str === "favourite") && (
          <span className="absolute right-1 top-7 flex h-1 w-full flex-row items-end transition group-hover:opacity-90 sm:group-hover:opacity-0">
            <HeartButton onClick={() => setFav(!fav)} type={data.type} />
          </span>
        )}
      </a>

      <div className="duration-400 invisible absolute top-0 w-full scale-0 opacity-0 transition delay-100 hover:z-50 group-hover:z-50 group-hover:-translate-y-[6vw] group-hover:scale-110 group-hover:opacity-100 sm:visible">
        <a href={`/browser/item/${data.id}`}>
          <img
            src={data.img}
            alt={data.title || "Item"}
            draggable={false}
            className="duration h-[12vw] w-full cursor-pointer rounded-t-md object-cover shadow-xl transition"
          />
        </a>
        <div className="absolute z-50 w-full rounded-b-md bg-zinc-800 p-2 shadow-md transition lg:p-4">
          <button onClick={func} className="btn bg-zinc-500 text-white">
            {btnContent}
          </button>
          <p className="ml-1 mt-4 font-semibold text-green-400">
            <span className="text-white">{data.title}</span>
          </p>
          <div className="ml-1 mt-4 flex flex-row items-center gap-2 text-[8px] text-white lg:text-sm">
            <p>Type: {type[data.type]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
