import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { Paperclip, Send, X, ChevronUp } from "lucide-react";
import { ChatBubble } from "../ui/ChatBubble";
import { Button } from "../ui/Button";
import { Header } from "../layout/Header";
import "./ChatPanel.css";

type Role = "user" | "agent";

interface Message {
  id: number;
  role: Role;
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, role: "user",  text: "Por que meu caixa vai ficar negativo depois dessa compra?" },
  { id: 2, role: "agent", text: "O principal motivo parece ser a concentração de pagamentos nesta semana. Encontrei 3 contas previstas antes da entrada dos seus recebíveis." },
];

const SUGGESTIONS = [
  "Como posso evitar ficar sem caixa?",
  "E se eu mudar a data da compra?",
  "Quais são essas contas?",
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface ChatPanelProps {
  /** Modo painel: exibe header agent-forward com seta para fechar */
  onClose?: () => void;
  /** Modo tela cheia mobile: exibe header agent-back */
  onBack?: () => void;
  /** Oculta o header (ex: quando usado dentro de tela cheia que já tem header) */
  hideHeader?: boolean;
  /** Oculta a seta de avançar no header agent-forward (ex: página Assistente) */
  hideForwardArrow?: boolean;
  className?: string;
}

export function ChatPanel({ onClose, onBack, hideHeader = false, hideForwardArrow = false, className }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: "agent", text: "Estou analisando sua solicitação. Em breve trarei mais detalhes sobre esse cenário." },
      ]);
    }, 1500);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const chatDate = new Date(2026, 9, 21);

  return (
    <div className={`chat-panel ${className ?? ""}`}>
      {!hideHeader && (
        <Header
          variant={onClose ? "agent-forward" : "agent-back"}
          onForward={onClose}
          onBack={onBack}
          hideForwardArrow={hideForwardArrow}
          className="chat-panel__header"
        />
      )}

      <div
        className="chat-panel__messages"
        role="log"
        aria-live="polite"
        aria-label="Conversa com o assistente"
      >
        <div className="chat-panel__date-separator">
          <span>{formatDate(chatDate)}</span>
        </div>

        {messages.map(msg => (
          <div key={msg.id} className={`chat-panel__bubble-row chat-panel__bubble-row--${msg.role}`}>
            <ChatBubble variant={msg.role}>{msg.text}</ChatBubble>
          </div>
        ))}

        {loading && (
          <div className="chat-panel__bubble-row chat-panel__bubble-row--agent">
            <ChatBubble variant="loading">Analisando sua solicitação...</ChatBubble>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      <div className="chat-panel__bottom">
        <div className="chat-panel__suggestions-wrapper">
          <div className="chat-panel__suggestions-header">
            <button
              className="chat-panel__suggestions-toggle"
              onClick={() => setShowSuggestions(v => !v)}
              aria-label={showSuggestions ? "Ocultar sugestões" : "Mostrar sugestões"}
            >
              {showSuggestions
                ? <><X size={14} strokeWidth={2} /> Ocultar</>
                : <><ChevronUp size={14} strokeWidth={2} /> Sugestões</>
              }
            </button>
          </div>
          {showSuggestions && (
            <div className="chat-panel__suggestions" aria-label="Sugestões de perguntas">
              {SUGGESTIONS.map(s => (
                <Button
                  key={s}
                  variant="subtle"
                  size="sm"
                  className="chat-panel__suggestion-btn"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          )}
        </div>

        <form className="chat-panel__input-row" onSubmit={handleSubmit} aria-label="Enviar mensagem">
          <button type="button" className="chat-panel__icon-btn" aria-label="Anexar arquivo">
            <Paperclip size={20} strokeWidth={1.75} />
          </button>

          <input
            type="text"
            className="chat-panel__input"
            placeholder="Digite sua mensagem"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Mensagem"
            autoComplete="off"
          />

          <button
            type="submit"
            className={`chat-panel__send-btn${input.trim() ? " chat-panel__send-btn--active" : ""}`}
            aria-label="Enviar"
            disabled={!input.trim() || loading}
          >
            <Send size={20} strokeWidth={1.75} />
          </button>
        </form>

        <p className="chat-panel__disclaimer">
          Suas informações são usadas apenas para melhorar o SplitAgent.{" "}
          <a href="/privacidade" className="chat-panel__disclaimer-link">
            Como meus dados são tratados?
          </a>
        </p>
      </div>
    </div>
  );
}
