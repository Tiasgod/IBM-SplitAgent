import { useNavigate } from "react-router-dom";
import { Logo } from "../../components/brand";
import "./LandingPage.css";

/* ── Navbar ─────────────────────────────────────────────────── */
function LandingNav() {
  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav className="lp-nav">
      <div className="lp-nav__inner">
        <Logo variant="full" size="md" color="#ffffff" className="lp-nav__logo" />
        <ul className="lp-nav__links">
          <li><a href="#inicio" onClick={(e) => { e.preventDefault(); scrollTo("inicio"); }}>INÍCIO</a></li>
          <li><a href="#problema" onClick={(e) => { e.preventDefault(); scrollTo("problema"); }}>PROBLEMA</a></li>
          <li><a href="#solucao" onClick={(e) => { e.preventDefault(); scrollTo("solucao"); }}>SOLUÇÃO</a></li>
          <li><a href="#demonstracao" onClick={(e) => { e.preventDefault(); scrollTo("demonstracao"); }}>DEMONSTRAÇÃO</a></li>
          <li><a href="#agentes" onClick={(e) => { e.preventDefault(); scrollTo("agentes"); }}>AGENTES DE IA</a></li>
          <li>
            <a href="#instalar" onClick={(e) => { e.preventDefault(); scrollTo("instalar"); }} className="lp-nav__install-link">
              INSTALAR
            </a>
          </li>
        </ul>
        {/* Mobile hamburger placeholder */}
        <button className="lp-nav__hamburger" aria-label="Abrir menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

/* ── Footer ─────────────────────────────────────────────────── */
function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__inner">
        <div className="lp-footer__brand">
          <Logo variant="full" size="md" color="#ffffff" />
          <p className="lp-footer__tagline">Finanças prontas para o futuro.</p>
        </div>
        <div className="lp-footer__cols">
          <div className="lp-footer__col">
            <h4 className="lp-footer__col-title">LINKS ÚTEIS</h4>
            <ul>
              <li><a href="#inicio">INÍCIO</a></li>
              <li><a href="#problema">PROBLEMA</a></li>
              <li><a href="#solucao">SOLUÇÃO</a></li>
              <li><a href="#demonstracao">DEMONSTRAÇÃO</a></li>
              <li><a href="#agentes">AGENTES DE IA</a></li>
              <li><a href="#instalar">INSTALAR</a></li>
            </ul>
          </div>
          <div className="lp-footer__col">
            <h4 className="lp-footer__col-title">SUPORTE</h4>
            <ul>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contato">FALE CONOSCO</a></li>
              <li><a href="#termos">TERMOS DE USO</a></li>
              <li><a href="#privacidade">POLÍTICA DE PRIVACIDADE</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="lp-footer__bottom">
        © 2026 SplitAgent | Todos os direitos reservados.
      </div>
    </footer>
  );
}

/* ── SVG Icons ───────────────────────────────────────────────── */
function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v13M6 11l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#0DA0A0" strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="3" y1="6" x2="21" y2="6" stroke="#0DA0A0" strokeWidth="1.5"/>
      <path d="M16 10a4 4 0 01-8 0" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconSplit() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#0DA0A0" strokeWidth="1.5"/>
      <line x1="12" y1="7" x2="12" y2="17" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconAnalysis() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="10" y="7" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconScenario() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8h16M15 4l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 16H4M9 12l-5 4 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconRisk() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L2 20h20L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCashflow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

/* ── Agent icon helpers ── */
function AgentIcon({ color = "#0DA0A0" }: { color?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" strokeDasharray="4 2"/>
      <circle cx="16" cy="12" r="4" stroke={color} strokeWidth="1.5"/>
      <path d="M8 26c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function OrchestratorIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="23" stroke="#0DA0A0" strokeWidth="1.5"/>
      <circle cx="24" cy="24" r="8" stroke="#0DA0A0" strokeWidth="1.5"/>
      <circle cx="24" cy="24" r="3" fill="#0DA0A0"/>
      <line x1="24" y1="1" x2="24" y2="16" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="32" x2="24" y2="47" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="1" y1="24" x2="16" y2="24" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="24" x2="47" y2="24" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Data ─────────────────────────────────────────────────────── */
const agents = [
  {
    name: "Split Payment",
    desc: "Analisa os efeitos dos tributos sobre as vendas.",
    icon: <AgentIcon />,
  },
  {
    name: "Cash",
    desc: "Monitora entradas e saídas financeiras.",
    icon: <AgentIcon />,
  },
  {
    name: "Forecast",
    desc: "Projeta cenários e prevê dificuldades financeiras.",
    icon: <AgentIcon />,
  },
  {
    name: "Tax",
    desc: "Interpreta regras e obrigações tributárias.",
    icon: <AgentIcon color="#FFC801" />,
  },
  {
    name: "Guardian",
    desc: "Identifica riscos e protege as análises.",
    icon: <AgentIcon />,
  },
  {
    name: "Credit",
    desc: "Avalia a capacidade de crédito da empresa.",
    icon: <AgentIcon />,
  },
  {
    name: "Inclusion",
    desc: "Simplifica informações e orientações financeiras.",
    icon: <AgentIcon />,
  },
];

/* ── Main Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="lp">
      <LandingNav />

      <main>

        {/* ── HERO ── */}
        <section className="lp-hero" id="inicio">
          <div className="lp-hero__inner">
            <div className="lp-hero__text">
              <Logo variant="full" size="lg" color="#ffffff" className="lp-hero__logo" />
              <h1 className="lp-hero__headline">
                Sua gestão financeira preparada para<br />o Split Payment.
              </h1>
              <p className="lp-hero__subtitle">
                Entenda como as mudanças da Reforma Tributária podem impactar a caixa da sua empresa e prepare-se com o apoio da inteligência artificial.
              </p>
              <div className="lp-hero__actions">
                <button className="lp-btn-install" onClick={() => navigate("/")}>
                  <IconDownload /> Instalar
                </button>
                <button className="lp-btn-enter" onClick={() => navigate("/login")}>
                  Entrar
                </button>
              </div>
            </div>
            <div className="lp-hero__mascot" aria-hidden="true">
              {/* Mascot placeholder — will be replaced with actual image when available */}
              <div className="lp-hero__mascot-bg" />
            </div>
          </div>
        </section>

        {/* ── PROBLEMA ── */}
        <section className="lp-problem" id="problema">
          <div className="lp-problem__inner">
            <h2 className="lp-problem__title">A forma como sua empresa recebe pode mudar.</h2>
            <p className="lp-problem__subtitle">Você sabe quanto realmente estará disponível na sua caixa?</p>

            <div className="lp-problem__steps">
              <div className="lp-problem__step">
                <div className="lp-problem__step-icon">
                  <IconCart />
                </div>
                <div>
                  <span className="lp-problem__step-num">1. Seu cliente faz uma compra</span>
                  <p className="lp-problem__step-desc">A empresa realiza uma venda.</p>
                </div>
              </div>

              <div className="lp-problem__arrow" aria-hidden="true">
                <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                  <path d="M0 8h28M22 2l8 6-8 6" stroke="#0DA0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="lp-problem__step">
                <div className="lp-problem__step-icon">
                  <IconSplit />
                </div>
                <div>
                  <span className="lp-problem__step-num">2. O pagamento é dividido</span>
                  <p className="lp-problem__step-desc">Os tributos podem ser separados.</p>
                </div>
              </div>
            </div>

            <div className="lp-problem__result">
              <div className="lp-problem__result-card lp-problem__result-card--company">
                <div className="lp-problem__result-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <span className="lp-problem__result-label">Empresa</span>
                  <p className="lp-problem__result-value">Valor líquido</p>
                  <p className="lp-problem__result-desc">Valor que entra no caixa.</p>
                </div>
              </div>
              <div className="lp-problem__result-card lp-problem__result-card--tax">
                <div className="lp-problem__result-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 22V9l9-7 9 7v13H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <rect x="9" y="14" width="6" height="8" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <span className="lp-problem__result-label">Impostos</span>
                  <p className="lp-problem__result-value">Parte separada</p>
                  <p className="lp-problem__result-desc">Valor retido para tributos.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOLUÇÃO ── */}
        <section className="lp-solution" id="solucao">
          <div className="lp-solution__inner">
            <div className="lp-solution__text">
              <h2 className="lp-solution__title">Prepare-se para as mudanças. Tenha mais controle sobre suas finanças.</h2>
              <p className="lp-solution__desc">
                Com o SplitAgent, você analisa os impactos do Split Payment, acompanha seu fluxo de caixa e simula cenários financeiros com o apoio de agentes de inteligência artificial.
              </p>
              <div className="lp-solution__tags">
                <span className="lp-solution__tag"><IconAnalysis /> Análise Financeira</span>
                <span className="lp-solution__tag"><IconScenario /> Simulação de cenários</span>
                <span className="lp-solution__tag"><IconRisk /> Identificação de Riscos</span>
                <span className="lp-solution__tag"><IconChat /> Orientações com IA</span>
                <span className="lp-solution__tag"><IconCashflow /> Projeção do fluxo de caixa</span>
              </div>
            </div>
            <div className="lp-solution__visual">
              <img
                src="/dashboard-hero.png"
                alt="Dashboard SplitAgent mostrando resultados financeiros"
                className="lp-solution__img"
              />
            </div>
          </div>
        </section>

        {/* ── DEMONSTRAÇÃO — placeholder vazio ── */}
        <section className="lp-demo" id="demonstracao" aria-label="Demonstração">
          <div className="lp-demo__placeholder" />
        </section>

        {/* ── AGENTES ── */}
        <section className="lp-agents" id="agentes">
          <div className="lp-agents__inner">
            <h2 className="lp-agents__title">Inteligência que trabalha em conjunto.</h2>
            <p className="lp-agents__subtitle">
              Uma arquitetura de <strong>agentes especializados</strong> para transformar dados financeiros em orientações.
            </p>

            <div className="lp-agents__orchestrator">
              <OrchestratorIcon />
              <p className="lp-agents__orch-label">ORCHESTRATOR</p>
              <p className="lp-agents__orch-desc">Coordena os agentes e distribui as tarefas.</p>
            </div>

            <div className="lp-agents__grid">
              {agents.map((agent) => (
                <div key={agent.name} className="lp-agents__card">
                  <div className="lp-agents__card-icon">{agent.icon}</div>
                  <p className="lp-agents__card-name">{agent.name}</p>
                  <p className="lp-agents__card-desc">{agent.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INSTALAR ── */}
        <section className="lp-install" id="instalar">
          <div className="lp-install__inner">
            <h2 className="lp-install__title">Instale o SplitAgent no seu dispositivo</h2>
            <button className="lp-btn-install" onClick={() => navigate("/")}>
              <IconDownload /> Instalar
            </button>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
