import type { Candidate, FollowUpQuestion, ProjectionResult } from "../types/candidate";

export type AiAnalysis = {
  summary: string;
  confidence: "forte" | "moyenne" | "faible";
  probable_aids: string[];
  next_questions: Array<{
    question: string;
    field?: keyof Candidate | "";
    priority: "haute" | "moyenne" | "basse";
    reason: string;
    target: FollowUpQuestion["target"];
  }>;
  missing_documents: Array<{
    name: string;
    required_for: string;
    status: "present" | "manquant" | "a_verifier";
  }>;
  risk_flags: string[];
  projection_comment: string;
};

export type AiAnalyzeResponse =
  | { ok: true; mode: "anthropic"; result: AiAnalysis }
  | { ok: false; mode: "local_fallback"; error: string; raw?: string };

const DEFAULT_API_URL = "http://localhost:3001";

export async function analyzeCandidateWithAi(input: {
  candidate: Candidate;
  projection: ProjectionResult;
  localQuestion: FollowUpQuestion | null;
}): Promise<AiAnalyzeResponse> {
  const apiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

  try {
    const response = await fetch(`${apiUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return (await response.json()) as AiAnalyzeResponse;
  } catch (error) {
    return {
      ok: false,
      mode: "local_fallback",
      error: error instanceof Error ? error.message : "Impossible de joindre le serveur IA.",
    };
  }
}
