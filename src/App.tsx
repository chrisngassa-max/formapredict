import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { CandidateDetail } from "./pages/CandidateDetail";
import { CandidateEdit } from "./pages/CandidateEdit";
import { CandidateNew } from "./pages/CandidateNew";
import { Dashboard } from "./pages/Dashboard";
import { Documents } from "./pages/Documents";
import { GuidedIntake } from "./pages/GuidedIntake";
import { Settings } from "./pages/Settings";
import { Trainings } from "./pages/Trainings";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/saisie-guidee" element={<GuidedIntake />} />
        <Route path="/saisie-guidee/:id" element={<GuidedIntake />} />
        <Route path="/candidats/nouveau" element={<CandidateNew />} />
        <Route path="/candidats/:id" element={<CandidateDetail />} />
        <Route path="/candidats/:id/edit" element={<CandidateEdit />} />
        <Route path="/formations" element={<Trainings />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/parametres" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
