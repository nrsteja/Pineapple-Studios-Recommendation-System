import {
  LoaderFunctionArgs,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import {
  FetcherWithComponents,
  NavLink,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import React, {useEffect, useState} from "react";

import {getLibraryInfoByUserId} from "../../../lib/dataRetrieve/getLibraryInfo";
import {ItemType, Library, SimpleItem} from "../../../lib/interfaces";
import {commitSession, destroySession, getSession} from "../../session";
import {ItemFolderList} from "../_components/ItemFolderList";
import {ItemList} from "../_components/ItemList";
import {ToastList} from "../_components/ToastList";

export async function loader({request}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    success: boolean;
    data: Library | null;
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

  const library: Library | null = await getLibraryInfoByUserId(
    +session.data.userId,
  );

  let jsonData: {
    success: boolean;
    data: Library | null;
    error: {msg: string} | undefined;
  } = {
    success: true,
    data: library,
    error: undefined,
  };

  if (!library) {
    session.flash("error", "Library Cannot found");

    jsonData = {
      success: false,
      data: null,
      error: {msg: "Library not found"},
    };
  }

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

  if (!loaderData.success || !loaderData.data) {
    return (
      <>
        <h1 className={"text-error"}>Error</h1>
      </>
    );
  }

  const favoriteItems: SimpleItem[] = loaderData.data.items.filter(
    (item: SimpleItem): boolean =>
      item.tag.filter(
        (e: string) =>
          e.toLowerCase() === "favourite" || e.toLowerCase() === "favorite",
      ).length >= 1,
  );
  const notFavoriteItems: SimpleItem[] = loaderData.data.items.filter(
    (item: SimpleItem): boolean =>
      item.tag.filter(
        (e: string) =>
          e.toLowerCase() === "favourite" || e.toLowerCase() === "favorite",
      ).length < 1,
  );

  const fetcherAddToFavourite: FetcherWithComponents<{
    success: false;
    error: {msg: string};
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }> = useFetcher<{
    success: false;
    error: {msg: string};
  }>({key: "add-tags"});
  fetcherAddToFavourite.formAction = "post";

  function onItemAdd(itemId: string) {
    const formData = new FormData();
    formData.append("item", itemId);
    formData.append("tag", "favourite");

    fetcherAddToFavourite.submit(formData, {
      action: "/api/item/add-tags",
      method: "post",
    });
  }

  const fetcherDeleteFavourite: FetcherWithComponents<{
    success: false;
    error: {msg: string};
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }> = useFetcher<{
    success: false;
    error: {msg: string};
  }>({key: "delete-tags"});
  fetcherAddToFavourite.formAction = "post";

  function onItemDelete(itemId: string) {
    const formData = new FormData();
    formData.append("item", itemId);
    formData.append("tag", "favourite");

    fetcherDeleteFavourite.submit(formData, {
      action: "/api/item/delete-tags",
      method: "post",
    });
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [toasts, setToasts] = useState<
    {
      id: number;
      message: string;
      type: string;
    }[]
  >([]);
  const autoClose: boolean = true;
  const autoCloseDuration: number = 5;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const showToast = (message: string, type: string): void => {
    const toast: {id: number; message: string; type: string} = {
      id: Date.now(),
      message,
      type,
    };

    setToasts((prevToasts: {id: number; message: string; type: string}[]) => [
      ...prevToasts,
      toast,
    ]);

    if (autoClose) {
      setTimeout((): void => {
        removeToast(toast.id);
      }, autoCloseDuration * 1000);
    }
  };

  function removeToast(id: number) {
    setToasts((prevToasts: {id: number; message: string; type: string}[]) =>
      prevToasts.filter(
        (toast: {id: number; message: string; type: string}): boolean =>
          toast.id !== id,
      ),
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect((): void => {
    if (fetcherAddToFavourite.data && !fetcherAddToFavourite.data.success) {
      console.log(fetcherAddToFavourite.data.error.msg);
      showToast(fetcherAddToFavourite.data.error.msg, "error");
      fetcherAddToFavourite.data = undefined;
    }
  }, [fetcherAddToFavourite, showToast]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect((): void => {
    if (fetcherDeleteFavourite.data && !fetcherDeleteFavourite.data.success) {
      console.log(fetcherDeleteFavourite.data.error.msg);
      showToast(fetcherDeleteFavourite.data.error.msg, "error");
      fetcherDeleteFavourite.data = undefined;
    }
  }, [fetcherDeleteFavourite, showToast]);

  const btnContent = (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19.5 12.572L12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"
        />
      </svg>
      Add to Favourite
    </>
  );

  return (
    <>
      {favoriteItems.length !== 0 && (
        <>
          <div className="divider"></div>
          <ItemList
            title="Favorites"
            items={favoriteItems}
            func={onItemDelete}
            btnContent={
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m3 3l18 18m-1.5-8.428L18 14m-2 2l-4 4l-7.5-7.428a5 5 0 0 1-1.288-5.068A4.98 4.98 0 0 1 5 5m3-1c1.56 0 3.05.727 4 2a5 5 0 1 1 7.5 6.572"
                  />
                </svg>
                <p className="text-[10pt]"> Remove from favourite</p>
              </>
            }
          />
        </>
      )}

      {loaderData.data.folders.length !== 0 && (
        <>
          <div className="divider"></div>
          <ItemFolderList title="Folders" items={loaderData.data.folders} />
        </>
      )}

      {loaderData.data.series.length !== 0 && (
        <>
          <div className="divider"></div>
          <ItemFolderList title="Series" items={loaderData.data.series} />
        </>
      )}

      {notFavoriteItems.filter(
        (x: SimpleItem): boolean => x.type === ItemType.Song,
      ).length !== 0 && (
        <>
          <div className="divider m-4"></div>
          <ItemList
            title="Music"
            items={notFavoriteItems.filter(
              (x: SimpleItem): boolean => x.type === ItemType.Song,
            )}
            func={onItemAdd}
            btnContent={btnContent}
          />
        </>
      )}

      {notFavoriteItems.filter(
        (x: SimpleItem): boolean => x.type === ItemType.Movie,
      ).length !== 0 && (
        <>
          <div className="divider"></div>
          <ItemList
            title="Movies & TV Shows"
            items={notFavoriteItems.filter(
              (x: SimpleItem): boolean => x.type === ItemType.Movie,
            )}
            func={onItemAdd}
            btnContent={btnContent}
          />
        </>
      )}

      {notFavoriteItems.filter(
        (x: SimpleItem): boolean => x.type === ItemType.Book,
      ).length !== 0 && (
        <>
          <div className="divider"></div>
          <ItemList
            title="Books"
            items={notFavoriteItems.filter(
              (x: SimpleItem): boolean => x.type === ItemType.Book,
            )}
            func={onItemAdd}
            btnContent={btnContent}
          />
        </>
      )}

      {notFavoriteItems.filter(
        (x: SimpleItem) => x.type === undefined || x.type > 2,
      ).length !== 0 && (
        <>
          <div className="divider"></div>
          <ItemList
            title="Others"
            items={notFavoriteItems.filter(
              (x: SimpleItem) => x.type === undefined || x.type > 2,
            )}
            func={onItemAdd}
            btnContent={btnContent}
          />
        </>
      )}

      {loaderData.data.items.length +
        loaderData.data.folders.length +
        loaderData.data.series.length ===
        0 && (
        <>
          <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-3xl font-bold text-error">
                  There is no item in your library yet, browse more.
                </h1>
                <NavLink className="btn btn-primary" to="/tab/1">
                  Browse More
                </NavLink>
              </div>
            </div>
          </div>
        </>
      )}
      <div className={"lg:my-32"}></div>
      <ToastList data={toasts} removeToast={removeToast} />
      <a href="/library/folder/create" className="toast">
        <div className="btn btn-info mb-16 mr-2 lg:mb-4 lg:mr-6">
          <svg
            className="h-6 w-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 19H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4l3 3h7a2 2 0 0 1 2 2v3.5M16 19h6m-3-3v6"
            />
          </svg>
          Create Folder
        </div>
      </a>
    </>
  );
}
