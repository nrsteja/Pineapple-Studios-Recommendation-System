import React from "react";

import {People} from "../../../lib/interfaces";

interface ItemsListProps {
  title?: string;
  items: People[];
}

export const SmallPeopleList: React.FC<ItemsListProps> = ({
  title = "People",
  items,
}) => {
  return (
    <div className="card w-full">
      <div className="card-body pt-0">
        <h2 className="card-title mx-2 text-2xl lg:text-3xl">{title}</h2>
        <div className="text-black-100 m-6 grid grid-cols-4 gap-1 max-md:m-0 max-md:grid-cols-3 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={index}
              className={
                "grid min-w-24 grid-cols-1 content-center justify-items-center rounded-full bg-accent"
              }>
              <div className={"mx-4 my-2"}>
                <h3 className={"block text-center font-bold text-black"}>
                  {item.name}
                </h3>
                <p className={"block text-center text-sm text-black"}>
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
