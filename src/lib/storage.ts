import { seedCandidates } from "../data/seedCandidates";
import type { Candidate } from "../types/candidate";

const STORAGE_KEY = "formapredict:candidates";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadCandidates(): Candidate[] {
  if (!canUseStorage()) return seedCandidates;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveCandidates(seedCandidates);
    return seedCandidates;
  }
  try {
    return JSON.parse(raw) as Candidate[];
  } catch {
    saveCandidates(seedCandidates);
    return seedCandidates;
  }
}

export function saveCandidates(candidates: Candidate[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
}

export function upsertCandidate(candidate: Candidate): void {
  const candidates = loadCandidates();
  const index = candidates.findIndex((item) => item.id === candidate.id);
  const next =
    index >= 0
      ? candidates.map((item, itemIndex) => (itemIndex === index ? candidate : item))
      : [candidate, ...candidates];
  saveCandidates(next);
}

export function deleteCandidate(id: string): void {
  saveCandidates(loadCandidates().filter((candidate) => candidate.id !== id));
}

export function resetCandidates(): void {
  saveCandidates(seedCandidates);
}
