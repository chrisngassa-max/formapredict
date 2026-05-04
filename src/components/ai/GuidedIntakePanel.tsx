import { useEffect, useState } from "react";
import type { Candidate, FollowUpQuestion, GuidedAnswer } from "../../types/candidate";

type GuidedIntakePanelProps = {
  candidate: Candidate;
  question: FollowUpQuestion | null;
  onAnswer: (answer: GuidedAnswer) => void;
};

export function GuidedIntakePanel({ candidate, question, onAnswer }: GuidedIntakePanelProps) {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (!question?.field) {
      setValue("");
      return;
    }
    const currentValue = candidate[question.field];
    setValue(typeof currentValue === "boolean" ? String(currentValue) : currentValue ? String(currentValue) : "");
  }, [candidate, question]);

  if (!question) {
    return (
      <section className="guided-question-card">
        <p className="eyebrow">Saisie guidée</p>
        <h2>Dossier suffisamment renseigné</h2>
        <p>Il n'y a plus de question prioritaire locale. La fiche peut être relue ou complétée manuellement.</p>
      </section>
    );
  }
  const activeQuestion = question;

  function parseValue(): unknown {
    if (activeQuestion.answerType === "number") return Number(value);
    if (activeQuestion.answerType === "boolean") return value === "true";
    return value;
  }

  function submit(status: GuidedAnswer["status"]) {
    onAnswer({
      questionId: activeQuestion.id,
      field: activeQuestion.field,
      status,
      value: status === "answered" ? parseValue() : undefined,
      answeredAt: new Date().toISOString(),
    });
    setValue("");
  }

  return (
    <section className="guided-question-card">
      <div>
        <p className="eyebrow">Question suivante · priorité {activeQuestion.priority}</p>
        <h2>{activeQuestion.question}</h2>
        <p>{activeQuestion.reason}</p>
      </div>

      <div className="guided-field">
        <label className="field">
          Champ concerné : {activeQuestion.field ?? "information dossier"}
          {activeQuestion.answerType === "boolean" ? (
            <select value={value} onChange={(event) => setValue(event.target.value)}>
              <option value="">Sélectionner</option>
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          ) : activeQuestion.answerType === "select" ? (
            <select value={value} onChange={(event) => setValue(event.target.value)}>
              <option value="">Sélectionner</option>
              {activeQuestion.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={activeQuestion.answerType === "number" ? "number" : "text"}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          )}
        </label>
      </div>

      <div className="guided-actions">
        <button type="button" disabled={activeQuestion.answerType !== "boolean" && value.trim().length === 0} onClick={() => submit("answered")}>
          Je renseigne
        </button>
        <button type="button" className="secondary" onClick={() => submit("unknown")}>
          Je ne sais pas
        </button>
        <button type="button" className="secondary" onClick={() => submit("not_applicable")}>
          Non applicable
        </button>
      </div>
    </section>
  );
}
