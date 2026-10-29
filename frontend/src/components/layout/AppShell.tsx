import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { AppShellContext } from "./AppShellContext";
import "./AppShell.css";

export default function AppShell() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AppShellContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
      <div className="app-shell">
        {/* Desktop sidebar */}
        {isDesktop && (
          <Sidebar
            variant={collapsed ? "collapsed" : "expanded"}
            onCollapse={() => setCollapsed(c => !c)}
          />
        )}

        <main className="main-content">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        {!isDesktop && <BottomNav />}

        {/* Mobile drawer overlay */}
        {!isDesktop && drawerOpen && (
          <>
            <div
              className="app-shell__drawer-backdrop"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="app-shell__drawer" role="dialog" aria-modal="true" aria-label="Menu">
              <Sidebar variant="mobile" onDrawerClose={() => setDrawerOpen(false)} />
            </div>
          </>
        )}
      </div>
    </AppShellContext.Provider>
  );
}
