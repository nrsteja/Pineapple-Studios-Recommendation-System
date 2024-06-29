import React, {useRef} from "react";

import {Toast} from "./Toast";

interface ToastListProps {
  data: {
    id: number;
    message: string;
    type: string;
  }[];
  removeToast: (id: number) => void;
}

export function ToastList({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeToast,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...rest
}: ToastListProps): React.JSX.Element {
  const listRef = useRef(null);

  return (
    <>
      {data.length > 0 && (
        <div
          className="toast toast-end toast-bottom"
          aria-live="assertive"
          ref={listRef}>
          {data.map((toast, index) => (
            <Toast
              key={index}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
