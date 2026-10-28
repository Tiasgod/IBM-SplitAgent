import { type SelectHTMLAttributes, useId } from "react";
import { ChevronDown } from "lucide-react";
import "./Select.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
}

export function Select({
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
    <div className={`select-wrapper${error ? " select-wrapper--error" : ""} ${className ?? ""}`}>
      {label && (
        <label htmlFor={id} className="select-label">
          {label}
        </label>
      )}
      <div className="select-field">
        <select
          id={id}
          className="select-field__control"
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
