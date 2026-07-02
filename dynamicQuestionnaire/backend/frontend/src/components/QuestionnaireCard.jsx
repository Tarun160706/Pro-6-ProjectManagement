/**
 * Card used on the Admin Dashboard (with management actions) and,
 * in read-only "Start" mode, on the User Dashboard.
 */
export default function QuestionnaireCard({
  questionnaire,
  variant = "admin", // "admin" | "user"
  onOpen,
  onPublish,
  onDelete,
  onStart,
  publishing,
}) {
  const isPublished = questionnaire.status === "PUBLISHED";

  return (
    <div className="card q-card">
      <div className="q-card-top">
        <div>
          <div className="q-card-title">{questionnaire.title}</div>
          
        </div>
        <span className={`badge ${isPublished ? "badge-published" : "badge-draft"}`}>
          {questionnaire.status}
        </span>
      </div>

      {questionnaire.description && (
        <p className="text-muted" style={{ fontSize: 13.5 }}>
          {questionnaire.description}
        </p>
      )}

      <div className="q-card-actions">
        {variant === "admin" ? (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => onOpen(questionnaire)}>
              Open
            </button>
            {!isPublished && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onPublish(questionnaire)}
                disabled={publishing}
              >
                {publishing ? <span className="spinner" /> : "Publish"}
              </button>
            )}
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(questionnaire)}>
              Delete
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => onStart(questionnaire)}>
            Start
          </button>
        )}
      </div>
    </div>
  );
}
