import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/admin", label: "Questionnaires", icon: "Q" },
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">Q</div>
        <div className="sidebar-brand-text">
          Questionnaire Studio
          <span>Project Questionnaires</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={onNavigate}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
