import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import "./GoogleSignInButton.css";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }): void;
          renderButton(parent: HTMLElement, options: object): void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.2045c0-.638-.0573-1.252-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.3441 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71C3.7841 10.17 3.6818 9.5945 3.6818 9c0-.5945.1023-1.17.2822-1.71V4.9582H.9574C.3477 6.173 0 7.5482 0 9c0 1.4518.3477 2.827.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5813C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}

interface GoogleSignInButtonProps {
  onError?: (message: string) => void;
}

export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the callback in a ref so GSI always calls the latest version
  // regardless of when the script fires relative to renders.
  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      try {
        await authService.googleLogin({ credential: response.credential });
        navigate("/");
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "Erro ao entrar com Google.");
      }
    },
    [navigate, onError]
  );
  const handleCredentialRef = useRef(handleCredential);
  useEffect(() => { handleCredentialRef.current = handleCredential; }, [handleCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    function initGSI() {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID!,
        // Wrap in a stable arrow so the ref is always current when called.
        callback: (res) => handleCredentialRef.current(res),
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: containerRef.current.offsetWidth || 320,
        text: "signin_with",
        locale: "pt-BR",
      });
    }

    const scriptId = "gsi-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGSI;
      document.head.appendChild(script);
    } else {
      initGSI();
    }
  }, []); // run once — script is global, re-init not needed

  // No client ID configured — render a visible placeholder button.
  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        className="google-signin-btn"
        disabled
        title="Configure VITE_GOOGLE_CLIENT_ID no arquivo .env para ativar"
      >
        <GoogleLogo />
        Continuar com Google
      </button>
    );
  }

  // GSI renders its own button markup inside this div.
  return <div ref={containerRef} className="google-signin-btn--gsi" />;
}
