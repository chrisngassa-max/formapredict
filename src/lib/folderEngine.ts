import type { Candidate, DocumentChecklist, FolderNode } from "../types/candidate";

function file(name: string, status: FolderNode["status"]): FolderNode {
  return { name, type: "file", status };
}

function folder(name: string, children: FolderNode[]): FolderNode {
  const hasMissing = children.some((child) => child.status === "manquant");
  const hasCheck = children.some((child) => child.status === "a_verifier");
  return {
    name,
    type: "folder",
    status: hasMissing ? "manquant" : hasCheck ? "a_verifier" : "present",
    children,
  };
}

function statusFromChecklist(checklist: DocumentChecklist[], document: string): FolderNode["status"] {
  const match = checklist.find((item) => item.document.toLowerCase().includes(document.toLowerCase()));
  if (!match) return "a_verifier";
  if (match.status === "present") return "present";
  if (match.status === "manquant") return "manquant";
  return "a_verifier";
}

export function generateFolderTree(candidate: Candidate, checklist: DocumentChecklist[]): FolderNode[] {
  const isEmployee = candidate.status === "salarie_cdi" || candidate.status === "salarie_cdd";
  const isTns = candidate.status === "tns" || candidate.status === "auto_entrepreneur";

  return [
    folder(`Dossier_${candidate.firstName || "Candidat"}_${candidate.lastName || ""}`.trim(), [
      folder("01_Identite", [
        file("piece_identite", "a_verifier"),
        file("coordonnees", candidate.firstName && candidate.lastName && candidate.email && candidate.phone ? "present" : "manquant"),
      ]),
      folder("02_Situation_professionnelle", [
        file("statut_professionnel", candidate.status ? "present" : "manquant"),
        file("niveau_diplome", candidate.diplomaLevel ? "present" : "manquant"),
        ...(isEmployee
          ? [
              file("employeur_siret", candidate.employerSiret ? "present" : "manquant"),
              file("employeur_code_naf", candidate.employerNaf ? "present" : "manquant"),
              file("accord_employeur", statusFromChecklist(checklist, "Accord employeur")),
            ]
          : []),
        ...(isTns
          ? [
              file("independant_siret", candidate.tnsSiret ? "present" : "manquant"),
              file("independant_code_naf", candidate.tnsNaf ? "present" : "manquant"),
            ]
          : []),
      ]),
      folder("03_Formation", [
        file("devis", statusFromChecklist(checklist, "Devis")),
        file("programme", statusFromChecklist(checklist, "Programme")),
        file("certification_rncp_rs", candidate.isCertified && candidate.registryType !== "non_certifiante" ? "present" : "manquant"),
        file("calendrier", "a_verifier"),
      ]),
      folder("04_Financement", [
        file("cpf", statusFromChecklist(checklist, "Solde CPF")),
        file("opco_ou_faf", checklist.some((item) => ["opco", "faf"].includes(item.aidId)) ? "a_verifier" : "optionnel"),
        file("france_travail", checklist.some((item) => ["aif", "are-f"].includes(item.aidId)) ? "a_verifier" : "optionnel"),
        file("agefiph", checklist.some((item) => item.aidId === "agefiph") ? "a_verifier" : "optionnel"),
      ]),
      folder("05_Pieces_manquantes", checklist.filter((item) => item.status !== "present").map((item) => file(item.document, item.status === "manquant" ? "manquant" : "a_verifier"))),
      folder("06_Synthese_conseiller", [file("note_interne", "present"), file("projection_financiere", "present")]),
    ]),
  ];
}
