import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GuidedIntakePanel } from "../components/ai/GuidedIntakePanel";
import { ProjectionLiveCard } from "../components/ai/ProjectionLiveCard";
import { createEmptyCandidate } from "../lib/candidateFactory";
import { projectCandidate } from "../lib/projectionEngine";
import { applyGuidedAnswer, getNextGuidedQuestion } from "../lib/questionEngine";
import { loadCandidates, upsertCandidate } from "../lib/storage";
import type { Candidate, GuidedAnswer } from "../types/candidate";

export function GuidedIntake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loadedCandidate = useMemo(() => {
    if (!id) return createEmptyCandidate();
    return loadCandidates().find((candidate) => candidate.id === id) ?? null;
  }, [id]);
  const notFound = loadedCandidate === null;
  const [candidate, setCandidate] = useState<Candidate>(() => loadedCandidate ?? createEmptyCandidate());
  const [answers, setAnswers] = useState<GuidedAnswer[]>([]);

  if (notFound) {
    return (
      <div className="page">
        <h2>Dossier introuvable</h2>
        <Link to="/">Retour dashboard</Link>
      </div>
    );
  }

  const projection = projectCandidate(candidate);
  const currentQuestion = getNextGuidedQuestion(candidate, projection, answers);

  function handleAnswer(answer: GuidedAnswer) {
    const nextCandidate =
      answer.status === "answered" && currentQuestion
        ? applyGuidedAnswer(candidate, currentQuestion, answer.value)
        : ({ ...candidate, updatedAt: new Date().toISOString() } satisfies Candidate);

    setCandidate(nextCandidate);
    setAnswers((current) => [answer, ...current]);
    upsertCandidate(nextCandidate);

    if (!id) {
      navigate(`/saisie-guidee/${nextCandidate.id}`, { replace: true });
    }
  }

  function saveAndOpenDetail() {
    upsertCandidate(candidate);
    navigate(`/candidats/${candidate.id}`);
  }

  return (
    <div className="page guided-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Saisie guidée</p>
          <h2>Assistant de préqualification</h2>
          <p>Répondez question par question. La projection se met à jour automatiquement.</p>
        </div>
        <div className="header-actions">
          <button className="secondary" onClick={saveAndOpenDetail}>
            Ouvrir la fiche complète
          </button>
          <Link className="button secondary" to={`/candidats/${candidate.id}/edit`}>
            Modifier en formulaire
          </Link>
        </div>
      </header>

      <section className="guided-layout">
        <div className="guided-main">
          <GuidedIntakePanel candidate={candidate} question={currentQuestion} onAnswer={handleAnswer} />

          <section className="panel">
            <h3>Historique de saisie</h3>
            {answers.length === 0 ? (
              <p>Aucune réponse enregistrée pour cette session.</p>
            ) : (
              <div className="answer-history">
                {answers.map((answer) => (
                  <div className="history-row" key={`${answer.questionId}-${answer.answeredAt}`}>
                    <strong>{answer.questionId}</strong>
                    <span>{answer.status === "answered" ? "Renseigné" : answer.status === "unknown" ? "Je ne sais pas" : "Non applicable"}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <ProjectionLiveCard candidate={candidate} projection={projection} />
      </section>
    </div>
  );
}
