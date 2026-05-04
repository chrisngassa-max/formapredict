import type { ProjectionResult } from "../../types/candidate";
import { DocumentChecklist } from "./DocumentChecklist";
import { FolderTree } from "./FolderTree";
import { FollowUpQuestions } from "./FollowUpQuestions";
import { InternalNote } from "./InternalNote";
import { ScoreGauge } from "./ScoreGauge";

type AssistantDossierProps = {
  projection: ProjectionResult;
};

export function AssistantDossier({ projection }: AssistantDossierProps) {
  return (
    <section className="panel assistant-panel">
      <div className="assistant-header">
        <div>
          <p className="eyebrow">Assistant dossier local</p>
          <h3>Préparation du dossier</h3>
          <p>Checklist, questions et arborescence générées par règles locales, sans IA externe.</p>
        </div>
        <div className="assistant-scores">
          <ScoreGauge label="Documents" value={projection.documentScore} tone="blue" />
          <ScoreGauge label="Risque admin." value={projection.adminRiskScore} tone={projection.adminRiskScore > 60 ? "red" : projection.adminRiskScore > 30 ? "amber" : "green"} />
        </div>
      </div>

      <div className="assistant-grid">
        <div className="panel inner-panel">
          <h3>Pièces à réunir</h3>
          <DocumentChecklist items={projection.missingDocuments} />
        </div>
        <div className="panel inner-panel">
          <h3>Questions à poser</h3>
          <FollowUpQuestions questions={projection.followUpQuestions} />
        </div>
      </div>

      <div className="assistant-grid">
        <div className="panel inner-panel">
          <h3>Arborescence dossier</h3>
          <FolderTree nodes={projection.folderTree} />
        </div>
        <div className="panel inner-panel">
          <h3>Note interne</h3>
          <InternalNote note={projection.internalNote} />
        </div>
      </div>
    </section>
  );
}
