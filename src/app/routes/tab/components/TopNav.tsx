import {NavLink} from "@remix-run/react";
import {sha256} from "js-sha256";
import React, {useState} from "react";

import Logout from "../../_components/Logout";
import Pineapple from "../../_components/Pineapple";
import ThemeToggle from "./ThemeToggle";

interface TopNavLinkProps {
  email?: string;
}

export default function TopNav({
  email = "",
}: TopNavLinkProps): React.JSX.Element {
  const [isOpen, setIsOpen]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useState(false);

  // for eslint-disable to work
  const ulClassName: string =
    "menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow";
  return (
    <>
      <nav className="navbar sticky top-0 z-40 bg-base-100 max-lg:hidden lg:visible">
        <div className="navbar-start">
          <a href={"/tab/1"} className="btn btn-ghost text-xl">
            <Pineapple />
            Studios
          </a>
        </div>
        <div className="navbar-center lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li className="menu-item px-4 ">
              <NavLink to={"/tab/1"}>Home</NavLink>
            </li>
            <li className="menu-item px-4">
              <NavLink to={"/tab/2"}>Library</NavLink>
            </li>
            <li className="menu-item px-4">
              <NavLink to={"/tab/3"}>Search</NavLink>
            </li>
          </ul>
        </div>

        <div className="navbar-end">
          <ThemeToggle />
          <div className="dropdown dropdown-end dropdown-hover">
            <div tabIndex={0} role="button" className="m-1">
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
              <button
                className="avatar btn btn-circle btn-ghost mr-2"
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => setIsOpen(false)}>
                <div className="w-11 rounded-full">
                  <a href="/tab/4">
                    <img
                      src={`https://gravatar.com/avatar/${sha256(
                        email,
                      )}?d=identicon`}
                      alt="Avatar"
                    />
                  </a>
                </div>
              </button>
            </div>

            {isOpen && (
              <>
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
                <ul tabIndex={0} className={ulClassName}>
                  <li>
                    <a href="/tab/4">Account</a>
                  </li>
                  <li>
                    <Logout />
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
