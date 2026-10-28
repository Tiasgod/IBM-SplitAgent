import { type ButtonHTMLAttributes } from "react";
import { ChevronRight } from "lucide-react";
import "./Button.css";

export type ButtonVariant = "primary" | "ghost" | "subtle" | "card" | "cta";
export type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

interface CardButtonProps extends BaseButtonProps {
  variant: "card";
  /** Subtexto exibido abaixo do label no variant card */
  description?: string;
}

interface CtaButtonProps extends BaseButtonProps {
  variant: "cta";
  /** Ícone exibido à esquerda no variant cta */
  icon?: React.ReactNode;
}

export type ButtonProps = BaseButtonProps | CardButtonProps | CtaButtonProps;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    children,
    className,
    ...rest
  } = props;

  const isDisabled = disabled || loading;
  const cls = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    isDisabled ? "btn--disabled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "card") {
    const { description } = props as CardButtonProps;
    return (
      <button className={cls} disabled={isDisabled} {...rest}>
        <span className="btn-card__label">{children}</span>
        {description && (
          <span className="btn-card__description">{description}</span>
        )}
      </button>
    );
  }

  if (variant === "cta") {
    const { icon } = props as CtaButtonProps;
    return (
      <button className={cls} disabled={isDisabled} {...rest}>
        {icon && <span className="btn-cta__icon">{icon}</span>}
        <span className="btn-cta__label">{children}</span>
        <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button className={cls} disabled={isDisabled} {...rest}>
      {loading ? (
        <span className="btn__spinner" aria-hidden="true" />
      ) : (
        children
      )}
    </button>
  );
}
