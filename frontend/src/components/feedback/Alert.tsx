import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";
import "./Alert.css";

export type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const icons: Record<AlertVariant, React.ReactNode> = {
  info:    <Info        size={18} strokeWidth={2} aria-hidden="true" />,
  success: <CheckCircle size={18} strokeWidth={2} aria-hidden="true" />,
  warning: <AlertTriangle size={18} strokeWidth={2} aria-hidden="true" />,
  error:   <XCircle    size={18} strokeWidth={2} aria-hidden="true" />,
};

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  return (
    <div
      className={`alert alert--${variant} ${className ?? ""}`}
      role="alert"
      aria-live="polite"
    >
      <span className="alert__icon">{icons[variant]}</span>
      <div className="alert__body">
        {title && <strong className="alert__title">{title}</strong>}
        <span className="alert__message">{children}</span>
      </div>
      {onClose && (
        <button
          className="alert__close"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
