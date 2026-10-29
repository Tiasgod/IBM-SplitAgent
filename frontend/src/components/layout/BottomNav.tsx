import { NavLink } from "react-router-dom";
import { House, Wand2, Landmark, Bot } from "lucide-react";
import "./BottomNav.css";

// Mobile bottom nav shows the 4 primary destinations (no Histórico / Configurações)
const navItems = [
  { to: "/visao-geral", icon: House,    label: "Início" },
  { to: "/simulador",  icon: Wand2,    label: "Simulador" },
  { to: "/fluxo",      icon: Landmark, label: "Fluxo de caixa" },
  { to: "/assistente", icon: Bot,      label: "Assistente" },
] as const;

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}`
          }
        >
          <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
