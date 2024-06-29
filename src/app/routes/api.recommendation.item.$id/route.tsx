import {
  LoaderFunctionArgs,
  Session,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";

import {fetchRecommendations} from "../../../lib/dataRetrieve/fetchRecent3Items";
import {
  handleBookSearchAPI,
  handleMovieSearchAPI,
  handleSongSearchAPI,
} from "../../../lib/dataRetrieve/getAPIInfo";
import {
  ErrorResponse,
  ItemType,
  RecommendationResponse,
  SimpleItem,
} from "../../../lib/interfaces";
import {
  SessionData,
  SessionFlashData,
  commitSession,
  destroySession,
  getSession,
} from "../../session";

export async function loader({request, params}: LoaderFunctionArgs): Promise<
  | TypedResponse<never>
  | TypedResponse<{
      success: boolean;
      data: {data: SimpleItem[]} | null;
      error: {msg: string} | null;
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

  const id = params.id;

  if (!id) {
    return json(
      {
        success: false,
        data: null,
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

  const recommendationResult: RecommendationResponse | ErrorResponse =
    await fetchRecommendations(id.replaceAll("-", "/"));

  if ("error" in recommendationResult) {
    return json(
      {
        success: false,
        data: null,
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
    return json(
      {
        success: false,
        data: null,
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
    return json(
      {
        success: false,
        data: null,
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

  return json(
    {
      success: true,
      data: {data: returnResult},
      error: null,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
}
