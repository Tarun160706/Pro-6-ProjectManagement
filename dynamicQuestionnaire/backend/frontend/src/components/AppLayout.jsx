import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * Shared dashboard chrome (sidebar + topbar) used by every
 * authenticated page. Keeps the responsive mobile-menu state
 * in one place instead of repeating it per page.
 */
export default function AppLayout({ title, subtitle, navActions, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="app-body">
        <Navbar title={title} subtitle={subtitle} onMenuClick={() => setMenuOpen((v) => !v)}>
          {navActions}
        </Navbar>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
