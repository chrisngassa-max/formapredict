import { Link, useNavigate, useParams } from "react-router-dom";
import { CandidateForm } from "../components/forms/CandidateForm";
import { loadCandidates, upsertCandidate } from "../lib/storage";
import type { Candidate } from "../types/candidate";

export function CandidateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const candidate = loadCandidates().find((item) => item.id === id);

  if (!candidate) {
    return (
      <div className="page">
        <h2>Candidat introuvable</h2>
        <Link to="/">Retour dashboard</Link>
      </div>
    );
  }

  function save(nextCandidate: Candidate) {
    upsertCandidate(nextCandidate);
    navigate(`/candidats/${nextCandidate.id}`);
  }

  return (
    <div className="page narrow">
      <header className="page-header">
        <div>
          <p className="eyebrow">Modification</p>
          <h2>
            {candidate.firstName} {candidate.lastName}
          </h2>
        </div>
      </header>
      <CandidateForm initialCandidate={candidate} onSubmit={save} />
    </div>
  );
}
