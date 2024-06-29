import {Outlet} from "@remix-run/react";
import React from "react";

export default function LoginLayout(): React.JSX.Element {
  return (
    <>
      <div
        className="hero min-h-screen bg-base-200"
        // style={{backgroundImage: `url(/images/loginbg.png)`}}
      >
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div
            id={"login-Title"}
            className="mx-7 text-center max-lg:mt-10 lg:text-left">
            <h1 className="text-5xl font-bold">Login now!</h1>
            <p className="py-6">A place for your entertainment contents.</p>
          </div>
          <Outlet />
        </div>
      </div>
    </>
  );
}
