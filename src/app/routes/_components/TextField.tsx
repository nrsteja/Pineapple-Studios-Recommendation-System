import {useEffect, useRef, useState} from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value?: string;
  showToggle?: boolean;
}

const EyeIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    height="1.35em"
    width="1.35em">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <path d="M15 12 A3 3 0 0 1 12 15 A3 3 0 0 1 9 12 A3 3 0 0 1 15 12 z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    height="1.35em"
    width="1.35em">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
  </svg>
);

export function TextField({
  id,
  label,
  type = "text",
  value = "",
  showToggle = false,
  ...rest
}: FormFieldProps) {
  const [inputType, setInputType] = useState(type);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.current && value !== undefined && input.current.value !== value) {
      input.current.value = value;
    }
  }, [value]);

  const toggleVisibility = () => {
    setInputType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  return (
    <div className="form-control max-sm:max-w-64 max-xs:max-w-48 sm:w-80">
      <label htmlFor={id} className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="input-group relative">
        <input
          ref={input}
          type={inputType}
          id={id}
          name={id}
          className="input input-bordered w-full pr-10"
          placeholder={`Enter your ${label.toLowerCase()}`}
          {...rest}
        />
        {showToggle && type === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-2"
            onClick={toggleVisibility}
            aria-label="Toggle password visibility">
            {inputType === "password" ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        )}
      </div>
    </div>
  );
}
