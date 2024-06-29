import React from "react";

import Tag from "./Tag";

// interface Category {
//   name: string;
//   values: string[];
// }

interface TagsProps {
  tag: string[];
  colors?: string[];
  buttonType?: "close" | "plus" | "none";
}

export const TagList: React.FC<TagsProps> = ({
  tag,
  colors = ["neutral", "primary", "secondary"],
  buttonType = "none",
}) => {
  function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return (
    <>
      <div className="flex flex-row flex-wrap justify-around overflow-x-auto">
        {tag.map((tag, i) => {
          if (tag !== "") {
            return (
              <Tag
                key={"tag-" + i}
                color={colors[randomInteger(0, colors.length - 1)]}
                buttonType={buttonType} // Pass the button type to each
                // TagEditing
              >
                {tag}
              </Tag>
            );
          }
          return null;
        })}
      </div>
    </>
  );
};
