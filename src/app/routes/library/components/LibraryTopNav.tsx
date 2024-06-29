import React from "react";

interface TopNavProps {
  leftSection?: [React.JSX.Element];
  title?: string;
  rightSection?: [React.JSX.Element];
}

export default function LibraryTopNav({
  leftSection,
  title,
  rightSection,
  ...rest
}: TopNavProps): React.JSX.Element {
  return (
    <>
      <nav className="navbar sticky top-0 z-40 bg-base-100" {...rest}>
        <div className="navbar-start">
          {leftSection === undefined
            ? null
            : leftSection.map((e: React.JSX.Element) => e)}
        </div>
        <div className="navbar-center lg:flex">
          <a href={"/tab/2"} className="btn btn-ghost text-xl">
            {title ?? "Pineapple Studio"}
          </a>
        </div>
        <div className="navbar-end">
          {rightSection === undefined
            ? null
            : rightSection.map((e: React.JSX.Element) => e)}
        </div>
      </nav>
    </>
  );
}
