import { useEffect, useState } from "react";
import { loadCandidates } from "../lib/storage";
import type { Candidate } from "../types/candidate";

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  function refresh() {
    setCandidates(loadCandidates());
  }

  useEffect(() => {
    refresh();
  }, []);

  return { candidates, refresh };
}
