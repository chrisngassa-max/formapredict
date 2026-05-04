import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../../lib/format";
import { projectCandidate } from "../../lib/projectionEngine";
import type { Candidate } from "../../types/candidate";

type CandidateTableProps = {
  candidates: Candidate[];
};

const priorityLabel = {
  prioritaire: "Prioritaire",
  financement_partiel: "Partiel",
  aide_limitee: "Aide limitée",
  a_completer: "À compléter",
};

export function CandidateTable({ candidates }: CandidateTableProps) {
  const rows = candidates
    .map((candidate) => ({ candidate, projection: projectCandidate(candidate) }))
    .sort((a, b) => b.projection.financingScore - a.projection.financingScore);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Candidat</th>
            <th>Statut</th>
            <th>Formation</th>
            <th>Score</th>
            <th>Complétude</th>
            <th>Reste</th>
            <th>Priorité</th>
            <th>Créé</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ candidate, projection }) => (
            <tr key={candidate.id}>
              <td>
                <strong>
                  {candidate.firstName} {candidate.lastName}
                </strong>
                <small>{candidate.email}</small>
              </td>
              <td>{candidate.status.replace(/_/g, " ")}</td>
              <td>{candidate.trainingName}</td>
              <td>
                <span className="pill strong">{projection.financingScore}</span>
              </td>
              <td>{projection.completionScore} %</td>
              <td>{formatCurrency(projection.estimatedRemainingCost)}</td>
              <td>
                <span className={`pill ${projection.priority}`}>{priorityLabel[projection.priority]}</span>
              </td>
              <td>{formatDate(candidate.createdAt)}</td>
              <td>
                <Link className="icon-link" to={`/candidats/${candidate.id}`} aria-label="Ouvrir la fiche">
                  <ArrowRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
