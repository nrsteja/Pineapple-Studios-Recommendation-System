import {cssBundleHref} from "@remix-run/css-bundle";
import {LinksFunction, LoaderFunctionArgs, json} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import {useEffect} from "react";
import {themeChange} from "theme-change";

import {
  calculateUsageTimeInMinutes,
  updateUserTimeUsedInApp,
} from "../lib/dataRetrieve/handleUserInfo";
import {commitSession, getSession} from "./session";
import styles from "./tailwind.css";

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [
        {
          rel: "stylesheet",
          href: cssBundleHref,
        },
      ]
    : [
        {
          rel: "stylesheet",
          href: styles,
        },
      ]),
];

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));
  const endTime = new Date(); // Current time
  if (session.data.startTime && session.data.userId) {
    const startTime = new Date(session.data.startTime);
    const timeUsed = await calculateUsageTimeInMinutes(startTime, endTime);
    await updateUserTimeUsedInApp(parseInt(session.data.userId), timeUsed);
    session.set("startTime", endTime);
  }
  session.set("startTime", endTime);
  return json("", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

function App() {
  // const {theme} = useTheme();
  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
  }, []);
  // const currentStorageTheme = localStorage.getItem("theme") ?? "retro";
  // const [theme, setTheme] = React.useState<string>("retro");
  // useEffect(() => {
  //   setTheme(localStorage.getItem("theme") ?? "retro");
  //   console.log("Root: " + localStorage.getItem("theme"));
  // }, []);
  // const theme = "retro";
  return (
    <html lang="en" id="html">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>Pineapple Studio</title>
        {/*<style>{`html {overflow: -moz-scrollbars-none;scrollbar-width: none;}`}</style>*/}
      </head>
      <body id="body" className="overflow-x-hidden">
        <Outlet />

        {/*<div className="hidden">*/}
        {/*  <ThemeToggle />*/}
        {/*</div>*/}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {/*<script>*/}
        {/*  {'const currentStorageTheme = localStorage.getItem("theme") ?? "retro";' +*/}
        {/*    "const container = document.getElementById('html');" +*/}
        {/*    "(function(){" +*/}
        {/*    "container.setAttribute('data-theme', \"retro\");" +*/}
        {/*    "})();"}*/}
        {/*</script>*/}
      </body>
    </html>
  );
}

export default function Root() {
  return (
    // <ThemeProvider>
    <App />
    // </ThemeProvider>
  );
}
