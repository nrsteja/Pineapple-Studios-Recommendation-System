import {NavLink} from "@remix-run/react";
import React, {useEffect, useRef, useState} from "react";

export default function BtmNav(): React.JSX.Element {
  const [height, setHeight]: [
    number,
    React.Dispatch<React.SetStateAction<number>>,
  ] = useState(0);
  const ref: React.MutableRefObject<null> = useRef(null);

  useEffect((): undefined | (() => void) => {
    if (!ref.current) {
      return;
    }

    const resizeObserver: ResizeObserver = new ResizeObserver((): void => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setHeight(ref.current.clientHeight);
    });
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <>
      <div className={"lg:hidden"} style={{height: height.toString() + "px"}}>
        <span></span>
      </div>
      <footer
        ref={ref}
        className="btm-nav fixed bottom-0 z-50 text-base-content lg:hidden">
        <NavLink to={"/tab/1"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="btm-nav-label">Home</span>
        </NavLink>
        <NavLink to={"/tab/2"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="btm-nav-label">Library</span>
        </NavLink>
        <NavLink to={"/tab/3"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="btm-nav-label">Search</span>
        </NavLink>
        <NavLink to={"/tab/4"}>
          <svg fill="none" viewBox="0 0 24 24" height="1em" width="1em">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M16 9a4 4 0 11-8 0 4 4 0 018 0zm-2 0a2 2 0 11-4 0 2 2 0 014 0z"
              clipRule="evenodd"
            />
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM3 12c0 2.09.713 4.014 1.908 5.542A8.986 8.986 0 0112.065 14a8.984 8.984 0 017.092 3.458A9 9 0 103 12zm9 9a8.963 8.963 0 01-5.672-2.012A6.992 6.992 0 0112.065 16a6.991 6.991 0 015.689 2.92A8.964 8.964 0 0112 21z"
              clipRule="evenodd"
            />
          </svg>
          <span className="btm-nav-label">Profile</span>
        </NavLink>
      </footer>
    </>
  );
}
