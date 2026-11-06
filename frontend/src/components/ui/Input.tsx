import { type InputHTMLAttributes, useId, useState } from "react";
import { Calendar, Eye, EyeOff } from "lucide-react";
import "./Input.css";

export type InputVariant = "text" | "date" | "password" | "number";

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
  const [showPassword, setShowPassword] = useState(false);

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
          type={
            variant === "date"     ? "date"                              :
            variant === "password" ? (showPassword ? "text" : "password") :
            variant === "number"   ? "number"                            :
            "text"
          }
          className={`input-field__control${variant === "date" ? " input-field__control--date" : ""}${variant === "password" ? " input-field__control--password" : ""}`}
          placeholder={variant === "date" ? "DD/MM/AA" : rest.placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {variant === "password" && (
          <button
            type="button"
            className="input-field__password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            tabIndex={-1}
          >
            {showPassword
              ? <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
              : <Eye    size={18} strokeWidth={1.75} aria-hidden="true" />
            }
          </button>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} className="input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
