import { type InputHTMLAttributes, useId } from "react";
import { Calendar } from "lucide-react";
import "./Input.css";

export type InputVariant = "text" | "date" | "password";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  variant?: InputVariant;
  label?: string;
  error?: string;
}

export function Input({
  variant = "text",
  label,
  error,
  className,
  id: externalId,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <div className={`input-wrapper${error ? " input-wrapper--error" : ""} ${className ?? ""}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <div className="input-field">
        {variant === "date" && (
          <Calendar
            size={18}
            strokeWidth={1.75}
            className="input-field__icon"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type={variant === "date" ? "date" : variant === "password" ? "password" : "text"}
          className={`input-field__control${variant === "date" ? " input-field__control--date" : ""}`}
          placeholder={variant === "date" ? "DD/MM/AA" : rest.placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <span id={`${id}-error`} className="input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
