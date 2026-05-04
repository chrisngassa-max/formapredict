import type { DocumentChecklist as DocumentChecklistItem } from "../../types/candidate";

type DocumentChecklistProps = {
  items: DocumentChecklistItem[];
};

const statusLabel = {
  present: "Présent",
  manquant: "Manquant",
  a_verifier: "À vérifier",
};

export function DocumentChecklist({ items }: DocumentChecklistProps) {
  const grouped = items.reduce<Record<string, DocumentChecklistItem[]>>((acc, item) => {
    acc[item.aidName] = [...(acc[item.aidName] ?? []), item];
    return acc;
  }, {});

  return (
    <div className="assistant-section">
      {Object.entries(grouped).map(([aidName, documents]) => (
        <article className="assistant-card" key={aidName}>
          <h4>{aidName}</h4>
          <div className="checklist">
            {documents.map((document) => (
              <div className="checklist-row" key={`${document.aidId}-${document.document}`}>
                <div>
                  <strong>{document.document}</strong>
                  {document.comment ? <small>{document.comment}</small> : null}
                </div>
                <span className={`status-chip ${document.status}`}>{statusLabel[document.status]}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
