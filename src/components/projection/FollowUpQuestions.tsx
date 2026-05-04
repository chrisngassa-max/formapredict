import type { FollowUpQuestion } from "../../types/candidate";

type FollowUpQuestionsProps = {
  questions: FollowUpQuestion[];
};

const targetLabel = {
  candidat: "Candidat",
  employeur: "Employeur",
  conseiller: "Conseiller",
  financeur: "Financeur",
};

export function FollowUpQuestions({ questions }: FollowUpQuestionsProps) {
  return (
    <div className="assistant-section">
      {questions.length === 0 ? <p>Aucune question prioritaire générée.</p> : null}
      {questions.map((question) => (
        <article className="assistant-card" key={question.id}>
          <div className="question-heading">
            <span className={`priority-dot ${question.priority}`} />
            <p className="eyebrow">{targetLabel[question.target]} · priorité {question.priority}</p>
          </div>
          <h4>{question.question}</h4>
          <p>{question.reason}</p>
        </article>
      ))}
    </div>
  );
}
