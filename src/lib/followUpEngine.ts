import type { Candidate, FollowUpQuestion, ProjectionResult } from "../types/candidate";

function question(
  id: string,
  target: FollowUpQuestion["target"],
  questionText: string,
  reason: string,
  priority: FollowUpQuestion["priority"],
  relatedAidId?: string,
  field?: FollowUpQuestion["field"],
  answerType: FollowUpQuestion["answerType"] = "text",
  options?: FollowUpQuestion["options"]
): FollowUpQuestion {
  return { id, target, question: questionText, reason, priority, relatedAidId, field, answerType, options };
}

export function generateFollowUpQuestions(
  candidate: Candidate,
  projection: Pick<ProjectionResult, "aids" | "missingFields" | "estimatedRemainingCost">
): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];
  const isEmployee = candidate.status === "salarie_cdi" || candidate.status === "salarie_cdd";
  const isTns = candidate.status === "tns" || candidate.status === "auto_entrepreneur";
  const isJobSeeker = candidate.status === "demandeur_emploi";

  if (isEmployee && !candidate.employerSiret) {
    questions.push(question("employer-siret", "employeur", "Quel est le SIRET exact de l'entreprise ?", "Indispensable pour identifier l'OPCO et préparer le dossier employeur.", "haute", "opco", "employerSiret"));
  }
  if (isEmployee && !candidate.employerNaf) {
    questions.push(question("employer-naf", "employeur", "Quel est le code NAF / APE de l'entreprise ?", "Le code NAF aide à identifier l'OPCO et les règles applicables.", "haute", "opco", "employerNaf"));
  }
  if (isEmployee && !candidate.employerCofundingPossible) {
    questions.push(question("employer-cofunding", "employeur", "L'employeur accepte-t-il d'étudier un cofinancement ?", "Le reste à charge peut baisser fortement avec un accord employeur ou OPCO.", "moyenne", "opco", "employerCofundingPossible", "boolean"));
  }
  if (isTns && !candidate.tnsNaf) {
    questions.push(question("tns-naf", "candidat", "Quel est le code NAF / APE de l'activité indépendante ?", "Nécessaire pour orienter vers FIF-PL, FAFCEA ou AGEFICE.", "haute", "faf", "tnsNaf"));
  }
  if (isJobSeeker && !candidate.registeredFranceTravail) {
    questions.push(question("ft-registration", "candidat", "Le candidat peut-il confirmer son inscription France Travail ?", "L'AIF et l'ARE-F nécessitent une validation France Travail.", "haute", "aif", "registeredFranceTravail", "boolean"));
  }
  if (projection.aids.some((aid) => aid.id === "cpf" && aid.status !== "exclu")) {
    questions.push(question("cpf-balance", "candidat", "Quel est le solde CPF vérifié sur Mon Compte Formation ?", "Le solde déclaré reste indicatif tant qu'il n'est pas confirmé.", "moyenne", "cpf", "cpfBalance", "number"));
  }
  if (candidate.isCertified && candidate.registryType === "inconnu") {
    questions.push(question("registry-proof", "conseiller", "La certification est-elle bien inscrite RNCP ou RS ?", "Le financement CPF dépend fortement de cette vérification.", "haute", "cpf", "registryType", "select", [
      { value: "rncp", label: "RNCP" },
      { value: "rs", label: "RS" },
      { value: "non_certifiante", label: "Non certifiante" },
      { value: "inconnu", label: "Inconnu" },
    ]));
  }
  if (candidate.hasRqth) {
    questions.push(question("rqth-proof", "candidat", "Le justificatif RQTH est-il disponible ?", "La donnée est sensible et doit être confirmée uniquement si utile au dossier.", "haute", "agefiph"));
  }
  if (projection.estimatedRemainingCost > 0 && !candidate.acceptsInstallments) {
    questions.push(question("installments", "candidat", "Le candidat accepterait-il un paiement en plusieurs fois si les aides ne couvrent pas tout ?", "Permet de préparer une alternative pour les profils partiellement finançables.", "basse", undefined, "acceptsInstallments", "boolean"));
  }

  return questions;
}
