import {
  LoaderFunctionArgs,
  Session,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import {
  FetcherWithComponents,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import React, {useEffect, useState} from "react";

import {getFolderInfo} from "../../../lib/dataRetrieve/getFolderInfo";
import {Folder} from "../../../lib/interfaces";
import {
  SessionData,
  SessionFlashData,
  commitSession,
  destroySession,
  getSession,
} from "../../session";
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

  const fetcher: FetcherWithComponents<{
    success: false;
    error: {msg: string}; // eslint-disable-next-line react-hooks/rules-of-hooks
  }> = useFetcher<{
    success: false;
    error: {msg: string};
  }>({key: "add-to-library"});
  fetcher.formAction = "post";

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
    if (fetcher.data && !fetcher.data.success) {
      console.log(fetcher.data.error.msg);
      showToast(fetcher.data.error.msg, "error");
      fetcher.data = undefined;
    }
    if (fetcher.state === "idle" && fetcher.data && fetcher.data.success) {
      console.log("go back");
      window.location.href = "/library/folder/" + loaderData.data?.id;
    }
  }, [fetcher, loaderData.data?.id, showToast]);

  const data: Folder = loaderData.data;

  return (
    <>
      <div className="hero min-h-screen">
        <div className="hero-content max-lg:m-2 lg:m-0">
          <div className="card items-center bg-base-200 shadow-xl">
            <div className="card-title mb-10 mt-12">
              <h1 className="block text-4xl">Editing: {data.name}</h1>
            </div>
            <div className="card-body">
              <fetcher.Form
                className={"min-w-full"}
                method={"POST"}
                action={"/api/folder/update"}>
                <input
                  type="hidden"
                  id="folder"
                  name="folder"
                  value={data.id}
                />
                <div className="form-control my-4">
                  <label className="input input-bordered flex items-center gap-2">
                    Name:
                    <input
                      type="text"
                      className="grow"
                      id="name"
                      name="name"
                      placeholder={data.name}
                      defaultValue={data.name}
                    />
                  </label>
                </div>
                <div className="form-control my-4">
                  <label className="label cursor-pointer">
                    <span className="label-text">This is a Series: </span>
                    <input
                      type="checkbox"
                      className="toggle"
                      id="isSeries"
                      name="isSeries"
                      defaultChecked={data.isSeries}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn btn-neutral btn-wide my-1 min-w-full">
                  Update Folder Info
                </button>
              </fetcher.Form>
            </div>
          </div>
        </div>
      </div>
      <ToastList data={toasts} removeToast={removeToast} />
    </>
  );
}
