import React, {FC} from "react";

const PlusButton: FC<{onClick: () => void}> = ({onClick}) => {
  return (
    <button onClick={onClick} className="badge indicator-item badge-success">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3"
        viewBox="0 0 20 20"
        fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 5a1 1 0 01 1 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H5a1 1 0 110-2h3V6a1 1 0 011-1z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
};

export default PlusButton;
