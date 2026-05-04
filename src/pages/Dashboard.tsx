import { Link } from "react-router-dom";
import { CandidateTable } from "../components/dashboard/CandidateTable";
import { formatCurrency } from "../lib/format";
import { projectCandidate } from "../lib/projectionEngine";
import { resetCandidates } from "../lib/storage";
import { useCandidates } from "./useCandidates";

export function Dashboard() {
  const { candidates, refresh } = useCandidates();
  const projections = candidates.map(projectCandidate);
  const priorityCount = projections.filter((projection) => projection.priority === "prioritaire").length;
  const incompleteCount = projections.filter((projection) => projection.priority === "a_completer").length;
  const averageRemaining =
    projections.reduce((total, projection) => total + projection.estimatedRemainingCost, 0) /
    Math.max(1, projections.length);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Préqualification financement</p>
          <h2>Dashboard conseiller</h2>
          <p>Classement des candidats par potentiel de financement et complétude du dossier.</p>
        </div>
        <div className="header-actions">
          <button
            className="secondary"
            onClick={() => {
              resetCandidates();
              refresh();
            }}
          >
            Réinitialiser exemples
          </button>
          <Link className="button" to="/candidats/nouveau">
            Nouveau candidat
          </Link>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Candidats</span>
          <strong>{candidates.length}</strong>
        </div>
        <div className="stat-card">
          <span>Dossiers prioritaires</span>
          <strong>{priorityCount}</strong>
        </div>
        <div className="stat-card">
          <span>À compléter</span>
          <strong>{incompleteCount}</strong>
        </div>
        <div className="stat-card">
          <span>Reste moyen</span>
          <strong>{formatCurrency(averageRemaining)}</strong>
        </div>
      </section>

      <CandidateTable candidates={candidates} />
    </div>
  );
}
