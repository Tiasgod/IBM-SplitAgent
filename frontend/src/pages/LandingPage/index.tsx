import { useNavigate } from "react-router-dom";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import {
  Download,
  BarChart2,
  Shuffle,
  AlertTriangle,
  MessageSquare,
  CalendarDays,
  Banknote,
  TrendingUp,
  Scale,
  ShieldCheck,
  CreditCard,
  Users,
  DivideSquare,
  Apple,
  Smartphone,
  Monitor,
  Laptop,
  Terminal,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { Logo } from "../../components/brand";
import splitoHome from "../../assets/splito-home.png";
import macbook from "../../assets/macbook.png";
import "./LandingPage.css";
import SplitPaymentChart from "./SplitPaymentChart";
import { useEffect, useRef, useState } from "react";

/* ── Navbar ─────────────────────────────────────────────────── */
function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <li><a href="#inicio" onClick={(e) => { e.preventDefault(); scrollTo("inicio"); }}>ENTRAR</a></li>
        </ul>
         <button
          className="lp-nav__hamburger"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="lp-mobile-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {menuOpen && (
          <ul className="lp-nav__mobile-menu" id="lp-mobile-menu">
            <li><a href="#inicio" onClick={(e) => { e.preventDefault(); scrollTo("inicio"); }}>INÍCIO</a></li>
            <li><a href="#problema" onClick={(e) => { e.preventDefault(); scrollTo("problema"); }}>PROBLEMA</a></li>
            <li><a href="#solucao" onClick={(e) => { e.preventDefault(); scrollTo("solucao"); }}>SOLUÇÃO</a></li>
            <li><a href="#demonstracao" onClick={(e) => { e.preventDefault(); scrollTo("demonstracao"); }}>DEMONSTRAÇÃO</a></li>
            <li><a href="#agentes" onClick={(e) => { e.preventDefault(); scrollTo("agentes"); }}>AGENTES DE IA</a></li>
            <li><a href="#instalar" onClick={(e) => { e.preventDefault(); scrollTo("instalar"); }} className="lp-nav__install-link">INSTALAR</a></li>
            <li><a href="#inicio" onClick={(e) => { e.preventDefault(); scrollTo("inicio"); }}>ENTRAR</a></li>
          </ul>
        )}
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
              <li><a href="#inicio">ENTRAR</a></li>
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

/* ── Orchestrator icon (personalizado) ── */
function OrchestratorIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="23" stroke="#0DA0A0" strokeWidth="1.5"/>
      <circle cx="24" cy="24" r="8" stroke="#0DA0A0" strokeWidth="1.5"/>
      <circle cx="24" cy="24" r="3" fill="#0DA0A0"/>
      <line x1="24" y1="1"  x2="24" y2="16" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="32" x2="24" y2="47" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="1"  y1="24" x2="16" y2="24" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="32" y1="24" x2="47" y2="24" stroke="#0DA0A0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Feature tags (seção Solução) ── */
const solutionTags = [
  { icon: <BarChart2 size={16} />, label: "Análise Financeira" },
  { icon: <Shuffle size={16} />,   label: "Simulação de cenários" },
  { icon: <AlertTriangle size={16} />, label: "Identificação de Riscos" },
  { icon: <MessageSquare size={16} />, label: "Orientações com IA" },
  { icon: <CalendarDays size={16} />,  label: "Projeção do fluxo de caixa" },
];

/* ── Agents data ── */
const agents = [
  {
    name: "Split Payment",
    desc: "Analisa os efeitos dos tributos sobre as vendas.",
    icon: <DivideSquare size={36} strokeWidth={1.5} />,
  },
  {
    name: "Cash",
    desc: "Monitora entradas e saídas financeiras.",
    icon: <Banknote size={36} strokeWidth={1.5} color="#FFC801"/>,
  },
  {
    name: "Forecast",
    desc: "Projeta cenários e prevê dificuldades financeiras.",
    icon: <TrendingUp size={36} strokeWidth={1.5} />,
  },
  {
    name: "Tax",
    desc: "Interpreta regras e obrigações tributárias.",
    icon: <Scale size={36} strokeWidth={1.5} color="#FFC801" />,
  },
  {
    name: "Guardian",
    desc: "Identifica riscos e protege as análises.",
    icon: <ShieldCheck size={36} strokeWidth={1.5} />,
  },
  {
    name: "Credit",
    desc: "Avalia a capacidade de crédito da empresa.",
    icon: <CreditCard size={36} strokeWidth={1.5} color="#FFC801" />,
  },
  {
    name: "Inclusion",
    desc: "Simplifica informações e orientações financeiras.",
    icon: <Users size={36} strokeWidth={1.5} />,
  },
];

/* ── Steps download data ── */
const installPlatforms = [
  {
    id: "ios",
    name: "iPhone / iPad",
    subtitle: "iOS e iPadOS",
    icon: Apple,
    browser: "Safari",
    steps: [
      "Abra o SplitAgent pelo Safari.",
      "Toque no botão Compartilhar, na barra inferior do navegador.",
      'Role as opções e selecione "Adicionar à Tela de Início".',
      "Confirme em Adicionar. O SplitAgent aparecerá na tela inicial.",
    ],
  },
  {
    id: "android",
    name: "Android",
    subtitle: "Celulares e tablets",
    icon: Smartphone,
    browser: "Google Chrome",
    steps: [
      "Abra o SplitAgent pelo Google Chrome.",
      "Toque no menu de três pontos no canto superior.",
      'Selecione "Instalar aplicativo" ou "Adicionar à tela inicial".',
      "Confirme a instalação. O ícone ficará disponível junto aos seus aplicativos.",
    ],
  },
  {
    id: "windows",
    name: "Windows",
    subtitle: "Windows 10 e 11",
    icon: Monitor,
    browser: "Microsoft Edge ou Google Chrome",
    steps: [
      "Abra o SplitAgent no Edge ou Chrome.",
      "No Edge, clique no ícone de instalação na barra de endereço ou acesse Menu → Aplicativos → Instalar este site como aplicativo.",
      "No Chrome, acesse o menu de três pontos → Transmitir, salvar e compartilhar → Instalar página como aplicativo.",
      "Confirme a instalação. O SplitAgent poderá ser aberto pelo menu Iniciar.",
    ],
  },
  {
    id: "macos",
    name: "macOS",
    subtitle: "MacBook e iMac",
    icon: Laptop,
    browser: "Safari, Chrome ou Edge",
    steps: [
      "Abra o SplitAgent no navegador.",
      "No Safari (macOS Sonoma ou posterior), acesse Arquivo → Adicionar ao Dock.",
      "No Chrome ou Edge, utilize o ícone de instalação na barra de endereço ou a opção de instalar no menu do navegador.",
      "Confirme. O SplitAgent ficará disponível no Dock e na pasta de aplicativos.",
    ],
  },
  {
    id: "linux",
    name: "Linux",
    subtitle: "Distribuições Linux",
    icon: Terminal,
    browser: "Google Chrome ou Microsoft Edge",
    steps: [
      "Abra o SplitAgent no Google Chrome ou Microsoft Edge.",
      "Clique no ícone de instalação na barra de endereço, se disponível.",
      'Se não aparecer, abra o menu do navegador e procure "Instalar página como aplicativo".',
      "Confirme a instalação. O SplitAgent poderá ser aberto como um aplicativo independente.",
    ],
  },
];

/* ── Main Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [installError, setInstallError] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showInstallToast() {
    setInstallError(true);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      setInstallError(false);
    }, 4000);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  async function handleInstall() {
  if (canInstall) {
    try {
      await install();
    } catch {
      showInstallToast();
    }
  } else if (!isInstalled) {
    showInstallToast();
  }
}

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
                Sua gestão financeira preparada para o Split Payment.
              </h1>
              <p className="lp-hero__subtitle">
                Entenda como as mudanças da Reforma Tributária podem impactar a caixa da sua empresa e prepare-se com o apoio da inteligência artificial.
              </p>
              <div className="lp-hero__actions">
                {!isInstalled && (
                  <a href="#instalar">
                  <button className="lp-btn-install" onClick={handleInstall}>
                    <Download size={15} strokeWidth={2} /> Instalar
                  </button>
                  </a>
                )}
                <button className="lp-btn-enter" onClick={() => navigate("/inicio")}>
                  Entrar
                </button>
              </div>
            </div>
            <div className="lp-hero__mascot">
              <img
                src={splitoHome}
                alt="SplitAgent mascote"
                className="lp-hero__mascot-img"
              />
            </div>
          </div>
        </section>

        {/* ── PROBLEMA ── */}
        <section className="lp-problem" id="problema">
          <div className="lp-problem__inner">
            <h2 className="lp-problem__title">A forma como sua empresa recebe pode mudar.</h2>
            <p className="lp-problem__subtitle">Você sabe quanto realmente estará disponível no seu caixa quando o Split Payment entrar em vigor?</p>

            <div className="lp-problem__layout">

              {/* ── Coluna esquerda: recortes de matéria ── */}
              <div className="lp-problem__news">

                <a
                  href="https://www.ey.com/pt_br/newsroom/2026/01/reforma-tributaria-split-payment-vai-alterar-gestao-caixa-empresas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-problem__news-card lp-problem__news-card--1"
                >
                  <span className="lp-problem__news-source lp-problem__news-source--ey">EY</span>
                  <p className="lp-problem__news-title">
                    Reforma tributária: Split payment vai alterar gestão de caixa das empresas
                  </p>
                  <span className="lp-problem__news-date">05 jan. 2026</span>
                </a>

                <a
                  href="https://economia.uol.com.br/noticias/redacao/2026/08/13/reforma-tributaria-split-payment-imposto.ghtm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-problem__news-card lp-problem__news-card--2"
                >
                  <span className="lp-problem__news-source lp-problem__news-source--uol">UOL Economia</span>
                  <p className="lp-problem__news-title">
                    Nova regra na cobrança de impostos: split payment ameaça asfixiar empresas
                  </p>
                  <span className="lp-problem__news-date">13 ago. 2026</span>
                </a>

                <a
                  href="https://exame.com/economia/split-payment-da-reforma-tributaria-forca-empresas-a-rever-caixa-e-contratos-desde-ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-problem__news-card lp-problem__news-card--3"
                >
                  <span className="lp-problem__news-source lp-problem__news-source--exame">exame.</span>
                  <p className="lp-problem__news-title">
                    Split payment força empresas a rever caixa e contratos desde já
                  </p>
                  <span className="lp-problem__news-date">03 nov. 2026</span>
                </a>

              </div>

              {/* ── Coluna direita: explicação ── */}
              <div className="lp-problem__explainer">
                <SplitPaymentChart />
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
                {solutionTags.map((t) => (
                  <span key={t.label} className="lp-solution__tag">
                    {t.icon} {t.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="lp-solution__visual">
              <img
                src={macbook}
                alt="Dashboard SplitAgent mostrando resultados financeiros"
                className="lp-solution__img"
              />
            </div>
          </div>
        </section>

        {/* ── DEMONSTRAÇÃO ── */}
        <section className="lp-demo" id="demonstracao" aria-label="Demonstração">
          <div className="lp-demo__placeholder" />
          <video src=""></video>
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
            <span className="lp-install__eyebrow">DISPONÍVEL EM TODAS AS PLATAFORMAS</span>
            <h2 className="lp-install__title">
              Leve o SplitAgent com você.
            </h2>
            <div className="lp-hero__actions">
                {!isInstalled && (
                  <a href="#instalar">
                  <button className="lp-btn-install" onClick={handleInstall}>
                    <Download size={15} strokeWidth={2} /> Instalar
                  </button>
                  </a>
                )}
                <button className="lp-btn-enter" onClick={() => navigate("/inicio")}>
                  Entrar
                </button>
              </div>
            {installError && (
              <div className="lp-install__toast" role="alert">
                <span className="lp-install__toast-icon">!</span>
                <p>
                  Não foi possível iniciar a instalação. Tente novamente ou
                  instale manualmente seguindo os tutoriais.
                </p>
                <button
                  onClick={() => setInstallError(false)}
                  aria-label="Fechar mensagem"
                >
                  ×
                </button>
              </div>
            )}
            <div className="lp-install__platforms">
              {installPlatforms.map((platform) => {
                const Icon = platform.icon;
                const isActive = selectedPlatform === platform.id;
                return (
                  <button
                    key={platform.id}
                    className={`lp-install__platform ${isActive ? "is-active" : ""}`}
                    onClick={() =>
                      setSelectedPlatform(isActive ? null : platform.id)
                    }
                    aria-expanded={isActive}
                    aria-controls={`install-guide-${platform.id}`}
                  >
                    <Icon size={27} strokeWidth={1.7} />
                    <span className="lp-install__platform-name">{platform.name}</span>
                    <span className="lp-install__platform-subtitle">
                      {platform.subtitle}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`lp-install__chevron ${isActive ? "is-open" : ""}`}
                    />
                  </button>
                );
              })}
            </div>
            {installPlatforms.map((platform) =>
              selectedPlatform === platform.id ? (
                <div
                  key={platform.id}
                  id={`install-guide-${platform.id}`}
                  className="lp-install__guide"
                >
                  <div className="lp-install__guide-header">
                    <div>
                      <h3>Instalando no {platform.name}</h3>
                      <p>Navegador recomendado: {platform.browser}</p>
                    </div>
                    <button
                      className="lp-install__guide-close"
                      onClick={() => setSelectedPlatform(null)}
                      aria-label="Fechar instruções"
                    >
                      ×
                    </button>
                  </div>
                  <ol className="lp-install__steps">
                    {platform.steps.map((step, index) => (
                      <li key={index}>
                        <span className="lp-install__step-number">
                          {index + 1}
                        </span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null
            )}
            {isInstalled && (
              <p className="lp-install__installed-msg">
                ✓ SplitAgent já está instalado no seu dispositivo.
              </p>
            )}
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
