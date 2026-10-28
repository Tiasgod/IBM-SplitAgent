import { ChatPanel } from "../../components/chat/ChatPanel";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./Assistente.css";

export default function Assistente() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="assistente">
      <ChatPanel
        onClose={isDesktop ? () => window.history.back() : undefined}
        onBack={!isDesktop ? () => window.history.back() : undefined}
      />
    </div>
  );
}
