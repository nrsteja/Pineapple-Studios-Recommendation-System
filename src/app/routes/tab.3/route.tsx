import {
  LoaderFunctionArgs,
  Session,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import {FetcherWithComponents, useFetcher} from "@remix-run/react";
import React, {useEffect, useState} from "react";

import {
  handleBookSearchAPI,
  handleMovieSearchAPI,
  handleSongSearchAPI,
} from "../../../lib/dataRetrieve/getAPIInfo";
import {ItemType, SimpleItem} from "../../../lib/interfaces";
import {
  SessionData,
  SessionFlashData,
  commitSession,
  destroySession,
  getSession,
} from "../../session";
import {ItemList} from "../_components/ItemList";
import {ToastList} from "../_components/ToastList";

interface SimpleSimpleItem {
  srcID: string;
  title: string;
  type: ItemType;
  img: string;
}

interface SearchFormData {
  type: ItemType;
  query: string;
}

export async function action({request}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    success: boolean;
    data: {items: SimpleSimpleItem[]} | undefined;
    error: {msg: string} | undefined;
  }>
> {
  const session: Session<SessionData, SessionFlashData> = await getSession(
    request.headers.get("cookie"),
  );

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

  const formData: FormData = await request.formData();
  const data: SearchFormData = {
    type: +(formData.get("type") as string) as ItemType,
    query: formData.get("query") as string,
  };

  let returnData: SimpleSimpleItem[] = [];

  if (
    data.type === undefined ||
    data.type === null ||
    data.type === ItemType.All ||
    data.type === ItemType.Book
  ) {
    const searchData: SimpleSimpleItem[] = (
      await handleBookSearchAPI(data.query)
    ).map((e): SimpleSimpleItem => {
      return {
        srcID: e.srcId,
        title: e.itemTitle,
        type: ItemType.Book,
        img: e.thumbnailUrl,
      };
    });
    returnData = returnData.concat(searchData);
  }

  if (
    data.type === undefined ||
    data.type === null ||
    data.type === ItemType.All ||
    data.type === ItemType.Movie
  ) {
    const searchData: SimpleSimpleItem[] = (
      await handleMovieSearchAPI(data.query)
    ).map((e): SimpleSimpleItem => {
      return {
        srcID: e.srcId,
        title: e.itemTitle,
        type: ItemType.Movie,
        img: e.thumbnailUrl,
      };
    });
    returnData = returnData.concat(searchData);
  }

  if (
    data.type === undefined ||
    data.type === null ||
    data.type === ItemType.All ||
    data.type === ItemType.Song
  ) {
    const searchData: SimpleSimpleItem[] = (
      await handleSongSearchAPI(data.query)
    ).map((e): SimpleSimpleItem => {
      return {
        srcID: e.srcId,
        title: e.itemTitle,
        type: ItemType.Song,
        img: e.thumbnailUrl,
      };
    });
    returnData = returnData.concat(searchData);
  }

  let jsonData: {
    success: boolean;
    data: {items: SimpleSimpleItem[]} | undefined;
    error: {msg: string} | undefined;
  } = {
    success: true,
    data: {items: returnData},
    error: undefined,
  };

  if (returnData.length === 0) {
    jsonData = {
      success: false,
      data: undefined,
      error: {msg: "Error Message"},
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
  const fetcher = useFetcher<typeof action>({key: "search"});
  fetcher.formAction = "post";
  const isSubmitting = fetcher.state === "submitting";
  const isLoading = fetcher.state === "loading";
  const isIdle = fetcher.state === "idle";

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [items, setItems] = useState<SimpleItem[]>([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [update, setUpdate] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect((): void => {
    if (
      fetcher.state === "idle" &&
      update &&
      fetcher.data &&
      fetcher.data.data
    ) {
      const newItems: SimpleItem[] = fetcher.data.data.items.map(
        (e): SimpleItem => {
          return {
            id: e.srcID,
            title: e.title,
            img: e.img,
            tag: [],
            type: e.type,
          };
        },
      );
      setItems(newItems);
      setUpdate(false);
    }
    if (fetcher.state === "loading" && !update) {
      setUpdate(true);
    }
  }, [fetcher.data, fetcher.state, items, setItems, update, setUpdate]);

  const fetcherAddToLibrary: FetcherWithComponents<{
    success: false;
    error: {msg: string};
    // eslint-disable-next-line react-hooks/rules-of-hooks
  }> = useFetcher<{
    success: false;
    error: {msg: string};
  }>({key: "add-to-library"});
  fetcherAddToLibrary.formAction = "post";

  function onItemAdd(itemId: string) {
    const formData = new FormData();
    formData.append("id", itemId);

    fetcherAddToLibrary.submit(formData, {
      action: "/api/item/add-to-library",
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
    if (fetcherAddToLibrary.data && !fetcherAddToLibrary.data.success) {
      console.log(fetcherAddToLibrary.data.error.msg);
      showToast(fetcherAddToLibrary.data.error.msg, "error");
      fetcherAddToLibrary.data = undefined;
    }
  }, [fetcherAddToLibrary, showToast]);

  return (
    <>
      <fetcher.Form
        className={"join mt-2 w-full min-w-full pb-2"}
        method={"POST"}
        action={"/tab/3"}>
        <p className="form-control grow">
          <input
            id="query"
            name="query"
            className="input join-item input-bordered input-primary"
            placeholder="Search"
          />
        </p>
        <p className="form-control">
          <select
            id="type"
            name="type"
            defaultValue={ItemType.All}
            className="join-item select select-bordered select-primary">
            <option disabled>Filter</option>
            <option value={ItemType.All}>All</option>
            <option value={ItemType.Book}>Book</option>
            <option value={ItemType.Song}>Music</option>
            <option value={ItemType.Movie}>Movie</option>
          </select>
        </p>
        <p className="form-control">
          <button className="btn btn-accent join-item" type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-7 w-7 opacity-70">
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </p>
      </fetcher.Form>

      {(isSubmitting || isLoading) && (
        <>
          <div className="hero">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-5xl font-bold">Loading...</h1>
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            </div>
          </div>
        </>
      )}

      {isIdle && (
        <>
          {items.filter((x: SimpleItem): boolean => x.type === ItemType.Song)
            .length !== 0 && (
            <>
              <div className="divider"></div>
              <ItemList
                title="Songs"
                items={items.filter(
                  (x: SimpleItem): boolean => x.type === ItemType.Song,
                )}
                func={onItemAdd}
              />
            </>
          )}

          {items.filter((x: SimpleItem): boolean => x.type === ItemType.Book)
            .length !== 0 && (
            <>
              <div className="divider"></div>
              <ItemList
                title="Books"
                items={items.filter(
                  (x: SimpleItem): boolean => x.type === ItemType.Book,
                )}
                func={onItemAdd}
              />
            </>
          )}

          {items.filter((x: SimpleItem): boolean => x.type === ItemType.Movie)
            .length !== 0 && (
            <>
              <div className="divider"></div>
              <ItemList
                title="Movies & TV Shows"
                items={items.filter(
                  (x: SimpleItem): boolean => x.type === ItemType.Movie,
                )}
                func={onItemAdd}
              />
            </>
          )}

          {items.filter((x: SimpleItem) => x.type === undefined || x.type > 2)
            .length !== 0 && (
            <>
              <div className="divider"></div>
              <ItemList
                title="Others"
                items={items.filter(
                  (x: SimpleItem) => x.type === undefined || x.type > 2,
                )}
                func={onItemAdd}
              />
            </>
          )}
        </>
      )}

      {!isSubmitting && !isLoading && items.length !== 0 && (
        <div className={"block max-lg:my-24 lg:my-36"}></div>
      )}

      <ToastList data={toasts} removeToast={removeToast} />
    </>
  );
}
