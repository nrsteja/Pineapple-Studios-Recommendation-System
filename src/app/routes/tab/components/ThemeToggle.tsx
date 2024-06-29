import React from "react";

export default function ThemeToggle(): React.JSX.Element {
  return (
    <>
      <select data-choose-theme className="select" defaultValue="theme">
        <option value="theme" disabled>
          Theme
        </option>
        <option value="forest">forest</option>
        <option value="retro">retro</option>
      </select>
    </>
  );
}
