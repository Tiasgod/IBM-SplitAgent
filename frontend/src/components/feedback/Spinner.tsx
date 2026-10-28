import "./Spinner.css";

export type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

export function Spinner({ size = "md", label = "Carregando...", className }: SpinnerProps) {
  return (
    <span
      className={`spinner spinner--${size} ${className ?? ""}`}
      role="status"
      aria-label={label}
    >
      <span className="spinner__ring" aria-hidden="true" />
    </span>
  );
}
