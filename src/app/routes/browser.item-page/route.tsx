import {
  LoaderFunctionArgs,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import {Link, Outlet, useFetcher, useLoaderData} from "@remix-run/react";
import {default as strToReact} from "html-react-parser";
import React, {useEffect, useState} from "react";

import {
  getItemInfoByItemId,
  getItemInfoBySrcId,
} from "../../../lib/dataRetrieve/getItemInfo";
import {addHistoryItemForUser} from "../../../lib/dataRetrieve/handleUserInfo";
import {
  BookContent,
  ItemInfo,
  ItemType,
  MovieContent,
  SongContent,
} from "../../../lib/interfaces";
import {commitSession, destroySession, getSession} from "../../session";
import {SmallPeopleList} from "../_components/SmallPeopleList";
import {TagList} from "../_components/TagList";
import {ToastList} from "../_components/ToastList";
import {ItemInfoMutex} from "../browser/MUTEX";

export async function loader({params, request}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    success: boolean;
    data: ItemInfo | undefined;
    error: {msg: string} | undefined;
  }>
> {
  const session = await getSession(request.headers.get("cookie"));

  if (!session.has("userId") || !session.data.userId) {
    session.flash("error", "User not login");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  if (isNaN(+session.data.userId)) {
    session.flash("error", "User id is not a number");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  const paramId = params.id;
  const url = new URL(request.url);
  const searchId = url.searchParams.get("id")?.replaceAll(" ", "+");
  const user = +session.data.userId;

  if (
    (!searchId && !paramId) ||
    (searchId && paramId && searchId !== paramId)
  ) {
    return json({
      success: false,
      data: undefined,
      error: {msg: "unknown url requested"},
    });
  }

  const combineId = paramId ?? searchId;

  if (!combineId) {
    return json({
      success: false,
      data: undefined,
      error: {msg: "unknown url requested"},
    });
  }

  const id = combineId;

  let itemInfo;
  if (isNaN(+id)) {
    await ItemInfoMutex.runExclusive(async () => {
      itemInfo = await getItemInfoBySrcId(id, user);
    });
  } else if (!isNaN(+id)) {
    itemInfo = await getItemInfoByItemId(+id, user);
  }

  let jsonData: {
    success: boolean;
    data: ItemInfo | undefined;
    error: {msg: string} | undefined;
  } = {
    success: true,
    data: itemInfo,
    error: undefined,
  };

  if (!itemInfo) {
    jsonData = {
      success: false,
      data: undefined,
      error: {msg: "Item " + id + " not found."},
    };
    return json(jsonData, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (!paramId && itemInfo.isInLibrary && itemInfo.id) {
    return redirect("/library/item-page/?id=" + itemInfo.id, {
      headers: {"Set-Cookie": await commitSession(session)},
    });
  }

  if (!paramId && id !== itemInfo.id.toString()) {
    return redirect("/browser/item-page/?id=" + itemInfo.id, {
      headers: {"Set-Cookie": await commitSession(session)},
    });
  }

  await addHistoryItemForUser(user, +id);

  return json(jsonData, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function tab_index(): React.JSX.Element {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const loaderData = useLoaderData<typeof loader>();

  if (!loaderData.success) {
    return (
      <>
        <h1 className={"text-error"}>{loaderData.error?.msg}</h1>
      </>
    );
  }

  if (!loaderData.data) {
    return (
      <>
        <h1 className={"text-error"}>Error Data Not Found</h1>
      </>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const fetcherAddToLibrary = useFetcher<{
    success: false;
    error: {msg: string};
  }>({key: "add-to-library"});
  fetcherAddToLibrary.formAction = "post";

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [toasts, setToasts] = useState<
    {
      id: number;
      message: string;
      type: string;
    }[]
  >([]);
  const autoClose = true;
  const autoCloseDuration = 5;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const showToast = (message: string, type: string) => {
    const toast: {id: number; message: string; type: string} = {
      id: Date.now(),
      message,
      type,
    };

    setToasts((prevToasts) => [...prevToasts, toast]);

    if (autoClose) {
      setTimeout(() => {
        removeToast(toast.id);
      }, autoCloseDuration * 1000);
    }
  };

  function removeToast(id: number) {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (fetcherAddToLibrary.data && !fetcherAddToLibrary.data.success) {
      console.log(fetcherAddToLibrary.data.error.msg);
      showToast(fetcherAddToLibrary.data.error.msg, "error");
      fetcherAddToLibrary.data = undefined;
    }
  }, [fetcherAddToLibrary, showToast]);

  const data: ItemInfo = loaderData.data;
  const content: MovieContent | SongContent | BookContent = data.otherContent;

  const type: string[] = ["Book", "Song", "Movie"];

  function funcContent(): React.JSX.Element | null {
    switch (data.type) {
      case ItemType.Book: {
        return (
          <>
            {(content as BookContent).pageCount && (
              <p className="mt-2 block text-lg">
                <span className="font-bold"> Page Count: </span>
                {(content as BookContent).pageCount}
              </p>
            )}
            {(content as BookContent).description &&
              (content as BookContent).description !== "N/A" && (
                <p className="mt-2 block text-lg">
                  <span className="font-bold"> Description: </span>
                  {strToReact(
                    `<span>${
                      (content as BookContent).description ??
                      "No Description yet."
                    }</span>`,
                  )}
                </p>
              )}
          </>
        );
      }

      case ItemType.Movie: {
        const movieContent = content as MovieContent;

        // Initialize duration variables
        let finalDuration = "";

        // Check if duration is defined
        if (movieContent.duration !== undefined) {
          // Calculate the number of hours and remaining minutes
          const hours = Math.floor(movieContent.duration / 60);
          const minutes = movieContent.duration % 60;

          // Construct the formatted duration string
          const formattedDuration =
            hours > 0 ? `${hours} hour${hours !== 1 ? "s" : ""}` : "";
          const minutesString =
            minutes > 0 ? `${minutes} minute${minutes !== 1 ? "s" : ""}` : "";

          // Combine the hours and minutes strings
          finalDuration =
            formattedDuration +
            (formattedDuration && minutesString ? " and " : "") +
            minutesString;
        }

        return (
          <>
            {movieContent.duration && (
              <p className="mt-2 block text-lg">
                <span className="font-bold"> Duration: </span>
                {finalDuration}
              </p>
            )}
            {movieContent.country && (
              <p className="mt-2 block text-lg">
                <span className="font-bold">Country: </span>
                {movieContent.country}
              </p>
            )}
            {movieContent.description && movieContent.description !== "N/A" && (
              <p className="mt-2 block text-lg ">
                <span className="font-bold">Description: </span>
                {strToReact(
                  `<span>${
                    movieContent.description ?? "No Description yet."
                  }</span>`,
                )}
              </p>
            )}
          </>
        );
      }

      case ItemType.Song: {
        const songContent = content as SongContent;

        // Initialize duration variable
        let finalDuration = "";

        // Check if duration is defined
        if (songContent.duration !== undefined) {
          // Calculate the number of hours and remaining minutes
          const hours = Math.floor(songContent.duration / 60);
          const minutes = songContent.duration % 60;

          // Construct the formatted duration string
          const formattedDuration =
            hours > 0 ? `${hours} minute${hours !== 1 ? "s" : ""}` : "";
          const minutesString =
            minutes > 0 ? `${minutes} second${minutes !== 1 ? "s" : ""}` : "";

          // Combine the hours and minutes strings
          finalDuration =
            formattedDuration +
            (formattedDuration && minutesString ? " and " : "") +
            minutesString;
        }
        return (
          <>
            {songContent.album && songContent.album !== "N/A" && (
              <p className="mt-2 block text-lg">
                <span className="font-bold"> Album: </span>
                {(content as SongContent).album}
              </p>
            )}
            {songContent.duration && (
              <p className="mt-2 block text-lg">
                <span className="font-bold"> Duration: </span>
                {finalDuration}
              </p>
            )}
          </>
        );
      }
    }
    return null;
  }

  return (
    <>
      <div className="hero min-h-screen">
        <div className="hero-content max-lg:m-2 max-lg:flex-col lg:m-0 lg:flex-row lg:items-start lg:justify-start">
          {/*Left Card Begin*/}
          <div className="lg:m-sm min-w-[25rem] self-start max-md:w-96 lg:max-w-md">
            <div className="card items-center bg-base-200 shadow-xl ">
              <figure className="mask mask-squircle mx-3 my-4  h-72 w-72 justify-items-center">
                <img
                  className="h-72 w-72"
                  src={data.img}
                  alt="Poster of the item"
                />
              </figure>

              <div className="card-body">
                <div className="card-title">
                  <h1 className="block text-4xl">{data.title}</h1>
                </div>
                <p className="mt-2 block text-lg">
                  <span className="font-bold"> Type: </span>
                  {type[data.type]}
                </p>
                {data.country && (
                  <p className="mt-2 block text-lg">
                    <span className="font-bold"> Country: </span>
                    {data.country}
                  </p>
                )}
                {data.publicationDate && (
                  <p className="mt-2 block text-lg">
                    <span className="font-bold"> Publication Date: </span>
                    {data.publicationDate}
                  </p>
                )}
                {funcContent()}
              </div>
            </div>
          </div>
          {/*Left Card End*/}

          <div className={"max-lg:mt-4 lg:hidden"}></div>

          {/*Right Card Begin*/}
          <div className="self-start">
            <div className={"card w-full min-w-80 items-center"}>
              <fetcherAddToLibrary.Form
                className={"min-w-full"}
                method={"POST"}
                action={"/api/item/add-to-library"}>
                <input type="hidden" id="id" name="id" value={data.id} />
                <button
                  type="submit"
                  className="btn btn-neutral btn-wide my-1 min-w-full">
                  Add to Library
                </button>
              </fetcherAddToLibrary.Form>
            </div>
            <div className={"max-lg:mt-12 lg:my-4"}></div>
            <div className="card min-w-[25rem] bg-base-200 shadow-xl max-md:w-96">
              <div className="card-body">
                <h2 className="card-title mx-2 text-2xl lg:text-3xl">Genres</h2>
                {data.genre.length === 0 ||
                data.genre.includes("N/A") ||
                data.genre.includes("") ? (
                  <p className="text-center">No Genre</p>
                ) : (
                  <TagList tag={data.genre} />
                )}
              </div>
              {data.people && <SmallPeopleList items={data.people} />}
              {/*used as an item list */}
            </div>
            <div className={"max-lg:mt-12 lg:my-4"}></div>
            <Link
              to={"/browser/item-page/" + loaderData.data?.id}
              className="btn btn-neutral btn-wide my-1 min-w-full">
              View Recommendation
            </Link>
            <div className={"max-lg:mt-12 lg:my-4"}></div>
            <Outlet />
          </div>
          {/*Right Card End*/}
        </div>
      </div>
      <ToastList data={toasts} removeToast={removeToast} />
    </>
  );
}
