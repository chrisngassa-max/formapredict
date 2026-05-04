import type { AidProjection } from "../../types/candidate";
import { formatCurrency } from "../../lib/format";

type AidCardProps = {
  aid: AidProjection;
};

const statusLabel = {
  probable: "Probable",
  a_verifier: "À vérifier",
  exclu: "Exclu",
  non_applicable: "Non applicable",
};

export function AidCard({ aid }: AidCardProps) {
  return (
    <article className={`aid-card ${aid.status}`}>
      <div className="aid-card-header">
        <div>
          <p className="eyebrow">{statusLabel[aid.status]}</p>
          <h3>{aid.name}</h3>
        </div>
        {typeof aid.estimatedAmount === "number" ? <strong>{formatCurrency(aid.estimatedAmount)}</strong> : null}
      </div>
      <p>{aid.reason}</p>
      <div className="confidence">Confiance : {aid.confidence}</div>
      {aid.requiredChecks.length > 0 ? (
        <ul>
          {aid.requiredChecks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
