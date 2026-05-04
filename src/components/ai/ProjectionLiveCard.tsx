import { formatCurrency } from "../../lib/format";
import type { Candidate, ProjectionResult } from "../../types/candidate";
import { ScoreGauge } from "../projection/ScoreGauge";

type ProjectionLiveCardProps = {
  candidate: Candidate;
  projection: ProjectionResult;
};

const priorityLabel = {
  prioritaire: "Prioritaire",
  financement_partiel: "Financement partiel",
  aide_limitee: "Aide limitée",
  a_completer: "À compléter",
};

export function ProjectionLiveCard({ candidate, projection }: ProjectionLiveCardProps) {
  const activeAids = projection.aids
    .filter((aid) => aid.status === "probable" || aid.status === "a_verifier")
    .slice(0, 4);
  const missingDocumentsCount = projection.missingDocuments.filter((item) => item.status !== "present").length;

  return (
    <aside className="projection-live-card">
      <div>
        <p className="eyebrow">Projection temps réel</p>
        <h3>{priorityLabel[projection.priority]}</h3>
        <p>
          {candidate.firstName || "Nouveau"} {candidate.lastName || "candidat"} · {candidate.trainingName || "formation à préciser"}
        </p>
      </div>

      <div className="live-score-grid">
        <ScoreGauge label="Finançabilité" value={projection.financingScore} tone={projection.financingScore >= 70 ? "green" : projection.financingScore >= 40 ? "amber" : "red"} />
        <ScoreGauge label="Complétude" value={projection.completionScore} tone="blue" />
        <ScoreGauge label="Documents" value={projection.documentScore} tone="blue" />
        <ScoreGauge label="Risque admin." value={projection.adminRiskScore} tone={projection.adminRiskScore > 60 ? "red" : projection.adminRiskScore > 30 ? "amber" : "green"} />
      </div>

      <dl className="breakdown">
        <div>
          <dt>Reste estimé</dt>
          <dd>{formatCurrency(projection.estimatedRemainingCost)}</dd>
        </div>
        <div>
          <dt>Pièces manquantes</dt>
          <dd>{missingDocumentsCount}</dd>
        </div>
        <div>
          <dt>Confiance</dt>
          <dd>{projection.financialBreakdown.confidence}</dd>
        </div>
      </dl>

      <div>
        <h4>Aides probables</h4>
        <div className="aid-chip-list">
          {activeAids.length > 0 ? activeAids.map((aid) => <span className="pill" key={aid.id}>{aid.name}</span>) : <span className="pill">À préciser</span>}
        </div>
      </div>

      <p className="legal-note">
        Projection indicative. Ne constitue pas une décision officielle de financement.
      </p>
    </aside>
  );
}
