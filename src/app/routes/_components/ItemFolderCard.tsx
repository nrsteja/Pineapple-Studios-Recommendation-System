import React from "react";

import {Folder} from "../../../lib/interfaces";

interface ItemCardProps {
  data: Folder;
}

export const ItemFolderCard: React.FC<ItemCardProps> = ({
  data,
}: ItemCardProps) => {
  // const [fav, setFav] = useState(false);

  return (
    <div className="col-span group relative m-3 h-[12vw]">
      <a href={`/library/folder/${data.id}`}>
        <img
          src={data.img}
          alt={data.name || "Folder"}
          draggable={false}
          className="h-[12vw] w-full cursor-pointer rounded-md object-cover shadow-xl transition group-hover:opacity-90 sm:group-hover:opacity-0"
        />
      </a>
      <div className="duration-400 invisible absolute top-0 z-50 w-full scale-0 opacity-0 transition delay-100 group-hover:-translate-y-[6vw] group-hover:scale-110 group-hover:opacity-100 sm:visible">
        <a href={`/library/folder/${data.id}`}>
          <img
            src={data.img}
            alt={data.name || "Folder"}
            draggable={false}
            className="duration h-[12vw] w-full cursor-pointer rounded-t-md object-cover shadow-xl transition"
          />
        </a>
        <div className="absolute z-50 w-full rounded-b-md bg-zinc-800 p-2 shadow-md transition lg:p-4">
          <p className="ml-1 mt-4 font-semibold text-green-400">
            <span className="text-white">{data.name}</span>
          </p>
          <div className="ml-1 mt-4 flex flex-row items-center gap-2 text-[8px] text-white lg:text-sm">
            <p>Type: {data.isSeries ? "Series" : "Folder"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
