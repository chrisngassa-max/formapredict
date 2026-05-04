# FormaPredict - Plan IA de saisie guidee

## Objectif

FormaPredict doit devenir un assistant de saisie guidee pour la prequalification des dossiers de financement formation.

Le fonctionnement cible est simple :

- une secretaire renseigne quelques informations fondamentales ;
- l'application calcule une premiere projection ;
- l'assistant pose automatiquement la prochaine question utile ;
- chaque reponse met a jour le dossier candidat ;
- la projection se recalcule en temps reel ;
- l'IA documentaire intervient ensuite pour analyser les documents officiels et renforcer la projection.

L'application ne promet jamais un financement. Elle produit une projection indicative, a verifier aupres des organismes concernes.

## Principe fondamental

FormaPredict conserve deux cerveaux distincts :

1. Le moteur local de regles
   - TypeScript pur.
   - Stable, traçable et testable.
   - Calcule les scores, les aides probables, les pieces manquantes, les questions et le reste a charge.
   - Fonctionne meme sans IA externe.

2. L'IA documentaire
   - Analyse les documents officiels et le profil candidat.
   - Propose des questions et syntheses.
   - Repond en JSON structure.
   - Ne doit jamais exposer la cle API dans le frontend.
   - Passe obligatoirement par un backend securise.

L'objectif n'est pas que l'assistante valide chaque regle une par une. L'objectif est que la saisie soit automatique et guidee, avec un mode prudent quand l'information est insuffisante.

## Parcours cible

```text
Secretaire saisit les infos de base
        ↓
projectionEngine.ts calcule une premiere projection
        ↓
questionEngine.ts choisit la prochaine question utile
        ↓
Secretaire repond : Je renseigne / Je ne sais pas / Non applicable
        ↓
Le champ Candidate correspondant est mis a jour
        ↓
La projection est recalculee
        ↓
L'assistant propose la question suivante
        ↓
Quand le dossier est suffisamment complet, l'IA documentaire peut enrichir l'analyse
```

## Experience utilisateur cible

### Panneau gauche - question en cours

```text
Question suivante
Quel est le code NAF de l'employeur ?

Pourquoi ?
Permet d'identifier l'OPCO et le financement potentiel.

Champ concerne
Code NAF employeur

[ Je renseigne ] [ Je ne sais pas ] [ Non applicable ]
```

### Panneau droit - projection en temps reel

```text
Financabilite : 68 / 100
Completude : 72 %
Documents : 48 %
Risque administratif : moyen
Aides probables : CPF, OPCO, Pro-A
Pieces manquantes : 3
Confiance : moyenne
```

## Etat actuel du projet

Deja implemente :

- `projectionEngine.ts`
- `checklistEngine.ts`
- `folderEngine.ts`
- `followUpEngine.ts`
- `noteEngine.ts`
- `DocumentChecklist`
- `FolderNode`
- `FollowUpQuestion`
- dashboard conseiller
- formulaire candidat multi-etapes
- fiche projection candidat
- assistant dossier local dans la fiche candidat
- page `/documents`
- sauvegarde `localStorage`

A ajouter :

- mode `/saisie-guidee`
- `questionEngine.ts`
- champ `field` dans les questions pour mettre a jour automatiquement le bon champ candidat
- JSON de regles
- backend IA securise
- service frontend `aiService.ts`
- analyse IA des documents officiels
- mode degrade si API indisponible

## Routes cible

```text
/                       Dashboard conseiller
/candidats/nouveau      Formulaire complet
/candidats/:id          Fiche projection
/candidats/:id/edit     Edition candidat
/saisie-guidee          Nouvelle saisie guidee
/saisie-guidee/:id      Reprise d'un dossier guide
/documents              Base documentaire officielle
/formations             Catalogue formations
/parametres             Regles et seuils
```

## Types a faire evoluer

### FollowUpQuestion

Le type existe deja, mais doit etre enrichi pour la saisie guidee :

```ts
type FollowUpQuestion = {
  id: string;
  target: "secretaire" | "candidat" | "employeur" | "conseiller" | "financeur";
  question: string;
  reason: string;
  priority: "haute" | "moyenne" | "basse";
  relatedAidId?: string;
  field?: keyof Candidate;
  answerType?: "text" | "number" | "boolean" | "select";
  options?: string[];
};
```

### AiAnalysis

```ts
type AiAnalysis = {
  summary: string;
  confidence: "forte" | "moyenne" | "faible";
  probableAids: string[];
  nextQuestions: FollowUpQuestion[];
  missingDocuments: DocumentChecklist[];
  riskFlags: string[];
  projectionComment: string;
};
```

### EvidenceSource

Le type existe deja et servira a la phase documentaire :

```ts
type EvidenceSource = {
  documentName: string;
  page?: number;
  excerpt?: string;
  confidence: "forte" | "moyenne" | "faible";
};
```

## Moteurs locaux cibles

### `projectionEngine.ts`

Role :

- calculer les aides probables ;
- calculer le score de financabilite ;
- calculer le score de completude ;
- calculer le score documentaire ;
- calculer le risque administratif ;
- calculer le reste a charge estime ;
- retourner les alertes, compatibilites, questions, pieces et note interne.

### `checklistEngine.ts`

Role :

- lire les aides detectees ;
- generer les pieces requises par aide ;
- indiquer `present`, `manquant` ou `a_verifier` ;
- distinguer les pieces obligatoires et optionnelles.

### `folderEngine.ts`

Role :

- generer une arborescence de dossier ;
- structurer le dossier en blocs :
  - identite ;
  - situation professionnelle ;
  - formation ;
  - financement ;
  - pieces manquantes ;
  - synthese conseiller.

### `noteEngine.ts`

Role :

- generer une note interne claire ;
- resumer le profil ;
- afficher les aides detectees ;
- afficher les points bloquants ;
- afficher les actions prioritaires.

### `followUpEngine.ts`

Role actuel :

- generer une liste de questions utiles.

Role futur :

- devenir la base du `questionEngine.ts`, ou rester comme moteur de questions globales.

### `questionEngine.ts`

Nouveau moteur a creer.

Role :

- choisir une seule prochaine question prioritaire ;
- associer cette question a un champ `Candidate` ;
- ignorer les questions deja repondues ;
- gerer `Je ne sais pas` et `Non applicable` ;
- recalculer la question suivante apres chaque reponse.

Signature cible :

```ts
export function getNextGuidedQuestion(
  candidate: Candidate,
  projection: ProjectionResult,
  answers: GuidedAnswer[]
): FollowUpQuestion | null;
```

Type associe :

```ts
type GuidedAnswer = {
  questionId: string;
  field?: keyof Candidate;
  status: "answered" | "unknown" | "not_applicable";
  value?: unknown;
  answeredAt: string;
};
```

## Donnees JSON de regles

Objectif :

- sortir progressivement les regles du code ;
- rendre les seuils et pieces modifiables ;
- fournir a l'IA un contexte structure ;
- eviter que l'IA raisonne sur des generalites.

Fichiers cibles :

```text
src/data/rules/aids.json
src/data/rules/documents.json
src/data/rules/thresholds.json
src/data/rules/opco-naf.json
src/data/rules/trainings.json
```

### `thresholds.json`

```json
{
  "cpfFlatFee": 150,
  "cpfRsCap": 1500,
  "ptpPriorityMaxHours": 1200,
  "priorityScore": 70,
  "minimumCompletionScore": 80,
  "lowCompletionScore": 60
}
```

### `documents.json`

```json
{
  "cpf": [
    "Solde CPF",
    "Certification RNCP/RS",
    "Devis de formation",
    "Programme de formation",
    "Accord candidat"
  ],
  "opco": [
    "SIRET employeur",
    "Code NAF employeur",
    "Effectif entreprise",
    "Accord employeur",
    "Devis de formation",
    "Programme de formation"
  ],
  "france_travail": [
    "Inscription France Travail",
    "Situation ARE",
    "PPAE ou validation conseiller",
    "Devis de formation",
    "Programme de formation"
  ],
  "faf": [
    "SIRET independant",
    "Code NAF independant",
    "Attestation contribution formation",
    "Devis de formation",
    "Programme de formation"
  ],
  "agefiph": [
    "Justificatif RQTH",
    "Projet detaille",
    "Devis de formation",
    "Justificatifs specifiques Agefiph"
  ]
}
```

### `aids.json`

```json
{
  "cpf": {
    "label": "CPF",
    "requires": ["formation_certifiante", "rncp_ou_rs"],
    "confidence": "moyenne",
    "warning": "Verifier l'inscription exacte de la certification."
  },
  "opco": {
    "label": "OPCO / PDC",
    "requires": ["statut_salarie", "siret_employeur", "naf_employeur"],
    "confidence": "moyenne"
  },
  "pro_a": {
    "label": "Pro-A",
    "requires": ["salarie_cdi", "infra_bac3", "formation_certifiante"],
    "confidence": "moyenne"
  },
  "aif": {
    "label": "France Travail - AIF",
    "requires": ["demandeur_emploi", "inscrit_france_travail"],
    "confidence": "moyenne"
  },
  "are_f": {
    "label": "ARE-F",
    "requires": ["demandeur_emploi", "allocation_are", "formation_plus_40h"],
    "confidence": "moyenne"
  },
  "faf": {
    "label": "FAF",
    "requires": ["independant", "naf_independant"],
    "confidence": "moyenne"
  },
  "agefiph": {
    "label": "Agefiph",
    "requires": ["rqth"],
    "confidence": "faible"
  }
}
```

## Interface de saisie guidee

### Page `GuidedIntake.tsx`

Objectif :

- devenir l'interface principale pour la secretaire ;
- reduire le formulaire complet a une conversation guidee ;
- afficher la projection en temps reel.

Sections :

1. Question en cours
2. Champ de reponse adapte au type
3. Boutons :
   - Je renseigne
   - Je ne sais pas
   - Non applicable
4. Projection en temps reel
5. Aides probables
6. Pieces manquantes
7. Historique des questions

### `GuidedIntakePanel.tsx`

Props cible :

```ts
type GuidedIntakePanelProps = {
  question: FollowUpQuestion | null;
  candidate: Candidate;
  onAnswer: (answer: GuidedAnswer) => void;
};
```

### `ProjectionLiveCard.tsx`

Affiche :

- score financement ;
- score completude ;
- score documentaire ;
- risque administratif ;
- aide principale ;
- pieces manquantes ;
- reste a charge estime ;
- confiance.

## Backend IA securise

Le backend est obligatoire pour proteger la cle API.

Fichiers cibles :

```text
server/index.js
server/package.json
server/.env
```

Variables d'environnement :

```env
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=...
PORT=3001
```

Ne jamais creer :

```env
VITE_ANTHROPIC_API_KEY=...
```

Tout ce qui commence par `VITE_` est expose au navigateur.

### Endpoint cible

```text
POST /api/analyze
```

Entree :

```json
{
  "candidate": {},
  "projection": {},
  "rules": {},
  "officialDocuments": []
}
```

Sortie stricte :

```json
{
  "summary": "Profil salarie CDI avec formation RS.",
  "confidence": "moyenne",
  "probable_aids": ["CPF", "OPCO", "Pro-A"],
  "next_questions": [
    {
      "question": "Quel est le code NAF de l'employeur ?",
      "field": "employerNaf",
      "priority": "haute",
      "reason": "Permet d'identifier l'OPCO.",
      "target": "secretaire"
    }
  ],
  "missing_documents": [
    {
      "name": "SIRET employeur",
      "required_for": "OPCO",
      "status": "manquant"
    }
  ],
  "risk_flags": ["Certification RS a verifier"],
  "projection_comment": "Dossier potentiellement financable sous reserve accord employeur."
}
```

## Service frontend IA

Fichier cible :

```text
src/lib/aiService.ts
```

Role :

- appeler le backend ;
- envoyer candidat + projection + regles ;
- parser la reponse JSON ;
- fournir un mode degrade si l'API est indisponible.

Variable frontend autorisee :

```env
VITE_API_URL=http://localhost:3001
```

## Mode degrade

Si le backend IA ne repond pas :

- la saisie guidee continue avec `questionEngine.ts` ;
- les checklists restent generees par `checklistEngine.ts` ;
- la note interne reste generee par `noteEngine.ts` ;
- l'utilisateur voit un message discret :

```text
Assistant IA indisponible. Mode local active.
```

## Documents officiels

La page `/documents` existe deja comme point d'entree.

Evolution cible :

- lister les sources officielles chargees ;
- permettre l'import PDF ;
- stocker les documents en Phase Supabase ;
- demander a l'IA d'extraire :
  - conditions ;
  - pieces requises ;
  - exclusions ;
  - cumuls ;
  - sources ;
  - niveau de confiance.

Regle stricte :

Si l'IA ne trouve pas de source suffisante, elle doit renvoyer :

```json
{
  "confidence": "faible",
  "projection_comment": "Information insuffisante - a confirmer."
}
```

## Securite et prudence

- Aucune cle API dans le frontend.
- Aucune promesse ferme de financement.
- Mention legale affichee sur chaque projection.
- RQTH traitee comme donnee sensible.
- Les documents candidats ne doivent pas etre pousses sur GitHub.
- Les fichiers `.env` doivent rester ignores par Git.
- Les reponses IA doivent etre structurees et parsees, pas affichees comme verite brute.

## Mention legale

Texte a afficher sur chaque ecran de projection :

```text
Projection indicative. Ne constitue pas une decision officielle de financement.
A verifier aupres des organismes concernes.
```

## Ordre d'implementation recommande

### Etape 1 - Saisie guidee locale

- Creer `questionEngine.ts`.
- Enrichir `FollowUpQuestion` avec `field`, `answerType`, `options`.
- Creer `GuidedIntake.tsx`.
- Creer `GuidedIntakePanel.tsx`.
- Creer `ProjectionLiveCard.tsx`.
- Ajouter routes `/saisie-guidee` et `/saisie-guidee/:id`.

### Etape 2 - JSON de regles

- Creer `thresholds.json`.
- Creer `documents.json`.
- Creer `aids.json`.
- Creer `trainings.json`.
- Creer `opco-naf.json`.
- Brancher progressivement les moteurs locaux sur ces JSON.

### Etape 3 - Backend IA

- Creer `server/index.js`.
- Ajouter Express.
- Ajouter SDK Anthropic.
- Ajouter `POST /api/analyze`.
- Ajouter validation JSON stricte.
- Ajouter mode erreur propre.

### Etape 4 - Connexion frontend IA

- Creer `aiService.ts`.
- Ajouter appel depuis la page de saisie guidee.
- Fusionner les suggestions IA avec les questions locales.
- Garder le moteur local comme source de secours.

### Etape 5 - Documents officiels

- Enrichir `/documents`.
- Ajouter upload PDF.
- Ajouter analyse documentaire.
- Stocker sources et extraits.
- Utiliser les sources dans les reponses IA.

### Etape 6 - Persistance et deploiement

- Ajouter Supabase PostgreSQL.
- Ajouter Auth.
- Ajouter RLS.
- Ajouter Supabase Storage pour documents.
- Deployer frontend sur Vercel ou Netlify.
- Garder backend IA securise.

## Profils de test

| Profil | Attendu |
|---|---|
| Salarie CDI, infra Bac+3, entreprise < 50, formation RS | CPF + OPCO + Pro-A |
| Demandeur d'emploi inscrit FT, ARE, formation > 40h | AIF + ARE-F |
| Artisan TNS avec code NAF | FAFCEA |
| RQTH + creation entreprise | Agefiph 6 000 EUR a verifier |
| Formation DELF/DALF | Alerte CPF exclu |
| Formation non certifiante | Score penalise |
| Salarie sans SIRET/NAF | Questions SIRET/NAF en priorite haute |

## Definition du succes

La secretaire doit pouvoir :

1. creer un dossier avec peu d'informations ;
2. suivre les questions proposees ;
3. comprendre pourquoi chaque question est posee ;
4. voir la projection evoluer en temps reel ;
5. connaitre les pieces manquantes ;
6. obtenir une note interne exploitable ;
7. savoir si le dossier est prioritaire, partiel, limite ou a completer.

Le conseiller doit pouvoir :

1. lire une fiche claire ;
2. voir les aides probables ;
3. voir le risque administratif ;
4. imprimer ou exporter la synthese ;
5. prioriser les dossiers les plus financables.
