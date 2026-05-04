import type { Candidate, FollowUpQuestion, GuidedAnswer, ProjectionResult } from "../types/candidate";

const priorityRank = {
  haute: 0,
  moyenne: 1,
  basse: 2,
};

function hasValue(candidate: Candidate, field?: keyof Candidate): boolean {
  if (!field) return false;
  const value = candidate[field];
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return value > 0;
  if (typeof value === "boolean") return value === true;
  return value !== undefined && value !== null;
}

function baseQuestions(candidate: Candidate): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];

  if (!candidate.firstName) {
    questions.push({
      id: "first-name",
      target: "secretaire",
      question: "Quel est le prénom du candidat ?",
      reason: "Identifie le dossier et permet de générer une synthèse lisible.",
      priority: "haute",
      field: "firstName",
      answerType: "text",
    });
  }
  if (!candidate.lastName) {
    questions.push({
      id: "last-name",
      target: "secretaire",
      question: "Quel est le nom du candidat ?",
      reason: "Identifie le dossier et prépare les exports.",
      priority: "haute",
      field: "lastName",
      answerType: "text",
    });
  }
  if (!candidate.phone) {
    questions.push({
      id: "phone",
      target: "secretaire",
      question: "Quel est le numéro de téléphone du candidat ?",
      reason: "Permet de recontacter rapidement le candidat si une pièce manque.",
      priority: "moyenne",
      field: "phone",
      answerType: "text",
    });
  }
  if (!candidate.email) {
    questions.push({
      id: "email",
      target: "secretaire",
      question: "Quel est l'email du candidat ?",
      reason: "Utile pour envoyer une demande de pièces ou une synthèse.",
      priority: "moyenne",
      field: "email",
      answerType: "text",
    });
  }
  if (!candidate.trainingName) {
    questions.push({
      id: "training-name",
      target: "secretaire",
      question: "Quelle formation le candidat souhaite-t-il suivre ?",
      reason: "La formation détermine les aides possibles et les pièces à réunir.",
      priority: "haute",
      field: "trainingName",
      answerType: "text",
    });
  }
  if (candidate.trainingCostHt <= 0) {
    questions.push({
      id: "training-cost",
      target: "secretaire",
      question: "Quel est le coût HT de la formation ?",
      reason: "Le coût est nécessaire pour estimer le CPF, les cofinancements et le reste à charge.",
      priority: "haute",
      field: "trainingCostHt",
      answerType: "number",
    });
  }

  return questions;
}

export function getNextGuidedQuestion(
  candidate: Candidate,
  projection: ProjectionResult,
  answers: GuidedAnswer[]
): FollowUpQuestion | null {
  const answeredIds = new Set(answers.map((answer) => answer.questionId));
  const candidates = [...baseQuestions(candidate), ...projection.followUpQuestions]
    .filter((question) => !answeredIds.has(question.id))
    .filter((question) => !hasValue(candidate, question.field))
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

  return candidates[0] ?? null;
}

export function applyGuidedAnswer(
  candidate: Candidate,
  question: FollowUpQuestion,
  value: unknown
): Candidate {
  if (!question.field) return { ...candidate, updatedAt: new Date().toISOString() };
  return {
    ...candidate,
    [question.field]: value,
    updatedAt: new Date().toISOString(),
  };
}
