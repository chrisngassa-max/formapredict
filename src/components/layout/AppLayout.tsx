import { BarChart3, BookOpen, FileText, Plus, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Simulateur interne</p>
          <h1>FormaPredict</h1>
        </div>
        <nav>
          <NavLink to="/" end>
            <BarChart3 size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/candidats/nouveau">
            <Plus size={18} />
            Nouveau candidat
          </NavLink>
          <NavLink to="/formations">
            <BookOpen size={18} />
            Formations
          </NavLink>
          <NavLink to="/documents">
            <FileText size={18} />
            Documents
          </NavLink>
          <NavLink to="/parametres">
            <Settings size={18} />
            Paramètres
          </NavLink>
        </nav>
        <p className="legal-small">
          Projection indicative. Les aides doivent être vérifiées auprès des organismes concernés.
        </p>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
