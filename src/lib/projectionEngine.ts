import type { AidProjection, Candidate, ProjectionResult } from "../types/candidate";
import { calculateDocumentScore, generateDocumentChecklist } from "./checklistEngine";
import { generateFolderTree } from "./folderEngine";
import { clamp } from "./format";
import { generateFollowUpQuestions } from "./followUpEngine";
import { generateInternalNote } from "./noteEngine";

const CPF_RS_CAP = 1500;
const CPF_FLAT_FEE = 150;

function isEmployee(candidate: Candidate): boolean {
  return candidate.status === "salarie_cdi" || candidate.status === "salarie_cdd";
}

function isTns(candidate: Candidate): boolean {
  return candidate.status === "tns" || candidate.status === "auto_entrepreneur";
}

function isJobSeeker(candidate: Candidate): boolean {
  return candidate.status === "demandeur_emploi";
}

function hasDelfDalfAlert(candidate: Candidate): boolean {
  const text = `${candidate.trainingName} ${candidate.certificationName ?? ""}`.toLowerCase();
  return text.includes("delf") || text.includes("dalf");
}

function eligibleCpf(candidate: Candidate): boolean {
  return candidate.isCertified && (candidate.registryType === "rncp" || candidate.registryType === "rs");
}

function estimateCpf(candidate: Candidate): number {
  if (!eligibleCpf(candidate) || hasDelfDalfAlert(candidate)) return 0;
  const cap = candidate.registryType === "rs" ? CPF_RS_CAP : candidate.trainingCostHt;
  const flatFee = !isJobSeeker(candidate) && candidate.cpfAlreadyUsed ? CPF_FLAT_FEE : 0;
  return Math.max(0, Math.min(candidate.cpfBalance, cap, candidate.trainingCostHt) - flatFee);
}

function estimateFafName(candidate: Candidate): string {
  if (candidate.knownFaf) return candidate.knownFaf;
  if (candidate.tnsActivityType === "liberal") return "FIF-PL";
  if (candidate.tnsActivityType === "artisan") return "FAFCEA";
  if (candidate.tnsActivityType === "commercant") return "AGEFICE";
  return "FAF à identifier";
}

function addAid(aids: AidProjection[], aid: AidProjection): void {
  aids.push(aid);
}

export function projectCandidate(candidate: Candidate): ProjectionResult {
  const aids: AidProjection[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  const compatibilityNotes: string[] = [];
  const recommendedActions: string[] = [];
  let rawScore = 0;

  if (eligibleCpf(candidate) && !hasDelfDalfAlert(candidate)) {
    const amount = estimateCpf(candidate);
    rawScore += 25;
    if (amount >= candidate.trainingCostHt * 0.5) rawScore += 15;
    addAid(aids, {
      id: "cpf",
      name: "CPF",
      status: "probable",
      estimatedAmount: amount,
      confidence: "moyenne",
      reason: "Formation déclarée certifiante et inscrite RNCP/RS.",
      requiredChecks: [
        "Vérifier l'inscription exacte de la certification.",
        "Confirmer le solde CPF réel sur Mon Compte Formation.",
      ],
    });
    if (candidate.registryType === "rs") {
      compatibilityNotes.push("Plafond RS indicatif appliqué à 1 500 €, à confirmer selon la règle en vigueur.");
    }
    if (!isJobSeeker(candidate) && candidate.cpfAlreadyUsed) {
      compatibilityNotes.push("Forfait CPF indicatif de 150 € retenu pour les actifs hors demandeurs d'emploi.");
    }
  } else {
    rawScore -= candidate.registryType === "non_certifiante" ? 25 : 0;
    addAid(aids, {
      id: "cpf",
      name: "CPF",
      status: hasDelfDalfAlert(candidate) ? "exclu" : "a_verifier",
      confidence: "moyenne",
      reason: hasDelfDalfAlert(candidate)
        ? "Alerte DELF/DALF : financement CPF signalé comme exclu dans le cahier des charges."
        : "Certification RNCP/RS absente ou inconnue.",
      requiredChecks: ["Vérifier l'inscription RNCP/RS de la formation."],
    });
  }

  if (hasDelfDalfAlert(candidate)) {
    rawScore -= 10;
    warnings.push("DELF/DALF détecté : financement CPF à exclure ou vérifier fortement.");
  }

  if (isJobSeeker(candidate) && candidate.registeredFranceTravail) {
    rawScore += 20;
    addAid(aids, {
      id: "aif",
      name: "France Travail - AIF",
      status: "a_verifier",
      confidence: "moyenne",
      reason: "Candidat demandeur d'emploi inscrit France Travail.",
      requiredChecks: ["Validation du projet par le conseiller France Travail.", "Devis et programme de formation."],
    });
  }

  if (isJobSeeker(candidate) && candidate.receivesAre && candidate.trainingHours > 40) {
    addAid(aids, {
      id: "are-f",
      name: "ARE-F",
      status: "a_verifier",
      confidence: "moyenne",
      reason: "Demandeur d'emploi indemnisé ARE avec formation de plus de 40h.",
      requiredChecks: ["Confirmer la durée de droits ARE.", "Vérifier le passage en ARE-F."],
    });
    compatibilityNotes.push("AIF et ARE-F relèvent d'une validation France Travail et ne doivent pas être présentées comme cumul automatique.");
  }

  if (isEmployee(candidate)) {
    addAid(aids, {
      id: "opco",
      name: "OPCO / Plan de développement des compétences",
      status: candidate.employerSize && candidate.employerSize < 50 ? "probable" : "a_verifier",
      confidence: "moyenne",
      reason: "Candidat salarié : l'OPCO ou l'employeur peuvent être mobilisés.",
      requiredChecks: ["Identifier l'OPCO via le code NAF.", "Valider l'accord employeur."],
    });
    rawScore += candidate.employerSize && candidate.employerSize < 50 ? 20 : 8;
    compatibilityNotes.push("CPF + OPCO ou employeur : cofinancement possible, à confirmer avec l'entreprise.");
  }

  if (
    candidate.status === "salarie_cdi" &&
    candidate.diplomaLevel !== "bac3_plus" &&
    candidate.isCertified
  ) {
    rawScore += 15;
    addAid(aids, {
      id: "pro-a",
      name: "Pro-A",
      status: "a_verifier",
      confidence: "moyenne",
      reason: "Salarié CDI, niveau inférieur à Bac+3 et formation certifiante.",
      requiredChecks: ["Vérifier l'accord de branche.", "Confirmer l'éligibilité de la certification."],
    });
  }

  if (
    candidate.status === "salarie_cdi" &&
    candidate.projectGoal === "reconversion" &&
    candidate.trainingHours <= 1200
  ) {
    rawScore += 15;
    addAid(aids, {
      id: "ptp",
      name: "Transitions Pro / PTP",
      status: "a_verifier",
      confidence: "faible",
      reason: "Projet de reconversion salarié CDI avec durée inférieure ou égale à 1 200h.",
      requiredChecks: ["Vérifier ancienneté.", "Préparer synthèse CEP.", "Analyser priorités régionales Transitions Pro."],
    });
  }

  if (isTns(candidate)) {
    rawScore += 8;
    addAid(aids, {
      id: "faf",
      name: estimateFafName(candidate),
      status: candidate.tnsNaf || candidate.knownFaf ? "probable" : "a_verifier",
      confidence: candidate.tnsNaf || candidate.knownFaf ? "moyenne" : "faible",
      reason: "Travailleur indépendant ou auto-entrepreneur.",
      requiredChecks: ["Confirmer le code NAF.", "Vérifier le FAF compétent et ses plafonds."],
    });
  }

  if (candidate.hasRqth) {
    rawScore += 10;
    addAid(aids, {
      id: "agefiph",
      name: "Agefiph",
      status: "a_verifier",
      estimatedAmount: candidate.projectGoal === "creation_entreprise" ? 6000 : undefined,
      confidence: candidate.projectGoal === "creation_entreprise" ? "moyenne" : "faible",
      reason:
        candidate.projectGoal === "creation_entreprise"
          ? "RQTH et projet de création d'entreprise."
          : "RQTH déclarée : aides Agefiph potentielles selon situation.",
      requiredChecks: ["Vérifier justificatif RQTH.", "Confirmer l'aide mobilisable selon le projet."],
    });
  }

  if (candidate.employerCofundingPossible) rawScore += 5;
  if ((candidate.personalBudget ?? 0) > 0 || candidate.acceptsInstallments) rawScore += 5;
  if (candidate.cpfBalance < candidate.trainingCostHt * 0.2) rawScore -= 10;

  if (isEmployee(candidate)) {
    if (!candidate.employerSiret) missingFields.push("SIRET employeur");
    if (!candidate.employerNaf) missingFields.push("Code NAF employeur");
    if (!candidate.employerName) missingFields.push("Nom employeur");
    if (!candidate.employerSiret || !candidate.employerNaf) rawScore -= 15;
  }

  if (isTns(candidate)) {
    if (!candidate.tnsSiret) missingFields.push("SIRET indépendant");
    if (!candidate.tnsNaf) missingFields.push("Code NAF indépendant");
    if (!candidate.tnsSiret || !candidate.tnsNaf) rawScore -= 15;
  }

  const criticalValues = [
    candidate.firstName,
    candidate.lastName,
    candidate.email,
    candidate.phone,
    candidate.status,
    candidate.diplomaLevel,
    candidate.trainingName,
    candidate.projectGoal,
    candidate.trainingHours > 0,
    candidate.trainingCostHt > 0,
    candidate.registryType,
    typeof candidate.cpfBalance === "number",
    typeof candidate.hasRqth === "boolean",
  ];
  const completionScore = Math.round(
    (criticalValues.filter(Boolean).length / criticalValues.length) * 100
  );

  if (!candidate.isCertified || candidate.registryType === "non_certifiante") {
    warnings.push("Formation non certifiante ou non inscrite RNCP/RS : financement plus fragile.");
  }
  if (missingFields.length > 0) {
    warnings.push("Informations critiques manquantes : la projection doit être complétée.");
  }

  const cpfEstimated = estimateCpf(candidate);
  const probableAidTotal = aids
    .filter((aid) => aid.id !== "cpf" && aid.status === "probable")
    .reduce((total, aid) => total + (aid.estimatedAmount ?? 0), 0);
  const employerEstimated = candidate.employerCofundingPossible
    ? Math.max(0, Math.min(candidate.trainingCostHt * 0.2, candidate.trainingCostHt - cpfEstimated))
    : 0;
  const personalBudget = candidate.personalBudget ?? 0;
  const estimatedRemainingCost = Math.max(
    0,
    candidate.trainingCostHt - cpfEstimated - probableAidTotal - employerEstimated - personalBudget
  );

  const financingScore = Math.round(clamp(rawScore));
  let priority: ProjectionResult["priority"] = "aide_limitee";
  if (completionScore < 60) priority = "a_completer";
  else if (financingScore >= 70 && completionScore >= 80) priority = "prioritaire";
  else if (financingScore >= 40) priority = "financement_partiel";

  if (priority === "prioritaire") recommendedActions.push("Monter ce dossier en priorité.");
  if (priority === "financement_partiel") recommendedActions.push("Chercher un cofinancement employeur, OPCO ou personnel.");
  if (priority === "aide_limitee") recommendedActions.push("Proposer un paiement en 3x ou 6x et vérifier les aides secondaires.");
  if (priority === "a_completer") recommendedActions.push("Compléter les informations manquantes avant décision interne.");
  if (estimatedRemainingCost > 0 && candidate.acceptsInstallments) {
    recommendedActions.push("Préparer une proposition de paiement échelonné.");
  }

  const missingDocuments = generateDocumentChecklist(candidate, aids);
  const documentScore = calculateDocumentScore(missingDocuments);
  const folderTree = generateFolderTree(candidate, missingDocuments);
  const adminRiskScore = Math.round(
    clamp(
      100 -
        documentScore * 0.45 -
        completionScore * 0.35 -
        financingScore * 0.2 +
        warnings.length * 8 +
        missingFields.length * 6
    )
  );
  const baseProjection = {
    aids,
    priority,
    financingScore,
    completionScore,
    documentScore,
    adminRiskScore,
    estimatedRemainingCost,
    missingFields,
    warnings,
    recommendedActions,
  };
  const followUpQuestions = generateFollowUpQuestions(candidate, baseProjection);
  const internalNote = generateInternalNote(candidate, baseProjection, followUpQuestions);

  return {
    financingScore,
    completionScore,
    documentScore,
    adminRiskScore,
    priority,
    estimatedRemainingCost,
    financialBreakdown: {
      trainingCost: candidate.trainingCostHt,
      cpfEstimated,
      aidEstimated: probableAidTotal,
      employerEstimated,
      personalBudget,
      estimatedRemainingCost,
      confidence: missingFields.length > 0 ? "faible" : aids.some((aid) => aid.status === "a_verifier") ? "moyenne" : "forte",
    },
    aids,
    missingDocuments,
    folderTree,
    followUpQuestions,
    internalNote,
    warnings,
    missingFields,
    compatibilityNotes,
    recommendedActions,
  };
}
