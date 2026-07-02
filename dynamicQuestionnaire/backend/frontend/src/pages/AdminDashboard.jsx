import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import QuestionnaireCard from "../components/QuestionnaireCard";
import ConfirmDialog from "../components/ConfirmDialog";
import { questionnaireApi } from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [publishingId, setPublishingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  async function fetchQuestionnaires() {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await questionnaireApi.list();
      setQuestionnaires(data);
    } catch (err) {
      setLoadError(
        err.response?.data?.detail || "Couldn't load questionnaires. Is the API running?"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError("Give the questionnaire a title.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const { data } = await questionnaireApi.create({
        title: newTitle.trim(),
        description: newDescription.trim(),
      });
      setQuestionnaires((prev) => [data, ...prev]);
      setShowCreate(false);
      setNewTitle("");
      setNewDescription("");
    } catch (err) {
      setCreateError(err.response?.data?.detail || "Couldn't create the questionnaire.");
    } finally {
      setCreating(false);
    }
  }

  async function handlePublish(questionnaire) {
    setPublishingId(questionnaire._id);
    try {
      const { data } = await questionnaireApi.publish(questionnaire._id);
      setQuestionnaires((prev) =>
        prev.map((q) => (q._id === questionnaire._id ? { ...q, ...data, status: "PUBLISHED" } : q))
      );
    } catch (err) {
      setLoadError(err.response?.data?.detail || "Couldn't publish that questionnaire.");
    } finally {
      setPublishingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await questionnaireApi.remove(pendingDelete._id);
      setQuestionnaires((prev) => prev.filter((q) => q._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (err) {
      setLoadError(err.response?.data?.detail || "Couldn't delete that questionnaire.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppLayout
      title="Questionnaires"
      subtitle="Build, manage, and publish your surveys"
      navActions={
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Questionnaire
        </button>
      }
    >
      {loadError && <div className="alert alert-error">{loadError}</div>}

      {showCreate && (
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14 }}>New questionnaire</h3>
          <form onSubmit={handleCreate}>
            {createError && <div className="alert alert-error">{createError}</div>}
            <div className="field">
              <label htmlFor="new-title">Title</label>
              <input
                id="new-title"
                className="input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Student Survey"
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="new-desc">Description (optional)</label>
              <textarea
                id="new-desc"
                className="textarea"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What is this questionnaire for?"
              />
            </div>
            <div className="flex gap-8">
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <span className="spinner" /> : "Create Questionnaire"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowCreate(false);
                  setCreateError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-page">
          <span className="spinner spinner-lg" /> Loading questionnaires…
        </div>
      ) : questionnaires.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">＋</div>
          <h3>No questionnaires yet</h3>
          <p>Create your first questionnaire to start building branching surveys.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
            + New Questionnaire
          </button>
        </div>
      ) : (
        <div className="questionnaire-grid">
          {questionnaires.map((q) => (
            <QuestionnaireCard
              key={q._id}
              questionnaire={q}
              variant="admin"
              publishing={publishingId === q._id}
              onOpen={(qn) => navigate(`/questionnaire/${qn._id}`)}
              onPublish={handlePublish}
              onDelete={(qn) => setPendingDelete(qn)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete questionnaire?"
        message={`"${pendingDelete?.title}" and all of its questions, options, and rules will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />
    </AppLayout>
  );
}
