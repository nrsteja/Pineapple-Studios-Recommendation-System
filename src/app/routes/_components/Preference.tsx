import React, {FC, ReactNode, useState} from "react";

interface PreferenceProps {
  value: string;
  color: string;
  onPreferenceClick: () => void;
}

const Preference: FC<PreferenceProps> = ({value, color, onPreferenceClick}) => {
  // const [clicked, setClicked] = useState(false); // State to track whether the tag is clicked

  // Handle click event to change color and call onClick handler if provided
  // const handleClick = () => {
  //   const newClicked = !clicked; // Toggle clicked state
  //   setClicked(newClicked);
  //   if (onClick) {
  //     onClick(children as string, newClicked); // Pass preference and its clicked status to the parent component
  //   }
  // };

  // const preferenceClass = ;

  return (
    <div className="mx-1 my-2 flex items-center justify-center">
      <div className="indicator">
        <div className="flex min-w-32 items-center justify-center text-xs">
          <button
            className={`btn btn-${color} w-full text-sm lg:text-lg`}
            onClick={onPreferenceClick}>
            {value}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preference;
