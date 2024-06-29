import {LoaderFunctionArgs, TypedResponse, json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import React from "react";
import {commitSession, getSession} from "src/app/session";
import {getUserInfoByUserId} from "src/lib/dataRetrieve/getUserInfo";

import {User} from "../../../lib/interfaces";
import {HistoryItemList} from "../_components/HistoryItemList";
import {TagList} from "../_components/TagList";
import {UserProfileCard, userData} from "./components/UserProfileCard";

export async function loader({request}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    success: boolean;
    user: User | null;
    error: {msg: string} | undefined;
  }>
> {
  const session = await getSession(request.headers.get("cookie"));

  let userData;
  if (session.data.userId) {
    userData = await getUserInfoByUserId(parseInt(session.data.userId));
  }

  if (!userData || !userData.history) {
    return json(
      {
        success: false,
        user: null,
        error: {msg: "User Information cannot load."},
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }

  return json(
    {
      success: true,
      user: userData,
      error: undefined,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
}

export default function tab_index(): React.JSX.Element {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const loaderData = useLoaderData<typeof loader>();

  const colors: string[] = ["accent", "primary", "secondary"];

  if (!loaderData) {
    return (
      <>
        <h1 className={"text-error"}>Error</h1>
      </>
    );
  }

  if (!loaderData.success || !loaderData!.user) {
    return (
      <>
        <h1 className={"text-error"}>{loaderData.error?.msg}</h1>
      </>
    );
  }

  const userData: userData = {
    name: loaderData?.user.name ?? "Name",
    email: loaderData?.user.email ?? "Email",
    date: loaderData?.user.dateJoined ?? "Date",
    time: loaderData?.user.timeUsedAppInMins ?? 0,
    numOfItemInLibrary: loaderData?.user.countItemsInLibrary ?? 0,
    numOfFavoriteItem: loaderData?.user.numberOfFavItem ?? 0,
  };

  return (
    <>
      <div className="hero min-h-screen">
        <div className="hero-content max-lg:m-0 max-lg:flex-col max-md:w-96 lg:m-0 lg:flex-row lg:items-start lg:justify-start">
          <div className="self-start">
            <UserProfileCard user={userData} />
            <div className={"max-lg:mt-4 lg:mt-8"}></div>
            <div className="card w-full self-start bg-base-200 shadow-xl xl:min-w-[40rem]">
              <div className="card-body">
                <div className="card-title">Change Theme</div>
                <select
                  data-choose-theme=""
                  className="select min-w-full"
                  defaultValue="theme">
                  <option value="theme" disabled>
                    Theme
                  </option>
                  <option value="forest">forest</option>
                  <option value="retro">retro</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <div className="card w-full self-start bg-base-200 shadow-xl xl:min-w-[40rem]">
              <div className="card-body">
                {loaderData && loaderData.user.preference && (
                  <>
                    <h2 className="card-title mx-2 text-2xl lg:text-3xl">
                      Preferences
                    </h2>
                    <TagList
                      tag={loaderData.user.preference}
                      colors={colors}
                      buttonType="none"
                    />
                  </>
                )}
              </div>

              {loaderData && loaderData.user.history && (
                <HistoryItemList
                  title="View History"
                  items={loaderData.user.history}
                />
              )}
            </div>
            <div className={"max-lg:mt-4 lg:mt-8"}></div>
            <a
              href={"/logout"}
              className="btn btn-error btn-wide my-1 min-w-full">
              Logout
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
