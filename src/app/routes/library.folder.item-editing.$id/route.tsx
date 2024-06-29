import {
  LoaderFunctionArgs,
  Session,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import {useFetcher, useLoaderData} from "@remix-run/react";
import React, {useEffect, useState} from "react";

import {getFolderInfo} from "../../../lib/dataRetrieve/getFolderInfo";
import {getLibraryInfoByUserId} from "../../../lib/dataRetrieve/getLibraryInfo";
import {Folder, Library, SimpleItem} from "../../../lib/interfaces";
import {
  SessionData,
  SessionFlashData,
  commitSession,
  destroySession,
  getSession,
} from "../../session";
import {ToastList} from "../_components/ToastList";
import {SelectableItemList} from "./components/SelectableItemList";

export async function loader({request, params}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    success: boolean;
    data: {folder: Folder | undefined; items: SimpleItem[]} | undefined;
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

  const library: Library | null = await getLibraryInfoByUserId(
    +session.data.userId,
  );

  let jsonData: {
    success: boolean;
    data: {folder: Folder | undefined; items: SimpleItem[]} | undefined;
    error: {msg: string} | undefined;
  } = {
    success: true,
    data: {
      folder: folderInfo,
      items: library?.items ?? [],
    },
    error: undefined,
  };

  if (!library) {
    jsonData = {
      success: false,
      data: undefined,
      error: {msg: "Library for user " + session.data.userId + " not found."},
    };
    return json(jsonData, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

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

export default function TabIndex(): React.JSX.Element {
  const loaderData = useLoaderData<typeof loader>();

  if (!loaderData.success) {
    return (
      <>
        <h1 className={"text-error"}>{loaderData.error?.msg}</h1>
      </>
    );
  }

  if (!loaderData.data || !loaderData.data.folder) {
    return (
      <>
        <h1 className={"text-error"}>Error Data Not Found</h1>
      </>
    );
  }

  const [formData, setFormData]: [
    (string | number)[],
    React.Dispatch<React.SetStateAction<(string | number)[]>>,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  ] = useState<(string | number)[]>(
    loaderData.data.folder?.items.map((e) => e.id),
  );

  const currentItems: SimpleItem[] = loaderData.data.folder.items;
  const currentItemsId: (string | number)[] = currentItems.map(
    (item: SimpleItem) => item.id,
  );
  const unselectedItems: SimpleItem[] = loaderData.data.items.filter(
    (e: SimpleItem) => !currentItemsId.includes(e.id),
  );
  const initialItems: SimpleItem[] = [...currentItems, ...unselectedItems];

  const handleClick = (value: number | string) => {
    console.log("Clicked Preference: ", value);
    if (!formData.includes(value)) {
      setFormData([...formData, value]);
    } else {
      setFormData(formData.filter((e: number | string) => e !== value));
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const fetcher = useFetcher<{
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
  const autoClose = true;
  const autoCloseDuration = 5;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const showToast = (message: string, type: string) => {
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
      setTimeout(() => {
        removeToast(toast.id);
      }, autoCloseDuration * 1000);
    }
  };

  function removeToast(id: number) {
    setToasts((prevToasts: {id: number; message: string; type: string}[]) =>
      prevToasts.filter(
        (toast: {id: number; message: string; type: string}) => toast.id !== id,
      ),
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.success) {
      console.log(fetcher.data.error.msg);
      showToast(fetcher.data.error.msg, "error");
      fetcher.data = undefined;
    }
    if (fetcher.state === "idle" && fetcher.data && fetcher.data.success) {
      console.log("go back");
      window.location.href = "/library/folder/" + loaderData.data?.folder?.id;
    }
  }, [fetcher, loaderData.data?.folder?.id, showToast]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Adding Tags for: {loaderData.data.folder.name}
        </h1>
        <div className="hero">
          <SelectableItemList
            title="Book"
            selected={formData}
            items={initialItems}
            clickIt={handleClick}
          />
        </div>
        <fetcher.Form
          className="w-full"
          method="POST"
          action={"/api/folder/set-items"}>
          {formData.map((e: string | number, index: number) => {
            return (
              <input
                key={index}
                type="hidden"
                name="item"
                value={e.toString()}
              />
            );
          })}
          <input
            type="hidden"
            name="folder"
            value={loaderData.data.folder.id}
          />
          <button
            type="submit"
            className="btn my-2 w-full rounded-xl bg-gradient-to-r
            from-orange-500 to-red-500 px-6 text-lg text-black hover:scale-95">
            Finish
          </button>
        </fetcher.Form>
      </div>
      <ToastList data={toasts} removeToast={removeToast} />
    </>
  );
}
