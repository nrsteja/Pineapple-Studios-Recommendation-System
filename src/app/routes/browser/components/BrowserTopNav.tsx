import React from "react";

export interface TopNavProps {
  leftSection?: React.JSX.Element;
  title?: string;
  rightSection?: React.JSX.Element;
}

export function BrowserTopNav({
  leftSection,
  title,
  rightSection,
  ...rest
}: TopNavProps): React.JSX.Element {
  return (
    <>
      <nav className="navbar sticky top-0 z-40 bg-base-100" {...rest}>
        <div className="navbar-start">
          {leftSection === undefined ? null : leftSection}
        </div>
        <div className="navbar-center lg:flex">
          <a href={"/tab/1"} className="btn btn-ghost text-xl">
            {title ?? "Pineapple Studio"}
          </a>
        </div>
        <div className="navbar-end">
          {rightSection === undefined ? null : rightSection}
        </div>
      </nav>
    </>
  );
}
