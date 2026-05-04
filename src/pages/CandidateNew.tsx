import { useNavigate } from "react-router-dom";
import { CandidateForm } from "../components/forms/CandidateForm";
import { upsertCandidate } from "../lib/storage";
import type { Candidate } from "../types/candidate";

export function CandidateNew() {
  const navigate = useNavigate();

  function save(candidate: Candidate) {
    upsertCandidate(candidate);
    navigate(`/candidats/${candidate.id}`);
  }

  return (
    <div className="page narrow">
      <header className="page-header">
        <div>
          <p className="eyebrow">Saisie interne</p>
          <h2>Nouveau candidat</h2>
          <p>Renseignez les informations connues. Les champs conditionnels s’adaptent au statut.</p>
        </div>
      </header>
      <CandidateForm onSubmit={save} />
    </div>
  );
}
