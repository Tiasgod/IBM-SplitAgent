import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export default function AppShell() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="app-shell">
      {isDesktop ? <Sidebar variant="expanded" /> : null}
      <main className="main-content">
        <Outlet />
      </main>
      {!isDesktop ? <BottomNav /> : null}
    </div>
  );
}
