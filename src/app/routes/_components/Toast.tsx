import React from "react";

interface ToastProps {
  message?: string;
  type?: string;
  onClose: () => void;
}

export function Toast({
  message = "Alter",
  type = "error",
  onClose,
  ...rest
}: ToastProps): React.JSX.Element {
  return (
    <div className="toast toast-end">
      <div className={`alert alert-${type}`}>
        <span>{message}</span>

        <button className="btn btn-circle" onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
