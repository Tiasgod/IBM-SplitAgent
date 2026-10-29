import { useNavigate } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/Button";
import "./LandingPage.css";

/* ── Inline SVG icons for the feature cards ── */
function IconBarChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="12" width="4" height="9" rx="1" stroke="#0E7573" strokeWidth="1.5"/>
      <rect x="10" y="7" width="4" height="14" rx="1" stroke="#0E7573" strokeWidth="1.5"/>
      <rect x="17" y="3" width="4" height="18" rx="1" stroke="#0E7573" strokeWidth="1.5"/>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="#0E7573" strokeWidth="1.5"/>
      <line x1="3" y1="9" x2="21" y2="9" stroke="#0E7573" strokeWidth="1.5"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="#0E7573" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="#0E7573" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#0E7573" strokeWidth="1.5"/>
      <line x1="12" y1="8" x2="12" y2="13" stroke="#0E7573" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1" fill="#0E7573"/>
    </svg>
  );
}

function IconArrows() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8h16M15 4l5 4-5 4" stroke="#0E7573" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 16H4M9 12l-5 4 5 4" stroke="#0E7573" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#0E7573" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Dashboard hero image ── */
function DashboardIllustration() {
  return (
    <div className="landing-hero__illustration">
      <img
        src="/dashboard-hero.png"
        alt="Dashboard financeiro com laptop e celular mostrando receitas, tributos e saldo"
        className="landing-hero__illustration-img"
      />
    </div>
  );
}

const features = [
  { icon: <IconBarChart />, label: "Análise\nfinanceira" },
  { icon: <IconCalendar />, label: "Projeção do\nfluxo de caixa" },
  { icon: <IconAlert />, label: "Identificação\nde riscos" },
  { icon: <IconArrows />, label: "Simulação de\ncenários" },
  { icon: <IconChat />, label: "Recomendações\npersonalizadas" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  function goToInicio() {
    navigate("/");
  }

  return (
    <div className="landing-page">
      {/* Header — left-aligned logo on mobile, centered on desktop */}
      <Header variant="logo-left" className="landing-page__header" />

      <main className="landing-page__main">

        {/* ── Hero section ── */}
        <section className="landing-hero">
          <div className="landing-hero__text">
            <h1 className="landing-hero__title">Split Payment</h1>
            <p className="landing-hero__subtitle">
              O SplitAgent utiliza inteligência artificial agêntica para analisar suas operações
              financeiras, antecipar riscos e recomendar ações personalizadas para o seu negócio.
            </p>
            <p className="landing-hero__tagline">
              Comece a tomar decisões com mais clareza e segurança!
            </p>
            <Button
              variant="primary"
              size="lg"
              className="landing-hero__cta"
              onClick={goToInicio}
            >
              Acesse já o Split Payment!
            </Button>
          </div>
          <DashboardIllustration />
        </section>

        {/* ── Info blocks ── */}
        <section className="landing-info">

          <div className="landing-info__block">
            <div className="landing-info__icon-wrap landing-info__icon-wrap--alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="#D8672B" opacity="0.15"/>
                <line x1="12" y1="7" x2="12" y2="13" stroke="#D8672B" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16.5" r="1.2" fill="#D8672B"/>
              </svg>
            </div>
            <div>
              <h2 className="landing-info__heading">Mais clareza sobre seu dinheiro</h2>
              <p className="landing-info__body">
                A complexidade tributária e a fragmentação dos dados entre bancos, maquininhas
                e contabilidade dificultam a compreensão do dinheiro realmente disponível para o
                negócio. Planilhas, extratos e controles manuais ajudam a registrar movimentações,
                mas nem sempre permitem prever o impacto do Split Payment no fluxo de caixa.
                Sem uma visão integrada, antecipar possíveis dificuldades financeiras e planejar
                compromissos pode se tornar um desafio.
              </p>
            </div>
          </div>

          <div className="landing-info__block">
            <div className="landing-info__icon-wrap landing-info__icon-wrap--teal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="#0E7573" opacity="0.15"/>
                <circle cx="12" cy="12" r="3" stroke="#0E7573" strokeWidth="1.5"/>
                <line x1="12" y1="2" x2="12" y2="5" stroke="#0E7573" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="12" y2="22" stroke="#0E7573" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="2" y1="12" x2="5" y2="12" stroke="#0E7573" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="19" y1="12" x2="22" y2="12" stroke="#0E7573" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="landing-info__heading">Da complexidade à decisão</h2>
              <p className="landing-info__body">
                O SplitAgent conecta informações de pagamentos, tributação e fluxo de caixa para
                transformar dados financeiros em análises, previsões e recomendações personalizadas.
                Com IA agêntica, a solução coordena agentes especializados que analisam operações,
                identificam riscos futuros e simulam alternativas financeiras, ajudando o
                empreendedor a avaliar suas opções antes de decidir.
              </p>
            </div>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section className="landing-features">
          <h2 className="landing-features__title">Aqui você encontra:</h2>
          <div className="landing-features__grid">
            {features.map((f, i) => (
              <div key={i} className="landing-features__card">
                <div className="landing-features__card-icon">{f.icon}</div>
                <span className="landing-features__card-label">{f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner card ── */}
        <section className="landing-cta-card">
          <div className="landing-cta-card__icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#E3F9F8"/>
              <path d="M24 14c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z" stroke="#0E7573" strokeWidth="1.8"/>
              <path d="M20 24l3 3 6-6" stroke="#0E7573" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M34 14l2-2M14 34l-2 2" stroke="#FFC801" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="landing-cta-card__text">
            Com o SplitAgent, você ganha mais clareza sobre seu fluxo de caixa, pode se preparar
            para possíveis dificuldades e avalia alternativas com mais informações. Comece a contar
            com análises e previsões para apoiar seu planejamento financeiro!
          </p>
        </section>

        {/* ── Finanças IA banner image ── */}
        <div className="landing-ia-banner">
          <img
            src="/financas-ia.png"
            alt="Entenda os impactos nas suas finanças e descubra como a inteligência artificial pode ajudar você a tomar decisões mais seguras"
            className="landing-ia-banner__img"
          />
        </div>

      </main>

      {/* ── Footer CTA bar ── */}
      <footer className="landing-footer">
        <p className="landing-footer__text">Prepare seu negócio para o Split Payment!</p>
        <Button
          variant="ghost"
          size="md"
          className="landing-footer__btn"
          onClick={goToInicio}
        >
          Comece agora
        </Button>
      </footer>
    </div>
  );
}
