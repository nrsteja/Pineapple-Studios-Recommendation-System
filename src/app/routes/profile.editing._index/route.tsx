import {
  LoaderFunctionArgs,
  Session,
  TypedResponse,
  json,
} from "@remix-run/node";
import {Form, NavLink, useFetcher, useLoaderData} from "@remix-run/react";
import React, {useEffect, useRef, useState} from "react";
import {getUserInfoByUserId} from "src/lib/dataRetrieve/getUserInfo";
import {
  updateUserEmail,
  updateUserName,
} from "src/lib/dataRetrieve/handleUserInfo";
import {
  getPreferencesOfUser,
  removePreferenceForUser,
} from "src/lib/dataRetrieve/handleUserPreferences";

import {getUserById} from "../../../lib/database/user";
import {User} from "../../../lib/interfaces";
import {
  SessionData,
  SessionFlashData,
  commitSession,
  getSession,
} from "../../session";
import InfoHover from "../_components/InfoHover";
import {ToastList} from "../_components/ToastList";
import {PrefListChoose} from "../profile.editing.first-time/components/PrefListChoose";

interface EditData {
  name: string;
  email: string;
  preferences: string[];
}

export async function action({request}: LoaderFunctionArgs) {
  const session: Session<SessionData, SessionFlashData> = await getSession(
    request.headers.get("cookie"),
  );
  let user;
  if (session.data.userId !== undefined) {
    user = await getUserById(parseInt(session.data.userId));
  }

  const formData: FormData = await request.formData();

  // Extract userName and email from the form data.
  const newUserName: string | undefined =
    formData.get("name")?.toString() || user?.userName; // Notice we're using
  // `userName` here

  const newEmail = formData.get("email")?.toString() || user?.email;

  const preferences = formData.get("preferences");
  let preferencesArray: string[] = [];
  if (typeof preferences === "string") {
    preferencesArray = preferences.split(",");
  }

  // Update userName and email if they have changed.
  if (user) {
    if (newUserName && user.userName !== newUserName) {
      await updateUserName(user.id, newUserName); // Pass 'newUserName' instead
      // of 'newName'
    }
    if (newEmail && user.email !== newEmail) {
      await updateUserEmail(user.id, newEmail);
    }
    const userOldPreferences = await getPreferencesOfUser(user.id);
    if (!userOldPreferences) {
      console.log("User preferences is empty.");
      return json({
        success: true,
        error: {msg: "User preferences added successfully."},
      });
    }

    // If oldPreference is not found in preferencesArray, remove it for the user
    for (const oldPreference of userOldPreferences) {
      if (!preferencesArray.includes(oldPreference)) {
        await removePreferenceForUser(user.id, oldPreference);
      }
    }
  }

  return json({
    success: true,
    error: {msg: "User preferences added successfully."},
  });
}

export async function loader({request}: LoaderFunctionArgs): Promise<
  TypedResponse<{
    success: boolean;
    user: User | null;
    error: {msg: string} | undefined;
  }>
> {
  const session = await getSession(request.headers.get("cookie"));

  let userData;
  if (session.data.userId) {
    userData = await getUserInfoByUserId(parseInt(session.data.userId));
  }
  if (session.data.userId) {
    userData = await getUserInfoByUserId(parseInt(session.data.userId));
    // Get the user's current preferences
  }

  if (!userData || !userData.history) {
    return json(
      {
        success: false,
        user: null,
        error: {msg: "User Information cannot load."},
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
      user: userData,
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [emailError, setEmailError] = useState("");

  // Initial form data setup with useState
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [formData, setFormData] = useState<EditData>({
    name: loaderData.user?.name ?? "",
    email: loaderData.user?.email ?? "example@gmail.com",
    preferences: loaderData.user?.preference ?? [],
  });

  // Handle changes in the input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setEmailError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!loaderData) {
    return (
      <>
        <h1 className={"text-error"}>Error</h1>
      </>
    );
  }

  if (!loaderData.success || !loaderData!.user) {
    return (
      <>
        <h1 className={"text-error"}>{loaderData.error?.msg}</h1>
      </>
    );
  }
  const handlePreferenceClick = (clickedPreference: string) => {
    setFormData((prevData) => {
      const newPreferences = prevData.preferences.includes(clickedPreference)
        ? prevData.preferences.filter((p) => p !== clickedPreference)
        : [...prevData.preferences, clickedPreference];

      return {
        ...prevData,
        preferences: newPreferences,
      };
    });
  };

  function isValidEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email); // Simple regex for email validation
  }

  const submitForm = async () => {
    // Create a FormData object to include the preferences
    if (!isValidEmail(formData.email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
      const updatedFormData = new FormData();
      updatedFormData.append("name", formData.name);
      updatedFormData.append("email", formData.email);
      // Join the preferences array into a string
      updatedFormData.append("preferences", formData.preferences.join(","));

      // Log FormData to ensure correct data is being sent
      for (const [key, value] of updatedFormData.entries()) {
        console.log(key, value);
      }

      // Use the FormData in the fetcher.submit call
      fetcher.submit(updatedFormData, {method: "post"});
      console.log("Form submitted:", formData);
      // Add your form submission logic here
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
  const formRef = useRef<HTMLFormElement>(null);

  const hanldeChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (
      window.confirm(
        "Your changes in this page will not be saved. Do you want to skip?",
      )
    ) {
      formRef.current?.submit();
    }
  };

  return (
    <>
      <div className="hero min-h-screen">
        <div className="hero-content flex-col justify-between lg:flex-row">
          <div className="card w-full min-w-96 bg-base-200 shadow-xl lg:w-1/3">
            <div className="card-body">
              <div>
                <div className="form-control">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Your email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  />
                  {emailError && <p style={{color: "red"}}>{emailError}</p>}
                </div>
                {/*<div className="my-2 flex w-full flex-row justify-center gap-6">*/}
                <div className="card-actions join join-horizontal mt-4 min-w-72 justify-between">
                  <div className="card-actions join-item">
                    <NavLink to="/tab/4">
                      <button className="btn btn-secondary min-w-24">
                        Cancel
                      </button>
                    </NavLink>
                  </div>
                  <div className="card-actions join-item">
                    <button className="btn btn-primary" onClick={submitForm}>
                      Save All Changes
                    </button>
                  </div>
                </div>
                {/*</div>*/}
              </div>
            </div>
          </div>
          <div className="card w-full overflow-x-auto bg-base-200 shadow-xl lg:w-2/3">
            <div className="card-body">
              <h2 className="card-title">
                Preferences
                <InfoHover info={"Click to remove preferences"} />
              </h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loaderData.user.preference.map((preference, index) => (
                  <PrefListChoose
                    key={index}
                    preference={[preference]}
                    selected={formData.preferences}
                    onPreferenceClick={handlePreferenceClick}
                  />
                ))}
              </div>
              {/* <NavLink
                className="btn btn-primary"
                to={"/profile/editing/first-time"}>
                {" "}
                Click to add more preferences
              </NavLink> */}
              <Form
                ref={formRef}
                method="get"
                action="/profile/editing/first-time">
                <button
                  className="btn btn-primary w-full"
                  type="submit"
                  onClick={hanldeChange}>
                  Click to add more preferences
                </button>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <ToastList data={toasts} removeToast={removeToast} />
    </>
  );
}
