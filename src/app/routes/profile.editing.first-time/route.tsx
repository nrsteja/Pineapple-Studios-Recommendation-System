import {LoaderFunctionArgs, Session, json, redirect} from "@remix-run/node";
import {useFetcher, useLoaderData} from "@remix-run/react";
import React, {useEffect, useState} from "react";

import {createNewPreference} from "../../../lib/dataRetrieve/createPreference";
import {getAllPreferencesInTheSystem} from "../../../lib/dataRetrieve/getPreferences";
import {
  addPreferenceForUser,
  getPreferencesOfUser,
  removePreferenceForUser,
} from "../../../lib/dataRetrieve/handleUserPreferences";
import {getUserById} from "../../../lib/database/user";
import {
  SessionData,
  SessionFlashData,
  destroySession,
  getSession,
} from "../../session";
import {ToastList} from "../_components/ToastList";
import {PrefListChoose} from "./components/PrefListChoose";

export async function action({request}: LoaderFunctionArgs) {
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

  const user = await getUserById(parseInt(session.data.userId));

  const formData: FormData = await request.formData();
  const preferences: string[] = Array.from(formData.getAll("preference")).map(
    (value: FormDataEntryValue) => {
      if (typeof value === "string") {
        return value; // If it's already a string, return it as is
      } else {
        return ""; // If it's not a string (e.g., a file), handle it accordingly
      }
    },
  );
  let currentUserPreferences: string[] = [];

  if (user) {
    currentUserPreferences = await getPreferencesOfUser(user.id);
  }

  if (user) {
    for (const temp of preferences) {
      // If the preference is not already included in currentUserPreferences,
      // add it
      if (!currentUserPreferences.includes(temp)) {
        await addPreferenceForUser(user.id, temp);
      }
    }

    for (const temp of currentUserPreferences) {
      // If a preference from currentUserPreferences is not in preferences,
      // remove it
      if (!preferences.includes(temp)) {
        await removePreferenceForUser(user.id, temp);
      }
    }
  }

  return json({
    success: true,
    msg: "User preferences added successfully.",
  });
}

export async function loader({request}: LoaderFunctionArgs) {
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

  await getAllPreferencesInTheSystem();
  const preferenceData: string[] = [];
  const additionalPreferences = [
    "Action",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Horror",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "Western",
    "Biography",
    "Self-help",
    "Travel",
    "Science",
    "Poetry",
    "Pop",
    "Jazz",
    "Ambient",
    "Reggaeton",
    "Indie Folk",
    "K-Pop",
  ];

  for (const preference of additionalPreferences) {
    await createNewPreference(preference);
    preferenceData.push(preference);
  }

  let userCurrentPreferences = await getPreferencesOfUser(
    parseInt(session.data.userId),
  );

  if (!userCurrentPreferences) {
    userCurrentPreferences = [];
  }

  let userName = "";
  const user = await getUserById(parseInt(session.data.userId));

  if (user !== null) {
    userName = user.userName;
  }

  return {
    preferenceData,
    userName,
    userCurrentPreferences,
  };
}

export default function TabIndex(): React.JSX.Element {
  const loaderData = useLoaderData<typeof loader>();

  const [formData, setFormData] = useState<string[]>(
    loaderData.userCurrentPreferences,
  );

  const addPreference = (message: string) => {
    setFormData([...formData, message]);
  };

  const removePreference = (message: string) => {
    setFormData(formData.filter((e) => e !== message));
  };

  const handlePreferenceClick = (clickedPreference: string) => {
    console.log("Clicked Preference: ", clickedPreference);
    if (!formData.includes(clickedPreference)) {
      addPreference(clickedPreference);
    } else {
      removePreference(clickedPreference);
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
      showToast(fetcher.data.error.msg, "error");
      fetcher.data = undefined;
    }
    if (fetcher.state === "idle" && fetcher.data && fetcher.data.success) {
      console.log("go back");
      window.location.href = "/tab/4";
    }
  }, [fetcher, showToast]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Welcome, {loaderData.userName}
        </h1>
        <div className="mb-4 text-center">
          <h2 className="text-lg font-bold">Choose what you like:</h2>
          <p className="text-md">
            You have selected <strong>{formData.length}</strong> preferences.
          </p>
        </div>
        <div className="flex h-full items-center justify-center">
          <div className="artboard artboard-horizontal phone-4">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loaderData.preferenceData.map((preference, index) => (
                <PrefListChoose
                  key={index}
                  preference={[preference]}
                  selected={formData}
                  onPreferenceClick={handlePreferenceClick}
                />
              ))}
            </div>
          </div>
        </div>
        <fetcher.Form
          className={"join mt-2 w-full min-w-full"}
          method={"POST"}
          action={"/profile/editing/first-time"}>
          {formData.map((preference, index) => (
            <input
              key={index}
              type="hidden"
              name="preference"
              value={preference}
            />
          ))}
          <div className="mb-6 flex w-full flex-col items-center text-2xl md:mt-96 md:pt-24 lg:mt-60 lg:pt-0 xl:mt-16">
            <h2>All Good! Press next to continue!</h2>
            <input
              type="submit"
              value="Next"
              className="btn my-2 w-32 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 text-lg text-black hover:scale-95"
            />
          </div>
        </fetcher.Form>
      </div>
      <ToastList data={toasts} removeToast={removeToast} />
    </>
  );
}
