import {
  LoaderFunctionArgs,
  Session,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import {
  NavigateFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import React, {useEffect, useState} from "react";

import {
  getItemInfoByItemId,
  getItemInfoBySrcId,
} from "../../../lib/dataRetrieve/getItemInfo";
import {ItemInfo} from "../../../lib/interfaces";
import {
  SessionData,
  SessionFlashData,
  commitSession,
  destroySession,
  getSession,
} from "../../session";
import InfoHover from "../_components/InfoHover";
import {ToastList} from "../_components/ToastList";
import {ItemInfoMutex} from "../browser/MUTEX";
import {PrefListChoose} from "./components/PrefListChoose";

export async function loader({request, params}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    success: boolean;
    data: ItemInfo | undefined;
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
    return json({
      success: false,
      data: undefined,
      error: {msg: "unknown url requested"},
    });
  }

  const userId: number = +session.data.userId;

  let itemInfo;
  if (isNaN(+id)) {
    await ItemInfoMutex.runExclusive(async () => {
      itemInfo = await getItemInfoBySrcId(id, userId);
    });
  } else if (!isNaN(+id)) {
    itemInfo = await getItemInfoByItemId(+id, +session.data.userId);
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

  if (!itemInfo.isInLibrary && itemInfo.id) {
    return redirect("/browser/item/" + itemInfo.id, {
      headers: {"Set-Cookie": await commitSession(session)},
    });
  }

  if (id !== itemInfo.id.toString()) {
    return redirect("/library/item/" + itemInfo.id, {
      headers: {"Set-Cookie": await commitSession(session)},
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

  if (!loaderData.data) {
    return (
      <>
        <h1 className={"text-error"}>Error Data Not Found</h1>
      </>
    );
  }

  const [formData, setFormData]: [
    string[],
    React.Dispatch<React.SetStateAction<string[]>>,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  ] = useState<string[]>(loaderData.data.tag);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [newTag, setNewTag]: [
    string,
    React.Dispatch<React.SetStateAction<string>>,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  ] = useState<string>("");

  const [preference, setPreferences]: [
    string[],
    React.Dispatch<React.SetStateAction<string[]>>,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  ] = useState<string[]>(loaderData.data.tag);

  function addPreference(message: string) {
    setFormData([...formData, message]);
  }

  function removePreference(message: string) {
    setFormData(formData.filter((e: string) => e !== message));
  }

  function addNewTag() {
    addPreference(newTag);
    setPreferences([...preference, newTag]);
  }

  function onChange(event: {target: {value: React.SetStateAction<string>}}) {
    setNewTag(event.target.value);
  }

  const handlePreferenceClick = (clickedPreference: string) => {
    console.log("Clicked Preference: ", clickedPreference);
    if (!formData.includes(clickedPreference)) {
      addPreference(clickedPreference);
    } else {
      removePreference(clickedPreference);
    }
  };

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
  const navigate: NavigateFunction = useNavigate();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (
      fetcherAddToLibrary.state === "idle" &&
      fetcherAddToLibrary.data &&
      !fetcherAddToLibrary.data.success
    ) {
      showToast(fetcherAddToLibrary.data.error.msg, "error");
      fetcherAddToLibrary.data = undefined;
    }
    if (
      fetcherAddToLibrary.state === "idle" &&
      fetcherAddToLibrary.data &&
      fetcherAddToLibrary.data.success
    ) {
      console.log("go back");
      // navigate("/library/folder/" + loaderData.data?.folder?.id);
      window.location.href = "/library/item/" + loaderData.data?.id;
    }
  }, [fetcherAddToLibrary, loaderData.data?.id, navigate, showToast]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Adding Tags for: {loaderData.data.title}
        </h1>
        <div className="hero">
          <div className="hero-content">
            <div className="card">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {preference.map((preference: string, index: number) => (
                  <>
                    <PrefListChoose
                      key={index}
                      preference={[preference]}
                      selected={formData}
                      onPreferenceClick={handlePreferenceClick}
                    />
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="hero">
          <div className="hero-content">
            <div className="card">
              <h2 className="card-title my-2">
                Add tags <InfoHover info="Click on a tag to remove it" />{" "}
              </h2>
              <label className="input input-bordered my-2 flex items-center gap-1">
                <input
                  type="text"
                  className="grow"
                  placeholder="New Tag"
                  value={newTag}
                  onChange={onChange}
                />
              </label>

              <button className="btn my-2 w-full" onClick={addNewTag}>
                Add
              </button>
            </div>
          </div>
        </div>

        <fetcherAddToLibrary.Form
          className={"w-full"}
          method={"POST"}
          action={"/api/item/set-tags"}>
          {formData.map((e: string, index: number) => {
            return <input key={index} type="hidden" name="tag" value={e} />;
          })}
          <input type="hidden" name="item" value={loaderData.data.id} />
          <button
            type="submit"
            className="btn my-2 w-full rounded-xl bg-gradient-to-r
            from-orange-500 to-red-500 px-6 text-lg text-black hover:scale-95">
            Finish
          </button>
        </fetcherAddToLibrary.Form>
      </div>
      <ToastList data={toasts} removeToast={removeToast} />
    </>
  );
}
