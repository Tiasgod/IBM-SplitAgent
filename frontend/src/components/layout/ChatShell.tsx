import { useState, type ReactNode } from "react";
import { type HeaderVariant } from "./Header";
import { PageLayout } from "./PageLayout";
import { ChatPanel } from "../chat/ChatPanel";
import "./ChatShell.css";

interface ChatShellProps {
  children: ReactNode;
  headerVariant?: HeaderVariant;
  onBack?: () => void;
}

/**
 * ChatShell — layout wrapper compartilhado entre todas as páginas que
 * suportam o painel lateral do assistente no desktop.
 *
 * Mobile: o chat fica oculto (acesse via /assistente).
 * Desktop: exibe um botão flutuante que abre/fecha o painel lateral.
 */
export function ChatShell({ children, headerVariant, onBack }: ChatShellProps) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className={`chat-shell${chatOpen ? " chat-shell--open" : ""}`}>
      {/* Área de conteúdo principal */}
      <PageLayout
        headerVariant={headerVariant}
        onBack={onBack}
      >
        {children}
      </PageLayout>

      {/* Painel lateral do assistente — desktop only */}
      {chatOpen && (
        <div className="chat-shell__panel">
          <ChatPanel onClose={() => setChatOpen(false)} />
        </div>
      )}

      {/* Botão flutuante para abrir o chat — desktop, quando fechado */}
      {!chatOpen && (
        <button
          className="chat-shell__trigger"
          onClick={() => setChatOpen(true)}
          aria-label="Abrir assistente"
        >
          <span className="chat-shell__trigger-avatar" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
