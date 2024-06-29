import {LoaderFunctionArgs, redirect} from "@remix-run/node";
import {destroySession, getSession} from "src/app/session";
import {
  calculateUsageTimeInMinutes,
  updateUserTimeUsedInApp,
} from "src/lib/dataRetrieve/handleUserInfo";

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));
  if (session.data.startTime && session.data.userId) {
    const startTime = new Date(session.data.startTime);
    const endTime = new Date(); // Current time
    const timeUsed = await calculateUsageTimeInMinutes(startTime, endTime);
    await updateUserTimeUsedInApp(parseInt(session.data.userId), timeUsed);
  }

  // await destroySession(session);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
