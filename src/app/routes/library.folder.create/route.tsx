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

import {Folder} from "../../../lib/interfaces";
import {
  SessionData,
  SessionFlashData,
  commitSession,
  destroySession,
  getSession,
} from "../../session";
import {ToastList} from "../_components/ToastList";

export async function loader({request}: LoaderFunctionArgs): Promise<
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

  return json(
    {
      success: true,
      data: undefined,
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

  if (!loaderData.success) {
    return (
      <>
        <h1 className={"text-error"}>{loaderData.error?.msg}</h1>
      </>
    );
  }

  const fetcher: FetcherWithComponents<{
    success: false;
    data: number;
    error: {msg: string}; // eslint-disable-next-line react-hooks/rules-of-hooks
  }> = useFetcher<{
    success: false;
    data: number;
    error: {msg: string};
  }>({key: "folder-create"});
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

  const [submitted, setSubmitted]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  ] = useState(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect((): void => {
    if (fetcher.data && !fetcher.data.success) {
      console.log(fetcher.data.error.msg);
      showToast(fetcher.data.error.msg, "error");
      fetcher.data = undefined;
    }

    if (
      !submitted &&
      (fetcher.state === "submitting" || fetcher.state === "loading")
    ) {
      setSubmitted(true);
    }

    if (
      submitted &&
      fetcher.state === "idle" &&
      fetcher.data &&
      fetcher.data.success
    ) {
      window.location.href =
        "/library/folder/item-editing/" + fetcher.data.data;
    }
  }, [fetcher, showToast, submitted]);

  return (
    <>
      <div className="hero min-h-screen">
        <div className="hero-content max-lg:m-2 lg:m-0">
          <div className="card items-center bg-base-200 shadow-xl">
            <div className="card-title mb-10 mt-12">
              <h1 className="block text-4xl">Create New Folder</h1>
            </div>
            <div className="card-body">
              <fetcher.Form
                className={"min-w-full"}
                method={"POST"}
                action={"/api/folder/create-no-item"}>
                <div className="form-control my-4">
                  <label className="input input-bordered flex items-center gap-2">
                    Name
                    <input
                      type="text"
                      className="grow"
                      id="name"
                      name="name"
                      placeholder="Folder Name"
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
                      defaultChecked={false}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn btn-neutral btn-wide my-1 min-w-full">
                  Create Folder
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
