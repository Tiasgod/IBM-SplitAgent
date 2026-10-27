import { NavLink, useNavigate } from "react-router-dom";
import {
  House,
  Wand2,
  Landmark,
  Bot,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "../brand";
import "./Sidebar.css";

export type SidebarVariant = "mobile" | "collapsed" | "expanded";

interface SidebarProps {
  variant?: SidebarVariant;
}

const navItems = [
  { to: "/",              icon: House,    label: "Início" },
  { to: "/simulador",     icon: Wand2,    label: "Simulador" },
  { to: "/fluxo",         icon: Landmark, label: "Fluxo de caixa" },
  { to: "/assistente",    icon: Bot,      label: "Assistente" },
  { to: "/historico",     icon: History,  label: "Histórico" },
  { to: "/configuracoes", icon: Settings, label: "Configurações" },
] as const;

export default function Sidebar({ variant = "expanded" }: SidebarProps) {
  const navigate = useNavigate();
  const showLabels = variant !== "collapsed";
  const logoVariant = variant === "collapsed" ? "icon" : "full";

  return (
    <aside className={`sidebar sidebar--${variant}`} aria-label="Menu lateral">
      <div className="sidebar__logo">
        <Logo variant={logoVariant} size="sm" />
      </div>

      <nav className="sidebar__nav" aria-label="Navegação principal">
        <ul className="sidebar__list">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                title={!showLabels ? label : undefined}
                className={({ isActive }) =>
                  `sidebar__item${isActive ? " sidebar__item--active" : ""}`
                }
              >
                <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                {showLabels && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button
          className="sidebar__item sidebar__item--logout"
          title={!showLabels ? "Sair" : undefined}
          onClick={() => navigate("/logout")}
        >
          <LogOut size={22} strokeWidth={1.75} aria-hidden="true" />
          {showLabels && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
