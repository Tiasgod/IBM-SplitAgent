import "./ChatBubble.css";

export type ChatBubbleVariant = "user" | "agent" | "loading";

interface ChatBubbleProps {
  variant: ChatBubbleVariant;
  children?: React.ReactNode;
  className?: string;
}

export function ChatBubble({ variant, children, className }: ChatBubbleProps) {
  return (
    <div
      className={`chat-bubble chat-bubble--${variant} ${className ?? ""}`}
      aria-live={variant === "loading" ? "polite" : undefined}
    >
      {variant === "loading" ? (
        <>
          <span className="chat-bubble__dots" aria-hidden="true">
            <span /><span /><span />
          </span>
          {children && (
            <span className="chat-bubble__loading-text">{children}</span>
          )}
        </>
      ) : (
        children
      )}
    </div>
  );
}
