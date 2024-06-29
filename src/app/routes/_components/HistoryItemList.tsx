import React from "react";

import {SimpleItem} from "../../../lib/interfaces";
import InfoHover from "./InfoHover";
import {ItemSmallCard} from "./ItemSmallCard";

interface ItemsListProps {
  title?: string;
  items: SimpleItem[];
  info?: string;
}

export const HistoryItemList: React.FC<ItemsListProps> = ({
  title = "",
  items,
  info = "This is your " + title.toLowerCase(),
}) => {
  return (
    <div className="card w-full shadow-none">
      <div className="card-body">
        <h2 className="card-title mx-2 text-2xl lg:text-3xl">
          {title}
          <InfoHover info={info} />
        </h2>
        <div className="m-6 grid grid-cols-4 gap-1 max-md:m-0 max-md:grid-cols-3 lg:m-0 lg:grid-cols-3 xl:grid-cols-3">
          {items.map((item, index) => (
            <div key={index} className="my-2 lg:my-4">
              <ItemSmallCard data={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
