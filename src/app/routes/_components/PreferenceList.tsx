import React from "react";

import Preference from "./Preference";

// interface Category {
//   name: string;
//   values: string[];
// }

interface preferencesProps {
  preference: string[];
  selected?: string[];
  color?: string;
  accentColor?: string;
  onPreferenceClick: (clickedPreference: string) => void;
}

export const PreferenceList: React.FC<preferencesProps> = ({
  preference,
  selected = [],
  color = "secondary",
  accentColor = "accent",
  onPreferenceClick,
}) => {
  return (
    <>
      <div className="flex flex-row flex-wrap justify-around overflow-x-auto">
        {preference.map((preference, i) => (
          <Preference
            key={"tag-" + i}
            color={selected.includes(preference) ? accentColor : color}
            onPreferenceClick={() => onPreferenceClick(preference)}
            value={preference}
          />
        ))}
      </div>
    </>
  );
};
