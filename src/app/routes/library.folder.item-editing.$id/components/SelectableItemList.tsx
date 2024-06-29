import React from "react";

import {SimpleItem} from "../../../../lib/interfaces";
import InfoHover from "../../_components/InfoHover";
import {SelectableItemSmallCard} from "./SelectableItemSmallCard";

interface SelectableItemListProps {
  title?: string;
  items: SimpleItem[];
  selected?: Array<number | string>;
  info?: string;
  clickIt: (id: number | string) => void;
}

export const SelectableItemList: React.FC<SelectableItemListProps> = ({
  title = "",
  items,
  selected = [],
  info = "Select the Items",
  clickIt,
}: SelectableItemListProps) => {
  const twoDSelected: Iterable<readonly [string | number, boolean]> =
    selected.map((e: string | number) => {
      return [e, true];
    });

  const [selectedList, setSelectedList]: [
    Map<string | number, boolean>,
    React.Dispatch<React.SetStateAction<Map<string | number, boolean>>>,
  ] = React.useState<Map<number | string, boolean>>(
    new Map<number | string, boolean>(twoDSelected),
  );

  return (
    <div className="card w-full shadow-none ">
      {/*<div className="card-body">*/}
      <h2 className="card-title mx-2 text-2xl lg:text-3xl">
        {title}
        <InfoHover info={info} />
      </h2>
      <div className="m-6 ml-8 grid grid-cols-4 gap-1 max-md:m-0 max-md:ml-2 max-md:grid-cols-3 lg:m-0 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item: SimpleItem, index: number) => (
          // <div key={index} className="my-2 lg:my-4">
          <SelectableItemSmallCard
            key={index}
            data={item}
            selected={selectedList.get(item.id) ?? false}
            clickIt={() => {
              console.log("click click: " + item.id);
              setSelectedList(
                selectedList.set(item.id, !selectedList.get(item.id)),
              );
              clickIt(item.id);
            }}
          />
          // </div>
        ))}
        {/*</div>*/}
      </div>
    </div>
  );
};
