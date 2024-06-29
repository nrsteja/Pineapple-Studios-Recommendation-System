import {createCookieSessionStorage} from "@remix-run/node";

export type SessionData = {
  userId: string;
  startTime: Date;
};

export type SessionFlashData = {
  error: string;
};

export const {getSession, commitSession, destroySession} =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "work-session",
      secrets: ["pineapple-ui-secret"],
      httpOnly: true,
      //A boolean indicating if the cookie should be accessible
      // only through HTTP requests. It's set to true, meaning
      // JavaScript cannot access it.
      maxAge: 60 * 30,
      //The maximum age of the cookie in seconds = 30 mins
      path: "/",
      //The path for which the cookie is valid. It's set to /,
      // meaning it's valid for all paths.
      sameSite: "lax",
      //A string specifying the SameSite attribute for the
      // cookie. It's set to lax, which provides a balance
      // between security and usability.
      secure: process.env.NODE_ENV === "production",
      // When secure is set to
      // true, the cookie will
      // only be sent over
      // secure (HTTPS)
      // connections
    },
  });
