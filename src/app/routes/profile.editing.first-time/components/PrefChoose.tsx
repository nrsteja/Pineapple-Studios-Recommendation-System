import {FC} from "react";

interface PreferenceProps {
  value: string;
  color: string;
  onPreferenceClick: () => void;
}

const PrefChoose: FC<PreferenceProps> = ({value, color, onPreferenceClick}) => {
  return (
    <div className="mx-1 my-2 flex items-center justify-center">
      <div className="indicator">
        <div className="flex min-w-32 items-center justify-center text-xs ">
          <button
            className={`btn w-full text-sm lg:text-lg ${color} rounded-2xl`}
            onClick={onPreferenceClick}>
            {value}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrefChoose;
