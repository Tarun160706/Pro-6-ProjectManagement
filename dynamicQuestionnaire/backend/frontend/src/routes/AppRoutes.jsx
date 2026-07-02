import { Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "../pages/AdminDashboard";
import QuestionnaireBuilder from "../pages/QuestionnaireBuilder";
import TakeQuestionnaire from "../pages/TakeQuestionnaire";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/questionnaire/:questionnaireId" element={<QuestionnaireBuilder />} />
      <Route path="/take/:questionnaireId" element={<TakeQuestionnaire />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
