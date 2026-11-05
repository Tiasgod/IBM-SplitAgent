import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Logo } from "../../components/brand";
import splitoHome from "../../assets/splito-home.png";
import macbook from "../../assets/macbook.png";
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
    icon: <DivideSquare size={28} strokeWidth={1.5} />,
  },
  {
    name: "Cash",
    desc: "Monitora entradas e saídas financeiras.",
    icon: <Banknote size={28} strokeWidth={1.5} color="#FFC801"/>,
  },
  {
    name: "Forecast",
    desc: "Projeta cenários e prevê dificuldades financeiras.",
    icon: <TrendingUp size={28} strokeWidth={1.5} />,
  },
  {
    name: "Tax",
    desc: "Interpreta regras e obrigações tributárias.",
    icon: <Scale size={28} strokeWidth={1.5} color="#FFC801" />,
  },
  {
    name: "Guardian",
    desc: "Identifica riscos e protege as análises.",
    icon: <ShieldCheck size={28} strokeWidth={1.5} />,
  },
  {
    name: "Credit",
    desc: "Avalia a capacidade de crédito da empresa.",
    icon: <CreditCard size={28} strokeWidth={1.5} color="#FFC801" />,
  },
  {
    name: "Inclusion",
    desc: "Simplifica informações e orientações financeiras.",
    icon: <Users size={28} strokeWidth={1.5} />,
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
                Sua gestão financeira preparada para o Split Payment.
              </h1>
              <p className="lp-hero__subtitle">
                Entenda como as mudanças da Reforma Tributária podem impactar a caixa da sua empresa e prepare-se com o apoio da inteligência artificial.
              </p>
              <div className="lp-hero__actions">
                <button className="lp-btn-install" onClick={() => navigate("/")}>
                  <Download size={15} strokeWidth={2} /> Instalar
                </button>
                <button className="lp-btn-enter" onClick={() => navigate("/login")}>
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
            <p className="lp-problem__subtitle">Você sabe quanto realmente estará disponível na sua caixa?</p>

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
                </a>

              </div>

              {/* ── Coluna direita: explicação ── */}
              <div className="lp-problem__explainer">
                <h3 className="lp-problem__explainer-title">O que muda com o Split Payment?</h3>
                <div className="lp-problem__explainer-body">
                  <p>
                    O Split Payment vai mudar a forma como as empresas lidam com seus impostos. Com a Reforma Tributária, o valor do IBS e da CBS será descontado <strong>automaticamente no momento do pagamento</strong> — antes de o dinheiro chegar ao caixa.
                  </p>
                  <p>
                    Isso pode reduzir o capital disponível para o giro do negócio e exigir uma reorganização financeira. O impacto dependerá do porte e da realidade financeira de cada empresa.
                  </p>
                  <p>
                    Por outro lado, a mudança promete mais transparência e segurança na arrecadação dos tributos.
                  </p>
                </div>
                <p className="lp-problem__explainer-cta">
                  Entender esse impacto no seu negócio, antes que ele aconteça, é exatamente o que o <strong>SplitAgent</strong> faz.
                </p>
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
              <Download size={15} strokeWidth={2} /> Instalar
            </button>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
