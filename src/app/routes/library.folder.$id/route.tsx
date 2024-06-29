import {
  LoaderFunctionArgs,
  Session,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import {
  FetcherWithComponents,
  Form,
  NavLink,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import React, {useEffect, useRef, useState} from "react";

import {getFolderInfo} from "../../../lib/dataRetrieve/getFolderInfo";
import {Folder, SimpleItem} from "../../../lib/interfaces";
import {
  SessionData,
  SessionFlashData,
  commitSession,
  destroySession,
  getSession,
} from "../../session";
import {HistoryItemList} from "../_components/HistoryItemList";
import InfoHover from "../_components/InfoHover";
import {ToastList} from "../_components/ToastList";

export async function loader({params, request}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    success: boolean;
    data: Folder | undefined;
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

  const id: string | undefined = params.id;
  if (!id) {
    return json(
      {
        success: false,
        data: undefined,
        error: {msg: "unknown url requested"},
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }

  const folderInfo: Folder | undefined =
    (await getFolderInfo(+id, +session.data.userId)) ?? undefined;

  let jsonData: {
    success: boolean;
    data: Folder | undefined;
    error: {msg: string} | undefined;
  } = {
    success: true,
    data: folderInfo,
    error: undefined,
  };

  if (!folderInfo) {
    jsonData = {
      success: false,
      data: undefined,
      error: {msg: "Folder " + id + " not found."},
    };
    return json(jsonData, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
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

  if (!loaderData.data) {
    return (
      <>
        <h1 className={"text-error"}>Error Data Not Found</h1>
      </>
    );
  }

  const fetcherAddToLibrary: FetcherWithComponents<{
    success: false;
    error: {msg: string}; // eslint-disable-next-line react-hooks/rules-of-hooks
  }> = useFetcher<{
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
  const autoClose: boolean = true;
  const autoCloseDuration: number = 5;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const showToast = (message: string, type: string): void => {
    const toast: {id: number; message: string; type: string} = {
      id: Date.now(),
      message,
      type,
    };

    setToasts(
      (
        prevToasts: {
          id: number;
          message: string;
          type: string;
        }[],
      ) => [...prevToasts, toast],
    );

    if (autoClose) {
      setTimeout((): void => {
        removeToast(toast.id);
      }, autoCloseDuration * 1000);
    }
  };

  function removeToast(id: number) {
    setToasts(
      (
        prevToasts: {
          id: number;
          message: string;
          type: string;
        }[],
      ) =>
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formRef = useRef<HTMLFormElement>(null);

  const handleLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (window.confirm("Are you sure you want to delete the folder?")) {
      formRef.current?.submit();
    }
  };

  const data: Folder = loaderData.data;
  const items: SimpleItem[] = data.items;

  return (
    <>
      <div className="hero min-h-screen">
        <div className="hero-content max-lg:m-2 max-lg:flex-col lg:m-0 lg:flex-row lg:items-start lg:justify-start ">
          {/*Left Card Begin*/}
          <div className="lg:m-sm min-w-[25rem] max-md:w-96 lg:sticky lg:top-[88px] lg:max-w-md ">
            <div className="card items-center bg-base-200 shadow-xl">
              <figure className="mask mask-squircle mx-3 my-4  h-72 w-72 justify-items-center">
                <img
                  className="h-72 w-72"
                  src={data.img}
                  alt="Poster of the item"
                />
              </figure>

              <div className="card-body">
                <div className="card-title">
                  <h1 className="block text-4xl">{data.name}</h1>
                </div>
                <p className="mt-2 block text-lg">Item Count: {items.length}</p>
                {data.isSeries && (
                  <p className="mt-2 block text-lg">This is a Series.</p>
                )}
              </div>
            </div>
          </div>
          {/*Left Card End*/}

          <div className={"max-lg:mt-4 lg:hidden"}></div>

          {/*Right Card Begin*/}
          <div className="self-start">
            <div className={"card w-full min-w-80 items-center"}>
              <NavLink
                to={"/library/folder/editing/" + data.id}
                className="btn btn-neutral btn-wide my-1 min-w-full">
                Edit Folder
              </NavLink>
              <NavLink
                to={"/library/folder/item-editing/" + data.id}
                className="btn btn-neutral btn-wide my-1 min-w-full">
                Edit Items
              </NavLink>
              <Form
                ref={formRef}
                method="post"
                action={"/api/folder/delete"}
                className="my-1 min-w-full">
                <input
                  type="hidden"
                  name="folder"
                  value={loaderData.data.id}></input>
                <button
                  className="btn btn-error min-w-full"
                  type="submit"
                  onClick={handleLogout}>
                  Delete Folder
                </button>
              </Form>
            </div>
            <div className={"max-lg:mt-12 lg:my-4"}></div>
            <div className="card min-w-[25rem] self-start bg-base-200 shadow-xl max-md:w-96">
              {items.length > 0 && (
                <HistoryItemList
                  title="Items in Folder"
                  items={items}
                  info="These are the items in the folder"
                />
              )}
              {items.length === 0 && (
                <>
                  <div className="card w-full shadow-none">
                    <div className="card-body">
                      <h2 className="card-title mx-2 text-2xl lg:text-3xl">
                        Items in Folder
                        <InfoHover info="These are no items in the folder" />
                      </h2>
                      <div className="text-center text-error">
                        No items in the folder yet.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {/*Right Card End*/}
        </div>
      </div>
      <ToastList data={toasts} removeToast={removeToast} />
    </>
  );
}
