import React from "react";

import Preference from "./PrefChoose";

// interface Category {
//   name: string;
//   values: string[];
// }

interface PrefListChooseProps {
  preference: string[];
  selected?: string[];
  color?: string;
  onPreferenceClick: (clickedPreference: string) => void;
}

const colors = [
  "bg-gradient-to-r from-blue-500 to-green-500",
  "bg-gradient-to-r from-red-500 to-yellow-500",
  "bg-gradient-to-r from-purple-500 to-indigo-500",
  "bg-gradient-to-r from-pink-500 to-blue-500",
  "bg-gradient-to-r from-cyan-500 to-blue-500",
  "bg-gradient-to-r from-teal-500 to-green-500",
  "bg-gradient-to-r from-yellow-500 to-pink-500",
  "bg-gradient-to-r from-green-500 to-teal-500",
  "bg-gradient-to-r from-blue-500 to-indigo-500",
  "bg-gradient-to-r from-yellow-500 to-green-500",
  "bg-gradient-to-r from-red-500 to-pink-500",
  "bg-gradient-to-r from-indigo-500 to-purple-500",
  "bg-gradient-to-r from-blue-500 to-purple-500",
  "bg-gradient-to-r from-red-500 to-indigo-500",
  "bg-gradient-to-r from-green-500 to-yellow-500",
  "bg-gradient-to-r from-yellow-500 to-orange-500",
  "bg-gradient-to-r from-yellow-500 to-gray-500",
  "bg-gradient-to-r from-blue-500 to-cyan-500",
  "bg-gradient-to-r from-indigo-500 to-pink-500",
  "bg-gradient-to-r from-teal-500 to-blue-500",
  "bg-gradient-to-r from-blue-500 to-orange-500",
];

export const PrefListChoose: React.FC<PrefListChooseProps> = ({
  preference,
  selected = [],
  color = colors[Math.floor(Math.random() * colors.length)],
  onPreferenceClick,
}) => {
  return (
    <div className="flex flex-row flex-wrap justify-around">
      {preference.map((pref, i) => (
        <Preference
          key={"tag-" + i}
          color={
            selected.includes(pref)
              ? color + " text-black"
              : "bg-black text-white"
          }
          onPreferenceClick={() => onPreferenceClick(pref)}
          value={pref}
        />
      ))}
    </div>
  );
};
