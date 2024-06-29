import React from "react";

import {SimpleItem} from "../../../../lib/interfaces";
import TextHover from "../../_components/TextHover";

interface SelectableItemSmallCardProps {
  data: SimpleItem;
  selected: boolean;
  clickIt: () => void;
}

export const SelectableItemSmallCard: React.FC<
  SelectableItemSmallCardProps
> = ({data, selected, clickIt}: SelectableItemSmallCardProps) => {
  const type = ["Book", "Song", "Movie"];
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div>
        <div className="indicator my-4" onClick={clickIt}>
          <span className="indicator-item">
            <input
              type="checkbox"
              checked={selected}
              className="checkbox  checkbox-md  bg-base-300"
              onChange={() => {}}
            />
          </span>

          <div className="card h-44 max-h-44 w-32 max-w-32 bg-base-200 max-md:h-32 max-md:max-h-32 max-md:w-24 max-md:max-w-24 lg:h-44 lg:max-h-44 lg:w-32 lg:max-w-32 xl:h-52 xl:max-h-52 xl:w-40 xl:max-w-40">
            <div className="indicator">
              <span className="badge indicator-item badge-primary badge-sm indicator-start indicator-bottom">
                {type[data.type]}
              </span>
              <figure>
                <img
                  src={data.img}
                  alt={data.title || "Item"}
                  draggable={false}
                  className="h-32 max-h-32 min-h-32 w-32 min-w-32 max-w-32 rounded-md shadow-xl max-md:h-24 max-md:max-h-24 max-md:min-h-24 max-md:w-24 max-md:min-w-24 max-md:max-w-24 lg:h-32 lg:max-h-32  lg:min-h-32 lg:w-32 lg:min-w-32 lg:max-w-32 xl:h-40 xl:max-h-40  xl:min-h-40 xl:w-40  xl:min-w-40 xl:max-w-40"
                />
              </figure>
            </div>
            <div className="card-body m-0 p-0">
              <TextHover info={data.title} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
