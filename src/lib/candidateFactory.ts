import type { Candidate } from "../types/candidate";

export function createEmptyCandidate(): Candidate {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    postalCode: "",
    nationality: "",
    status: "demandeur_emploi",
    registeredFranceTravail: false,
    receivesAre: false,
    hasRqth: false,
    diplomaLevel: "bac",
    trainingType: "fle",
    trainingName: "",
    projectGoal: "emploi",
    trainingHours: 40,
    trainingCostHt: 1200,
    isCertified: true,
    registryType: "rs",
    cpfBalance: 0,
    cpfAlreadyUsed: false,
    acceptsInstallments: true,
    dossierStatus: "nouveau",
  };
}
