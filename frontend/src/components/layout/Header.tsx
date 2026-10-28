import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "../brand";
import "./Header.css";

export type HeaderVariant =
  | "nav"            // mobile: hamburguer esquerda + logo texto direita
  | "logo-centered"  // mobile: logo centralizada (login/splash)
  | "logo-left"      // mobile: logo alinhada à esquerda (páginas internas)
  | "agent-back"     // chat: seta voltar + avatar + Logo
  | "agent-forward"  // chat: seta avançar + avatar + Logo (desktop collapsed)
  | "avatar-back";   // chat compacto: seta voltar + avatar apenas

interface HeaderProps {
  variant?: HeaderVariant;
  onMenuClick?: () => void;
  onBack?: () => void;
  onForward?: () => void;
  /** Src da imagem do avatar (agent-* | avatar-back) */
  avatarSrc?: string;
  /** Subtítulo exibido abaixo da logo nas variantes agent-* */
  subtitle?: string;
  className?: string;
}

export function Header({
  variant = "nav",
  onMenuClick,
  onBack,
  onForward,
  avatarSrc,
  subtitle = "Seu assistente financeiro",
  className,
}: HeaderProps) {
  const avatarEl = (
    <div className="header__avatar">
      {avatarSrc
        ? <img src={avatarSrc} alt="Assistente" />
        : <span className="header__avatar-placeholder" aria-hidden="true" />}
    </div>
  );

  if (variant === "logo-centered") {
    return (
      <header className={`header header--logo-centered ${className ?? ""}`}>
        <Logo variant="full" size="md" />
      </header>
    );
  }

  if (variant === "logo-left") {
    return (
      <header className={`header header--logo-left ${className ?? ""}`}>
        <Logo variant="full" size="md" />
      </header>
    );
  }

  if (variant === "nav") {
    return (
      <header className={`header header--nav ${className ?? ""}`}>
        <button
          className="header__icon-btn"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
        <Logo variant="full" size="sm" />
      </header>
    );
  }

  if (variant === "agent-back") {
    return (
      <header className={`header header--agent ${className ?? ""}`}>
        <button
          className="header__icon-btn"
          onClick={onBack}
          aria-label="Voltar"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <div className="header__agent-info">
          {avatarEl}
          <div className="header__agent-text">
            <Logo variant="text" size="sm" />
            <span className="header__agent-subtitle">{subtitle}</span>
          </div>
        </div>
      </header>
    );
  }

  if (variant === "agent-forward") {
    return (
      <header className={`header header--agent ${className ?? ""}`}>
        <button
          className="header__icon-btn"
          onClick={onForward}
          aria-label="Expandir"
        >
          <ChevronRight size={22} strokeWidth={2} />
        </button>
        <div className="header__agent-info">
          {avatarEl}
          <div className="header__agent-text">
            <Logo variant="text" size="sm" />
            <span className="header__agent-subtitle">{subtitle}</span>
          </div>
        </div>
      </header>
    );
  }

  // variant === "avatar-back" — compacto: só seta + avatar
  return (
    <header className={`header header--avatar-back ${className ?? ""}`}>
      <button
        className="header__icon-btn"
        onClick={onBack}
        aria-label="Voltar"
      >
        <ChevronLeft size={22} strokeWidth={2} />
      </button>
      {avatarEl}
    </header>
  );
}
