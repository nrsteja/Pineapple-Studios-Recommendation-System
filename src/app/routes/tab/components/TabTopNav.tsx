import React from "react";

interface TopNavProps {
  leftSection?: [React.JSX.Element];
  title?: string;
  rightSection?: [React.JSX.Element];
  additionalClassName?: string;
}

export default function TabTopNav({
  leftSection,
  title,
  rightSection,
  additionalClassName,
  ...rest
}: TopNavProps): React.JSX.Element {
  return (
    <>
      <nav
        className={
          "navbar absolute sticky top-0 z-40 bg-base-100 " + additionalClassName
        }
        {...rest}>
        <div className="navbar-start">
          {leftSection === undefined
            ? null
            : leftSection.map((e: React.JSX.Element) => e)}
        </div>
        <div className="navbar-center lg:flex">
          <a href={"/"} className="btn btn-ghost text-xl">
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
