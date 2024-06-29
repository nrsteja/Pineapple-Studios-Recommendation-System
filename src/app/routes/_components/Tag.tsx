import {FC, ReactNode, useState} from "react";

import CloseButton from "./CloseButton";
import PlusButton from "./PlusButton";

// Ensure you import PlusButton

interface TagProps {
  children: ReactNode;
  color: string;
  buttonType: "close" | "plus" | "none"; // New prop for button type
}

const TagEditing: FC<TagProps> = ({children, color, buttonType}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleCloseClick = () => {
    setIsVisible(false);
  };

  const handlePlusClick = () => {};

  // Function to render the appropriate button based on the buttonType prop
  const renderButton = () => {
    switch (buttonType) {
      case "close":
        return <CloseButton onClick={handleCloseClick} />;
      case "plus":
        return <PlusButton onClick={handlePlusClick} />;
      case "none":
        return null;
      default:
        return null;
    }
  };

  const btnClass = `btn btn-${color} no-animation w-full text-sm lg:text-lg`;

  return (
    <div
      className={`mx-1 my-2 flex items-center justify-center ${
        isVisible ? "block" : "hidden"
      }`}>
      <div className="indicator">
        <div className="flex min-w-32 items-center justify-center text-xs">
          <button className={btnClass}>{children}</button>
        </div>
        {renderButton()}
      </div>
    </div>
  );
};

export default TagEditing;
