import { useTheme } from "../context/ThemeContext";

export default function Navbar({ title, subtitle, onMenuClick, children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="flex gap-8" style={{ alignItems: "center" }}>
        <button className="btn btn-ghost btn-icon menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
          ☰
        </button>
        <div>
          <h2 className="topbar-title">{title}</h2>
          {subtitle && <span className="text-muted" style={{ fontSize: 12.5 }}>{subtitle}</span>}
        </div>
      </div>
      <div className="topbar-actions">
        {children}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          style={{ fontSize: 16 }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
