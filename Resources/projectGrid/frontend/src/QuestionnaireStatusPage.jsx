import React, { useState, useEffect } from "react";
import {
  fetchQuestionnaireStatusAll,
  getAllQuestionnaires,
  QUESTIONNAIRE_URL,
} from "./questionnaireApi";

export default function QuestionnaireStatusPage({ rows, onBack }) {
  const [statusMap, setStatusMap] = useState({});
  const [questionnaireMap, setQuestionnaireMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      setLoading(true);
      const [status, questionnaires] = await Promise.all([
        fetchQuestionnaireStatusAll(),
        getAllQuestionnaires(),
      ]);
      setStatusMap(status || {});

      // Build map of project name → questionnaire ID
      const qMap = {};
      for (const q of questionnaires) {
        const title = q.title || "";
        qMap[title.toLowerCase()] = q._id || q.id;
      }
      setQuestionnaireMap(qMap);
      setLoading(false);
    }
    loadStatus();
  }, []);

  const getStatusForProject = (row) => {
    // First try stored questionnaireId
    const storedQId = row.questionnaireId;
    if (storedQId && statusMap[storedQId]) {
      return statusMap[storedQId];
    }
    // Fall back to name-based lookup
    const name = row.projectName?.trim();
    if (name) {
      const qId = questionnaireMap[name.toLowerCase()];
      if (qId && statusMap[qId]) {
        return statusMap[qId];
      }
    }
    return { isAnswered: false, submissionCount: 0 };
  };

  const getQuestionnaireId = (row) => {
    // First try stored questionnaireId
    if (row.questionnaireId) return row.questionnaireId;
    // Fall back to name-based lookup
    const name = row.projectName?.trim();
    if (name) {
      return questionnaireMap[name.toLowerCase()] || null;
    }
    return null;
  };

  const questionnaireRows = rows.filter(
    (row) => row.projectName && row.projectName.trim()
  );

  return (
    <div className="rg-page">
      <header className="rg-header">
        <div className="rg-header-inner">
          <div className="rg-title-block">
            <span className="rg-eyebrow">QUESTIONNAIRE STATUS</span>
            <h1 className="rg-title">Answer Status</h1>
            <p className="rg-subtitle">
              Track which project questionnaires have been answered
            </p>
          </div>
          <div className="rg-header-actions">
            <button className="rg-btn rg-btn-primary" onClick={onBack}>
              ← Back to Project Grid
            </button>
          </div>
        </div>
      </header>

      <main className="rg-main">
        {loading ? (
          <div className="rg-loading">
            <div className="rg-spinner" />
            <span>Loading status…</span>
          </div>
        ) : (
          <div className="rg-table-wrap">
            <table className="rg-table">
              <thead>
                <tr>
                  <th className="rg-th rg-th-project">
                    Project / Questionnaire
                  </th>
                  <th className="rg-th">Versions</th>
                  <th className="rg-th">Answer Status</th>
                  <th className="rg-th rg-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questionnaireRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="rg-empty">
                      <div className="rg-empty-inner">
                        <span className="rg-empty-icon" />
                        <p>
                          No projects found. Create a project first.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  questionnaireRows.map((row) => {
                    const status = getStatusForProject(row);
                    const qId = getQuestionnaireId(row);
                    const versionCount = (row.versions || []).length;
                    const hasAnswers = status.isAnswered || false;
                    const submissionCount = status.submissionCount || 0;

                    return (
                      <tr key={row._id} className="rg-row">
                        <td className="rg-td rg-td-project">
                          <strong>{row.projectName}</strong>
                        </td>
                        <td className="rg-td">
                          <span className="rg-version-count">
                            {versionCount} version
                            {versionCount !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="rg-td">
                          <div className="rg-status-badge-container">
                            <span
                              className={`rg-status-badge ${
                                hasAnswers
                                  ? "rg-status-answered"
                                  : "rg-status-pending"
                              }`}
                            >
                              {hasAnswers
                                ? `✓ Answered (${submissionCount})`
                                : "○ Not Answered"}
                            </span>
                          </div>
                        </td>
                        <td className="rg-td rg-td-actions">
                          <div className="rg-actions">
                            {qId && (
                              <>
                                {hasAnswers && (
                                  <button
                                    className="rg-btn rg-btn-sm"
                                    onClick={() =>
                                      window.open(
                                        `${QUESTIONNAIRE_URL}/take/${qId}`,
                                        "_blank"
                                      )
                                    }
                                  >
                                    View Answers
                                  </button>
                                )}
                                <button
                                  className="rg-btn rg-btn-sm"
                                  onClick={() =>
                                    window.open(
                                      `${QUESTIONNAIRE_URL}/questionnaire/${qId}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  Builder
                                </button>
                              </>
                            )}
                            {!qId && (
                              <span className="rg-version-empty">
                                No questionnaire linked
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
