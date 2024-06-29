import {Form} from "@remix-run/react";
import {useRef} from "react";

export default function Logout(): React.JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);

  const handleLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (window.confirm("Are you sure you want to log out?")) {
      formRef.current?.submit();
    }
  };

  return (
    <>
      <Form ref={formRef} method="get" action="/logout">
        <button
          className="h-5 w-40 text-left"
          type="submit"
          onClick={handleLogout}>
          Logout
        </button>
      </Form>
    </>
  );
}
