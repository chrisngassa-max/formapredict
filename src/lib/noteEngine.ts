import type { Candidate, FollowUpQuestion, ProjectionResult } from "../types/candidate";
import { formatCurrency } from "./format";

const priorityLabel = {
  prioritaire: "dossier prioritaire",
  financement_partiel: "financement partiel",
  aide_limitee: "aide limitée",
  a_completer: "dossier à compléter",
};

export function generateInternalNote(
  candidate: Candidate,
  projection: Pick<
    ProjectionResult,
    | "aids"
    | "priority"
    | "financingScore"
    | "completionScore"
    | "documentScore"
    | "adminRiskScore"
    | "estimatedRemainingCost"
    | "missingFields"
    | "warnings"
    | "recommendedActions"
  >,
  questions: FollowUpQuestion[]
): string {
  const activeAids = projection.aids
    .filter((aid) => aid.status === "probable" || aid.status === "a_verifier")
    .map((aid) => aid.name)
    .join(", ");
  const blockers = [
    ...projection.missingFields,
    ...projection.warnings,
    ...questions.filter((item) => item.priority === "haute").map((item) => item.question),
  ];

  return [
    `Profil : ${candidate.status.replace(/_/g, " ")} — niveau ${candidate.diplomaLevel.replace(/_/g, " ")} — ${candidate.trainingName}.`,
    `Priorité : ${priorityLabel[projection.priority]} avec un score financement de ${projection.financingScore}/100, une complétude de ${projection.completionScore}% et un score documentaire de ${projection.documentScore}%.`,
    `Pistes détectées : ${activeAids || "aucune piste fiable à ce stade"}.`,
    `Reste à charge estimé : ${formatCurrency(projection.estimatedRemainingCost)}. Risque administratif : ${projection.adminRiskScore}/100.`,
    `Points bloquants : ${blockers.length > 0 ? blockers.join(" | ") : "aucun blocage majeur identifié"}.`,
    `Actions prioritaires : ${projection.recommendedActions.join(" | ") || "poursuivre l'analyse interne"}.`,
  ].join("\n");
}
