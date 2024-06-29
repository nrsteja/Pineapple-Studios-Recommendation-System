import {
  LoaderFunctionArgs,
  TypedDeferredData,
  TypedResponse,
  defer,
  redirect,
} from "@remix-run/node";
import {Await, useLoaderData} from "@remix-run/react";
import React, {Suspense} from "react";

import {fetchRecommendationsLLM} from "../../../lib/dataRetrieve/fetchRecent3Items";
import {
  handleBookSearchAPI,
  handleMovieSearchAPI,
  handleSongSearchAPI,
} from "../../../lib/dataRetrieve/getAPIInfo";
import {
  getItemInfoByItemId,
  getItemInfoBySrcId,
} from "../../../lib/dataRetrieve/getItemInfo";
import {addHistoryItemForUser} from "../../../lib/dataRetrieve/handleUserInfo";
import {
  ErrorResponse,
  ItemType,
  RecommendationResponse,
  SimpleItem,
} from "../../../lib/interfaces";
import {commitSession, destroySession, getSession} from "../../session";
import {HistoryItemList} from "../_components/HistoryItemList";
import InfoHover from "../_components/InfoHover";
import {ItemInfoMutex} from "../browser/MUTEX";

export async function loader({params, request}: LoaderFunctionArgs): Promise<
  | TypedResponse<{
      success: boolean;
      data: Promise<SimpleItem[]> | undefined;
      error: {msg: string} | undefined;
    }>
  | TypedDeferredData<{
      success: boolean;
      data: Promise<SimpleItem[]> | undefined;
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

  const id = params.id;
  const user = +session.data.userId;

  if (!id) {
    return defer({
      success: false,
      data: undefined,
      error: {msg: "unknown url requested"},
    });
  }

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
    data: Promise<SimpleItem[]> | undefined;
    error: {msg: string} | undefined;
  } = {
    success: true,
    data: undefined,
    error: undefined,
  };

  if (!itemInfo) {
    jsonData = {
      success: false,
      data: undefined,
      error: {msg: "Item " + id + " not found."},
    };
    return defer(jsonData, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const recommendationResult: RecommendationResponse | ErrorResponse =
    await fetchRecommendationsLLM(id.replaceAll("-", "/"));

  if ("error" in recommendationResult) {
    return defer(
      {
        success: false,
        data: undefined,
        error: {
          msg: recommendationResult.error as string,
        },
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }

  if (!recommendationResult) {
    return defer(
      {
        success: false,
        data: undefined,
        error: {
          msg:
            "There is no recommendation result for this user, " +
            "you can browser more and add more items to your library first.",
        },
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }

  const returnResult: SimpleItem[] = [];

  for (const i of recommendationResult.books) {
    const bookResult = await handleBookSearchAPI(i);
    if (bookResult.length >= 1) {
      const e = bookResult[0];
      returnResult.push({
        tag: [],
        id: e.srcId,
        title: e.itemTitle,
        type: ItemType.Book,
        img: e.thumbnailUrl,
      });
    }
  }

  for (const i of recommendationResult.songs) {
    const bookResult = await handleSongSearchAPI(i);
    if (bookResult.length >= 1) {
      const e = bookResult[0];
      returnResult.push({
        tag: [],
        id: e.srcId,
        title: e.itemTitle,
        type: ItemType.Song,
        img: e.thumbnailUrl,
      });
    }
  }

  for (const i of recommendationResult.movies) {
    const bookResult = await handleMovieSearchAPI(i);
    if (bookResult.length >= 1) {
      const e = bookResult[0];
      returnResult.push({
        tag: [],
        id: e.srcId,
        title: e.itemTitle,
        type: ItemType.Movie,
        img: e.thumbnailUrl,
      });
    }
  }

  if (returnResult.length === 0) {
    return defer(
      {
        success: false,
        data: undefined,
        error: {
          msg:
            "There is no recommendation result for this user, " +
            "you can browser more and add more items to your library first.",
        },
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }

  await addHistoryItemForUser(user, +id);

  jsonData = {
    success: true,
    data: Promise.all(returnResult),
    error: undefined,
  };

  return defer(jsonData, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function RecommendationPage(): React.JSX.Element {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {data} = useLoaderData<typeof loader>();

  return (
    <>
      <Suspense
        fallback={
          <>
            <div className="card w-full shadow-none">
              <div className="card-body">
                <h2 className="card-title mx-2 text-2xl lg:text-3xl">
                  Recommendation
                  <InfoHover info="This is recommendation based on the relevance of the item" />
                </h2>
                <div className="flex w-52 flex-col gap-4">
                  <div className="skeleton h-32 w-full"></div>
                  <div className="skeleton h-4 w-28"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-full"></div>
                </div>
              </div>
            </div>
          </>
        }>
        <Await resolve={data}>
          {(items) => (
            <>
              {items && !("emptyObjectSymbol" in items) ? (
                <HistoryItemList
                  title="Recommendation"
                  items={items as SimpleItem[]}
                  info="This is recommendation based on the relevance of the item"
                />
              ) : (
                <div className="card w-full shadow-none">
                  <div className="card-body">
                    <h2 className="card-title mx-2 text-2xl lg:text-3xl">
                      Recommendation
                      <InfoHover info="This is recommendation based on the relevance of the item" />
                    </h2>
                    <p className="text-center">No Recommendation</p>
                  </div>
                </div>
              )}
            </>
          )}
        </Await>
      </Suspense>
    </>
  );
}
