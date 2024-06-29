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

import {getMultipleSimpleItems} from "../../../lib/dataRetrieve/getItems";
import {ItemType, SimpleItem} from "../../../lib/interfaces";
import {commitSession, destroySession, getSession} from "../../session";
import InfoHover from "../_components/InfoHover";
import {ItemList} from "../_components/ItemList";
import {ToastList} from "../_components/ToastList";

export async function loader({request}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    success: boolean;
    data: SimpleItem[] | null;
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

  const itemList: SimpleItem[] = await getMultipleSimpleItems(
    10,
    10,
    10,
    +session.data.userId,
  );

  let jsonData: {
    success: boolean;
    data: SimpleItem[] | null;
    error: {msg: string} | undefined;
  } = {
    success: true,
    data: itemList,
    error: undefined,
  };

  if (!itemList || itemList.length < 1) {
    session.flash("error", "Library Cannot found");

    jsonData = {
      success: false,
      data: null,
      error: {msg: "Items not found"},
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const fetcherRecommendation = useFetcher<{
    success: boolean;
    data: {data: SimpleItem[]} | null;
    error: {msg: string} | null;
  }>({
    key: "recommendation",
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [getRecommendation, setGetRecommendation] = useState(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!getRecommendation) {
      fetcherRecommendation.load("/api/recommendation/user");
      setGetRecommendation(true);
    }
  }, [fetcherRecommendation, getRecommendation, setGetRecommendation]);

  const recommendation = fetcherRecommendation.data;
  const isSubmitting = fetcherRecommendation.state === "submitting";
  const isLoading = fetcherRecommendation.state === "loading";
  const isIdle = fetcherRecommendation.state === "idle";

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

  function funcContent(data: SimpleItem[] | null | undefined) {
    return (
      <>
        {data &&
          data.filter((x: SimpleItem) => x.type === ItemType.Song).length >
            0 && (
            <>
              <div className="divider"></div>
              <ItemList
                items={data.filter((x: SimpleItem) => x.type === ItemType.Song)}
                title="Top Music"
                func={onItemAdd}
              />
            </>
          )}

        {data &&
          data.filter((x: SimpleItem) => x.type === ItemType.Book).length >
            0 && (
            <>
              <div className="divider"></div>
              <ItemList
                items={data.filter((x: SimpleItem) => x.type === ItemType.Book)}
                title="Top Books"
                func={onItemAdd}
              />
            </>
          )}

        {data &&
          data.filter((x: SimpleItem) => x.type === ItemType.Movie).length >
            0 && (
            <>
              <div className="divider"></div>
              <ItemList
                items={data.filter(
                  (x: SimpleItem) => x.type === ItemType.Movie,
                )}
                title="Top Movies"
                func={onItemAdd}
              />
            </>
          )}
      </>
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
      <h1 className="mx-6 mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text pb-1 text-5xl font-extrabold text-transparent">
        Today&apos;s Hits
      </h1>

      <h1 className="mx-6 mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text pb-1 text-4xl font-extrabold text-transparent">
        For you
        <span className="pl-2 text-neutral">
          <InfoHover info="Recommended based on your viewed items, library and preferences." />
        </span>
      </h1>

      {(!getRecommendation || isLoading || isSubmitting) && (
        <>
          <div className="flex w-52 flex-col gap-4">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        </>
      )}

      {getRecommendation &&
        isIdle &&
        (!recommendation || !recommendation.success) && (
          <>
            <div className="hero">
              <div className="hero-content text-center">
                <div className="max-w-md">
                  <h1 className="text-xl font-bold text-error">
                    {!recommendation
                      ? "There is no recommendation result for this user, " +
                        "you can browser more and add more items to your " +
                        "library first."
                      : recommendation.error
                        ? recommendation.error?.msg.toString()
                        : "There is no recommendation result for this user, " +
                          "you can browser more and add more items to your " +
                          "library first."}
                  </h1>
                </div>
              </div>
            </div>
          </>
        )}

      {getRecommendation &&
        isIdle &&
        recommendation &&
        recommendation.success && <>{funcContent(recommendation.data?.data)}</>}
      <div className="divider"></div>
      <h1 className="mx-6 mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text pb-1 text-4xl font-extrabold text-transparent">
        Others are watching
        <span className="pl-2 text-neutral">
          <InfoHover info="Based on users related to you." />
        </span>
      </h1>

      {funcContent(loaderData.data)}

      {(!loaderData.data ||
        loaderData.data.length +
          loaderData.data.length +
          loaderData.data.length ===
          0) && (
        <>
          <div className="hero">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-xl font-bold text-error">
                  {!recommendation
                    ? "There is no recommendation result for this user, " +
                      "you can browser more and add more items to your " +
                      "library first."
                    : recommendation.error
                      ? recommendation.error?.msg.toString()
                      : "There is no recommendation result for this user, " +
                        "you can browser more and add more items to your " +
                        "library first."}
                </h1>
              </div>
            </div>
          </div>
        </>
      )}

      {getRecommendation &&
        isIdle &&
        (!loaderData.data ||
          loaderData.data.length +
            loaderData.data.length +
            loaderData.data.length ===
            0) &&
        !recommendation?.success && (
          <>
            <div className="hero">
              <div className="hero-content text-center">
                <div className="max-w-md">
                  <h1 className="text-xl font-bold text-error">
                    There is recommendations, you may search what you like.
                  </h1>
                  <NavLink className="btn btn-primary" to="/tab/3">
                    Go to Search Page
                  </NavLink>
                </div>
              </div>
            </div>
          </>
        )}
      <div className={"lg:my-32"}></div>
      <ToastList data={toasts} removeToast={removeToast} />
    </>
  );
}
