import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import QuestionnaireCard from "../components/QuestionnaireCard";
import { questionnaireApi } from "../services/api";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    questionnaireApi
      .listPublished()
      .then(({ data }) => setQuestionnaires(data))
      .catch((err) =>
        setError(err.response?.data?.detail || "Couldn't load available questionnaires.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="Available Questionnaires" subtitle="Pick a survey to start">
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-page">
          <span className="spinner spinner-lg" /> Loading questionnaires…
        </div>
      ) : questionnaires.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Nothing to answer yet</h3>
          <p>Once an admin publishes a questionnaire, it will show up here.</p>
        </div>
      ) : (
        <div className="questionnaire-grid">
          {questionnaires.map((q) => (
            <QuestionnaireCard
              key={q._id}
              questionnaire={q}
              variant="user"
              onStart={(qn) => navigate(`/take/${qn._id}`)}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
