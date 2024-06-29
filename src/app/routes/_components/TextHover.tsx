// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";

interface InfoHoverProps {
  info?: string;
}

export default function TextHover({
  info = "Item Title",
}: InfoHoverProps): React.JSX.Element {
  return (
    <div className="tooltip" data-tip={info}>
      <p className="overflow-ellipsistext-balance tooltip-bottom h-12 max-h-12 truncate p-2 text-start text-sm max-md:text-xs">
        {info}
      </p>
    </div>
  );
}
