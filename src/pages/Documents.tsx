import { FileText, ShieldCheck, Sparkles } from "lucide-react";

const futureSteps = [
  {
    title: "Importer les documents financeurs",
    description: "PDF OPCO, règles CPF, barèmes Agefiph, procédures France Travail.",
    icon: FileText,
  },
  {
    title: "Extraire les règles avec IA",
    description: "Conditions, pièces requises, exclusions, cumuls et sources citées.",
    icon: Sparkles,
  },
  {
    title: "Valider avant intégration",
    description: "Le conseiller valide chaque règle avant qu'elle influence le moteur de projection.",
    icon: ShieldCheck,
  },
];

export function Documents() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Phase 2</p>
          <h2>Documents financeurs</h2>
          <p>Préparation de la future analyse IA documentaire. Aucun document n'est encore envoyé à une API.</p>
        </div>
      </header>

      <section className="cards-grid">
        {futureSteps.map((step) => {
          const Icon = step.icon;
          return (
            <article className="panel document-step" key={step.title}>
              <Icon size={24} />
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          );
        })}
      </section>

      <section className="panel">
        <h3>Flux cible</h3>
        <ol className="timeline-list">
          <li>Dépôt d'un document financeur par l'associée.</li>
          <li>Extraction IA structurée en JSON avec sources et niveau de confiance.</li>
          <li>Validation humaine : règle proposée, validée, rejetée ou à vérifier.</li>
          <li>Intégration dans le moteur de projection uniquement après validation.</li>
        </ol>
      </section>

      <p className="legal-note">
        L'IA documentaire guidera l'analyse, mais ne décidera pas. Le moteur de règles calcule, le conseiller valide.
      </p>
    </div>
  );
}
