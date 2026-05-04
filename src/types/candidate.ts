export type CandidateStatus =
  | "salarie_cdi"
  | "salarie_cdd"
  | "demandeur_emploi"
  | "tns"
  | "auto_entrepreneur"
  | "etudiant"
  | "sans_activite"
  | "autre";

export type DiplomaLevel = "infra_bac" | "bac" | "bac2" | "bac3_plus";
export type RegistryType = "rncp" | "rs" | "non_certifiante" | "inconnu";
export type TrainingType =
  | "fle"
  | "tcf_irn"
  | "tcf_tp"
  | "anglais_pro"
  | "cloe"
  | "lilate"
  | "bilan_vae"
  | "autre";
export type ProjectGoal =
  | "emploi"
  | "evolution"
  | "reconversion"
  | "mobilite"
  | "naturalisation"
  | "autorisation_travail"
  | "creation_entreprise"
  | "autre";

export type Candidate = {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  city?: string;
  postalCode?: string;
  nationality?: string;
  status: CandidateStatus;
  contractType?: string;
  registeredFranceTravail: boolean;
  receivesAre: boolean;
  unemploymentMonths?: number;
  hasRqth: boolean;
  diplomaLevel: DiplomaLevel;
  employerName?: string;
  employerSiret?: string;
  employerNaf?: string;
  employerSize?: number;
  employerEmail?: string;
  employerPhone?: string;
  knownOpco?: string;
  employerCofundingPossible?: boolean;
  tnsSiret?: string;
  tnsNaf?: string;
  tnsActivityType?: "liberal" | "artisan" | "commercant" | "service" | "autre";
  knownFaf?: string;
  trainingType: TrainingType;
  trainingName: string;
  projectGoal: ProjectGoal;
  trainingHours: number;
  trainingCostHt: number;
  trainingCostTtc?: number;
  isCertified: boolean;
  registryType: RegistryType;
  certificationName?: string;
  cpfBalance: number;
  cpfAlreadyUsed: boolean;
  personalBudget?: number;
  acceptsInstallments?: boolean;
  internalComment?: string;
  dossierStatus:
    | "nouveau"
    | "a_completer"
    | "prioritaire"
    | "cofinancement_a_verifier"
    | "paiement_a_proposer"
    | "transmis"
    | "abandonne";
};

export type AidProjection = {
  id: string;
  name: string;
  status: "probable" | "a_verifier" | "exclu" | "non_applicable";
  estimatedAmount?: number;
  confidence: "forte" | "moyenne" | "faible";
  reason: string;
  requiredChecks: string[];
};

export type DocumentChecklist = {
  aidId: string;
  aidName: string;
  document: string;
  required: boolean;
  status: "present" | "manquant" | "a_verifier";
  comment?: string;
};

export type FolderNode = {
  name: string;
  type: "folder" | "file";
  status: "present" | "manquant" | "optionnel" | "a_verifier";
  children?: FolderNode[];
};

export type FollowUpQuestion = {
  id: string;
  target: "candidat" | "employeur" | "conseiller" | "financeur";
  question: string;
  reason: string;
  priority: "haute" | "moyenne" | "basse";
  relatedAidId?: string;
};

export type EvidenceSource = {
  documentName: string;
  page?: number;
  excerpt?: string;
  confidence: "forte" | "moyenne" | "faible";
};

export type ProjectionResult = {
  financingScore: number;
  completionScore: number;
  documentScore: number;
  adminRiskScore: number;
  priority: "prioritaire" | "financement_partiel" | "aide_limitee" | "a_completer";
  estimatedRemainingCost: number;
  financialBreakdown: {
    trainingCost: number;
    cpfEstimated: number;
    aidEstimated: number;
    employerEstimated: number;
    personalBudget: number;
    estimatedRemainingCost: number;
    confidence: "forte" | "moyenne" | "faible";
  };
  aids: AidProjection[];
  missingDocuments: DocumentChecklist[];
  folderTree: FolderNode[];
  followUpQuestions: FollowUpQuestion[];
  internalNote: string;
  warnings: string[];
  missingFields: string[];
  compatibilityNotes: string[];
  recommendedActions: string[];
};
