import type { AidProjection, Candidate, DocumentChecklist } from "../types/candidate";

function isPresent(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return value > 0;
  if (typeof value === "boolean") return value;
  return Boolean(value);
}

function item(
  aid: AidProjection,
  document: string,
  present: boolean,
  required = true,
  comment?: string
): DocumentChecklist {
  return {
    aidId: aid.id,
    aidName: aid.name,
    document,
    required,
    status: present ? "present" : required ? "manquant" : "a_verifier",
    comment,
  };
}

export function generateDocumentChecklist(
  candidate: Candidate,
  aids: AidProjection[]
): DocumentChecklist[] {
  const checklist: DocumentChecklist[] = [];

  for (const aid of aids) {
    if (aid.status === "exclu" || aid.status === "non_applicable") continue;

    if (aid.id === "cpf") {
      checklist.push(
        item(aid, "Solde CPF déclaré", isPresent(candidate.cpfBalance), true, "À confirmer sur Mon Compte Formation."),
        item(aid, "Certification RNCP/RS", candidate.isCertified && candidate.registryType !== "non_certifiante", true),
        item(aid, "Devis de formation", false, true, "Document à joindre dans la phase dossier réel."),
        item(aid, "Programme de formation", false, true),
        item(aid, "Accord candidat pour mobilisation CPF", candidate.cpfAlreadyUsed, false)
      );
    }

    if (aid.id === "opco") {
      checklist.push(
        item(aid, "SIRET employeur", isPresent(candidate.employerSiret)),
        item(aid, "Code NAF employeur", isPresent(candidate.employerNaf)),
        item(aid, "Effectif entreprise", isPresent(candidate.employerSize)),
        item(aid, "OPCO identifié", isPresent(candidate.knownOpco), false),
        item(aid, "Accord employeur", Boolean(candidate.employerCofundingPossible), true),
        item(aid, "Devis de formation", false, true),
        item(aid, "Programme de formation", false, true)
      );
    }

    if (aid.id === "pro-a") {
      checklist.push(
        item(aid, "Niveau diplôme inférieur à Bac+3", candidate.diplomaLevel !== "bac3_plus"),
        item(aid, "Certification éligible", candidate.isCertified && candidate.registryType !== "non_certifiante"),
        item(aid, "Accord employeur", Boolean(candidate.employerCofundingPossible), true),
        item(aid, "Accord de branche / OPCO", false, true, "Vérification obligatoire avant constitution.")
      );
    }

    if (aid.id === "ptp") {
      checklist.push(
        item(aid, "Projet de reconversion explicite", candidate.projectGoal === "reconversion"),
        item(aid, "Durée formation ≤ 1 200h", candidate.trainingHours > 0 && candidate.trainingHours <= 1200),
        item(aid, "Synthèse CEP", false, true),
        item(aid, "Justificatifs ancienneté", false, true)
      );
    }

    if (aid.id === "aif" || aid.id === "are-f") {
      checklist.push(
        item(aid, "Inscription France Travail", candidate.registeredFranceTravail),
        item(aid, "Situation ARE", candidate.receivesAre, aid.id === "are-f"),
        item(aid, "Durée de formation renseignée", candidate.trainingHours > 0),
        item(aid, "PPAE ou validation conseiller", false, true),
        item(aid, "Devis de formation", false, true),
        item(aid, "Programme de formation", false, true)
      );
    }

    if (aid.id === "faf") {
      checklist.push(
        item(aid, "SIRET indépendant", isPresent(candidate.tnsSiret)),
        item(aid, "Code NAF indépendant", isPresent(candidate.tnsNaf)),
        item(aid, "Type d'activité", isPresent(candidate.tnsActivityType)),
        item(aid, "FAF confirmé", isPresent(candidate.knownFaf), false),
        item(aid, "Attestation de contribution formation", false, true),
        item(aid, "Devis et programme", false, true)
      );
    }

    if (aid.id === "agefiph") {
      checklist.push(
        item(aid, "Justificatif RQTH", candidate.hasRqth),
        item(aid, "Projet détaillé", isPresent(candidate.projectGoal)),
        item(aid, "Devis de formation", false, true),
        item(aid, "Justificatifs spécifiques Agefiph", false, true)
      );
    }
  }

  return checklist;
}

export function calculateDocumentScore(checklist: DocumentChecklist[]): number {
  const required = checklist.filter((item) => item.required);
  if (required.length === 0) return 100;
  const present = required.filter((item) => item.status === "present").length;
  return Math.round((present / required.length) * 100);
}
