import { type SelectHTMLAttributes, useId } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import "./Select.css";

export type SelectVariant = "default" | "filter";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  variant?: SelectVariant;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
}

export function Select({
  variant = "default",
  options,
  placeholder = "Selecione",
  label,
  error,
  className,
  id: externalId,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <div className={`select-wrapper select-wrapper--${variant}${error ? " select-wrapper--error" : ""} ${className ?? ""}`}>
      {label && (
        <label htmlFor={id} className="select-label">
          {label}
        </label>
      )}
      <div className="select-field">
        {variant === "filter" && (
          <Calendar
            size={18}
            strokeWidth={1.75}
            className="select-field__icon-left"
            aria-hidden="true"
          />
        )}
        <select
          id={id}
          className={`select-field__control${variant === "filter" ? " select-field__control--filter" : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          defaultValue=""
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className="select-field__icon"
          aria-hidden="true"
        />
      </div>
      {error && (
        <span id={`${id}-error`} className="select-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
