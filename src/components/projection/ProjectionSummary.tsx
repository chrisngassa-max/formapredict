import { formatCurrency } from "../../lib/format";
import type { Candidate, ProjectionResult } from "../../types/candidate";
import { ScoreGauge } from "./ScoreGauge";

type ProjectionSummaryProps = {
  candidate: Candidate;
  projection: ProjectionResult;
};

const priorityLabel = {
  prioritaire: "Dossier prioritaire",
  financement_partiel: "Financement partiel",
  aide_limitee: "Aide limitée",
  a_completer: "À compléter",
};

export function ProjectionSummary({ candidate, projection }: ProjectionSummaryProps) {
  const tone = projection.priority === "prioritaire" ? "green" : projection.priority === "aide_limitee" ? "red" : "amber";

  return (
    <section className="summary-panel">
      <div>
        <p className="eyebrow">Projection</p>
        <h2>{priorityLabel[projection.priority]}</h2>
        <p>
          {candidate.firstName} {candidate.lastName} vise {candidate.trainingName}.
        </p>
      </div>
      <div className="summary-grid">
        <ScoreGauge label="Finançabilité" value={projection.financingScore} tone={tone} />
        <ScoreGauge label="Complétude" value={projection.completionScore} tone="blue" />
        <div className="metric-card">
          <span>Reste à charge estimé</span>
          <strong>{formatCurrency(projection.estimatedRemainingCost)}</strong>
          <small>Confiance {projection.financialBreakdown.confidence}</small>
        </div>
      </div>
    </section>
  );
}
