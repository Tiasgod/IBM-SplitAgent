import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/Button";
import "./Inicio.css";

/* ── Slide 1 — Dashboard overview ── */
function SlideOne() {
  return (
    <div className="inicio-carousel__slide" aria-label="Visão geral financeira">
      {/* background circle */}
      <div className="inicio-slide__bg-circle" />

      {/* dashed orbit */}
      <div className="inicio-slide__orbit" />

      {/* Receitas card */}
      <div className="inicio-slide__card inicio-slide__card--receitas">
        <div className="inicio-slide__card-icon inicio-slide__card-icon--yellow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#FFC801" />
            <path d="M8 14c0 1.1.9 2 2 2h4a2 2 0 0 0 0-4h-4a2 2 0 0 1 0-4h4a2 2 0 0 1 2 2" stroke="#1D2227" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12" y1="6" x2="12" y2="8" stroke="#1D2227" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="12" y2="18" stroke="#1D2227" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="inicio-slide__card-label">Receitas</p>
          <p className="inicio-slide__card-value">R$ 84.200</p>
        </div>
      </div>

      {/* Tributos card */}
      <div className="inicio-slide__card inicio-slide__card--tributos">
        <div className="inicio-slide__card-icon inicio-slide__card-icon--gray">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="3" width="12" height="16" rx="2" stroke="#5B6B7C" strokeWidth="1.5"/>
            <line x1="8" y1="8" x2="14" y2="8" stroke="#5B6B7C" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="11" x2="14" y2="11" stroke="#5B6B7C" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="14" x2="11" y2="14" stroke="#5B6B7C" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="18" cy="17" r="4" fill="#E3F9F8" stroke="#5B6B7C" strokeWidth="1.5"/>
            <line x1="18" y1="15" x2="18" y2="19" stroke="#5B6B7C" strokeWidth="1" strokeLinecap="round"/>
            <line x1="16" y1="17" x2="20" y2="17" stroke="#5B6B7C" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="inicio-slide__card-label">Tributos</p>
          <p className="inicio-slide__card-value">R$ 12.630</p>
        </div>
      </div>

      {/* Cash flow mini-chart card */}
      <div className="inicio-slide__chart-card">
        <p className="inicio-slide__chart-title">Previsão de caixa</p>
        <p className="inicio-slide__chart-subtitle">Próximos 30 dias</p>
        <svg className="inicio-slide__chart-svg" viewBox="0 0 200 80" fill="none" aria-hidden="true">
          {/* area fill */}
          <rect x="70" y="20" width="60" height="40" fill="#FAEEE7" opacity="0.6" rx="2"/>
          {/* red baseline */}
          <line x1="10" y1="60" x2="190" y2="52" stroke="#D8672B" strokeWidth="1.2" strokeDasharray="4 3" strokeLinecap="round"/>
          {/* main line */}
          <polyline points="10,40 40,36 70,44 100,60 130,32 160,28 190,22"
            stroke="#0E7573" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* dots */}
          {[
            [10,40],[40,36],[70,44],[100,60],[130,32],[160,28],[190,22]
          ].map(([x,y], i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill="#0E7573" stroke="#fff" strokeWidth="1.5"/>
          ))}
        </svg>
      </div>

      {/* Saldo card */}
      <div className="inicio-slide__card inicio-slide__card--saldo">
        <div className="inicio-slide__card-icon inicio-slide__card-icon--teal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="1.5"/>
            <path d="M16 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" fill="white"/>
            <line x1="2" y1="9" x2="22" y2="9" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>
        <div>
          <p className="inicio-slide__card-label">Saldo atual</p>
          <p className="inicio-slide__card-value">R$ 38.400</p>
        </div>
      </div>

      {/* sparkle accent */}
      <div className="inicio-slide__sparkle" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <line x1="16" y1="2" x2="16" y2="10" stroke="#FFC801" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="16" y1="22" x2="16" y2="30" stroke="#FFC801" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="2" y1="16" x2="10" y2="16" stroke="#FFC801" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="22" y1="16" x2="30" y2="16" stroke="#FFC801" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

/* ── Slide 2 — AI assistant preview ── */
function SlideTwo() {
  return (
    <div className="inicio-carousel__slide" aria-label="Assistente inteligente">
      <div className="inicio-slide__bg-circle inicio-slide__bg-circle--alt" />
      <div className="inicio-slide__orbit" />

      <div className="inicio-slide2__content">
        <div className="inicio-slide2__bubble inicio-slide2__bubble--agent">
          <div className="inicio-slide2__avatar" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#0E7573"/>
              <path d="M8 13s1 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="10" r="1" fill="white"/>
              <circle cx="15" cy="10" r="1" fill="white"/>
            </svg>
          </div>
          <p className="inicio-slide2__bubble-text">
            Seu faturamento cresceu <strong>18%</strong> este mês. Quer ver os detalhes?
          </p>
        </div>

        <div className="inicio-slide2__bubble inicio-slide2__bubble--user">
          <p className="inicio-slide2__bubble-text">
            Sim! E quais impostos vencem essa semana?
          </p>
        </div>

        <div className="inicio-slide2__bubble inicio-slide2__bubble--agent">
          <div className="inicio-slide2__avatar" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#0E7573"/>
              <path d="M8 13s1 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="10" r="1" fill="white"/>
              <circle cx="15" cy="10" r="1" fill="white"/>
            </svg>
          </div>
          <p className="inicio-slide2__bubble-text">
            DAS vence <strong>dia 20</strong> — R$ 3.200. Já separei o valor no fluxo de caixa.
          </p>
        </div>
      </div>

      <div className="inicio-slide__sparkle inicio-slide__sparkle--alt" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <line x1="16" y1="2" x2="16" y2="10" stroke="#FFC801" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="16" y1="22" x2="16" y2="30" stroke="#FFC801" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="2" y1="16" x2="10" y2="16" stroke="#FFC801" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="22" y1="16" x2="30" y2="16" stroke="#FFC801" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

const SLIDES = [<SlideOne key={0} />, <SlideTwo key={1} />];
const AUTO_INTERVAL = 4000;

export default function Inicio() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % SLIDES.length);
    }, AUTO_INTERVAL);
  }

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function goTo(index: number) {
    setActive(index);
    resetTimer();
  }

  return (
    <div className="inicio-page">
      <Header variant="logo-centered" />

      <main className="inicio-page__main">
        {/* Carousel */}
        <section className="inicio-carousel" aria-label="Apresentação do SplitAgent" aria-roledescription="carrossel">
          <div
            className="inicio-carousel__track"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {SLIDES.map((slide, i) => (
              <div
                key={i}
                className="inicio-carousel__item"
                aria-hidden={i !== active}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${i + 1} de ${SLIDES.length}`}
              >
                {slide}
              </div>
            ))}
          </div>
        </section>

        {/* Dots */}
        <div className="inicio-carousel__dots" role="tablist" aria-label="Navegação do carrossel">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Ir para slide ${i + 1}`}
              className={`inicio-carousel__dot${i === active ? " inicio-carousel__dot--active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="inicio-page__actions">
          <Button
            variant="primary"
            size="lg"
            className="inicio-page__btn"
            onClick={() => navigate("/login")}
          >
            Entrar
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="inicio-page__btn"
            onClick={() => navigate("/cadastro")}
          >
            Criar conta
          </Button>
        </div>
      </main>
    </div>
  );
}
