import { type ReactNode } from "react";
import { Header, type HeaderVariant } from "../layout/Header";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./PageLayout.css";

interface PageLayoutProps {
  children: ReactNode;
  /**
   * Variante do Header mobile a exibir.
   * Omitir oculta o header (ex: tela de login).
   */
  headerVariant?: HeaderVariant;
  /** Callbacks repassados ao Header quando necessário */
  onMenuClick?: () => void;
  onBack?: () => void;
  /** Remove o padding padrão (ex: páginas de chat full-bleed) */
  noPadding?: boolean;
  className?: string;
}

export function PageLayout({
  children,
  headerVariant,
  onMenuClick,
  onBack,
  noPadding = false,
  className,
}: PageLayoutProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className={`page-layout ${className ?? ""}`}>
      {/* Header aparece apenas no mobile e quando a variante for fornecida */}
      {!isDesktop && headerVariant && (
        <Header
          variant={headerVariant}
          onMenuClick={onMenuClick}
          onBack={onBack}
        />
      )}
      <div className={`page-layout__content${noPadding ? " page-layout__content--no-padding" : ""}`}>
        {children}
      </div>
    </div>
  );
}
