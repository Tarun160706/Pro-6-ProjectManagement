import { useState } from "react";

export default function RuleList({ question, allQuestions, onAddRule, onDeleteRule }) {
  const [showForm, setShowForm] = useState(false);
  const [optionId, setOptionId] = useState("");
  const [nextQuestionId, setNextQuestionId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const rules = question.rules || [];
  const isTextOrNumber = question.questionType === "TEXT" || question.questionType === "NUMBER";
  const isComplexity = question.questionType === "COMPLEXITY";

  const rawOptions = isComplexity
    ? [{ _id: "High", optionText: "High" }, { _id: "Medium", optionText: "Medium" }, { _id: "Low", optionText: "Low" }]
    : (question.options || []);

  const usedOptionIds = rules.map(r => r.optionId);
  const availableOptions = rawOptions.filter(opt => !usedOptionIds.includes(opt._id || opt.id));

  const currentIndex = allQuestions.findIndex(q => (q._id || q.id) === (question._id || question.id));
  const safeIndex = currentIndex !== -1 ? currentIndex : 0;
  const usedDestinationIds = rules.map(r => r.nextQuestionId);
  const availableTargetQuestions = allQuestions.slice(safeIndex + 1).filter(q => !usedDestinationIds.includes(q._id || q.id));

  const canAddMoreRules = isTextOrNumber ? rules.length === 0 : availableOptions.length > 0;

  const getQuestionLabel = (id) => {
    if (id === "SUBMIT") return "🛑 End Assessment & Submit";
    const q = allQuestions.find((q) => (q._id || q.id) === id);
    return q ? q.questionText : "Unknown Question";
  };
  const getOptionLabel = (id) => {
    if (id === "ANY") return "Any Answer";
    const opt = rawOptions.find((o) => (o._id || o.id) === id);
    return opt ? opt.optionText : "Unknown Option";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalOptionId = isTextOrNumber ? "ANY" : optionId;
    if (!finalOptionId || !nextQuestionId) { setError("Select option and next question/action"); return; }
    try {
      setSaving(true);
      setError("");
      await onAddRule({ questionId: question._id || question.id, optionId: finalOptionId, nextQuestionId });
      setOptionId("");
      setNextQuestionId("");
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create rule");
    } finally { setSaving(false); }
  };

  if (!isTextOrNumber && !isComplexity && rawOptions.length === 0) {
    return <p className="text-muted text-sm mt-2">Create options before adding rules.</p>;
  }

  return (
    <div>
      {rules.length > 0 ? (
        <div className="rule-list">
          {rules.map((rule) => (
            <div key={rule._id || rule.id} className="rule-row">
              <span className="rule-chip rule-chip-option">{getOptionLabel(rule.optionId)}</span>
              <span className="rule-arrow">→</span>
              <span className="rule-chip rule-chip-target">{getQuestionLabel(rule.nextQuestionId)}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => onDeleteRule(rule._id || rule.id)}>Delete</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-sm mb-2">No rules created</p>
      )}

      {showForm ? (
        <form className="rule-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="field">
            {isTextOrNumber ? (
              <div className="context-inline"><strong>Condition:</strong> Any Answer</div>
            ) : (
              <>
                <label>Condition Option</label>
                <select className="select" value={optionId} onChange={(e) => setOptionId(e.target.value)}>
                  <option value="">Select Condition Option</option>
                  {availableOptions.map((opt) => (
                    <option key={opt._id || opt.id} value={opt._id || opt.id}>{opt.optionText}</option>
                  ))}
                </select>
              </>
            )}
          </div>
          <div className="field">
            <label>Destination</label>
            <select className="select" value={nextQuestionId} onChange={(e) => setNextQuestionId(e.target.value)}>
              <option value="">Select Destination</option>
              {!usedDestinationIds.includes("SUBMIT") && <option value="SUBMIT">🛑 End Assessment & Submit</option>}
              {availableTargetQuestions.map((q) => (
                <option key={q._id || q.id} value={q._id || q.id}>Question: {q.questionText}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-8">
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? <span className="spinner" /> : "Create Rule"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        canAddMoreRules ? (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(true)}>+ Add Rule</button>
        ) : (
          <p className="text-muted text-sm" style={{ fontStyle: "italic" }}>All conditions have been mapped.</p>
        )
      )}
    </div>
  );
}
