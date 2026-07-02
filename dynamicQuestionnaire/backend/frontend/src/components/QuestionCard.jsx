import { useState } from "react";
import OptionList from "./OptionList";
import RuleList from "./RuleList";

const TYPE_LABELS = {
  SINGLE_CHOISE: "Single choice",
  TEXT: "Text",
  NUMBER: "Number",
  COMPLEXITY: "Complexity (Auto-Hours)",
};

export default function QuestionCard({
  question, allQuestions, onEdit, onDelete,
  onAddOption, onDeleteOption, onAddRule, onDeleteRule,
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(question.questionText);
  const [type, setType] = useState(question.questionType);
  const [isStart, setIsStart] = useState(question.isStartQuestion || question.isStarQuestion);
  const [platform, setPlatform] = useState(question.platform || "");
  const [moduleVal, setModuleVal] = useState(question.module || "");
  const [subModule, setSubModule] = useState(question.subModule || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isChoiceType = question.questionType === "SINGLE_CHOISE";

  async function handleSave(e) {
    e.preventDefault();
    if (!text.trim() || !platform.trim() || !moduleVal.trim() || !subModule.trim()) {
      setError("Question text, Platform, Module, and Sub Module are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onEdit(question._id || question.id, {
        questionText: text.trim(),
        questionType: type,
        isStartQuestion: isStart,
        platform: platform.trim(),
        module: moduleVal.trim(),
        subModule: subModule.trim(),
      });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setEditing(false);
    setText(question.questionText);
    setType(question.questionType);
    setIsStart(question.isStartQuestion || question.isStarQuestion);
    setPlatform(question.platform || "");
    setModuleVal(question.module || "");
    setSubModule(question.subModule || "");
    setError("");
  }

  return (
    <div className={`card question-card ${isStart ? "is-start" : ""}`}>
      {editing ? (
        <form onSubmit={handleSave}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field-row">
            <div className="field">
              <label>Platform</label>
              <input className="input" value={platform} onChange={(e) => setPlatform(e.target.value)} />
            </div>
            <div className="field">
              <label>Module</label>
              <input className="input" value={moduleVal} onChange={(e) => setModuleVal(e.target.value)} />
            </div>
            <div className="field">
              <label>Sub Module</label>
              <input className="input" value={subModule} onChange={(e) => setSubModule(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Question text</label>
            <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Question type</label>
              <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="SINGLE_CHOISE">SINGLE_CHOISE</option>
                <option value="TEXT">TEXT</option>
                <option value="NUMBER">NUMBER</option>
                <option value="COMPLEXITY">COMPLEXITY</option>
              </select>
            </div>
            <div className="field" style={{ justifyContent: "center" }}>
              <div className="checkbox-row" style={{ marginTop: "16px" }}>
                <input id={`edit-start-${question._id}`} type="checkbox" checked={isStart}
                  onChange={(e) => setIsStart(e.target.checked)} />
                <label htmlFor={`edit-start-${question._id}`}>Start question</label>
              </div>
            </div>
          </div>

          <div className="flex gap-8" style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? <span className="spinner" /> : "Save"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="question-card-head">
            <div className="question-card-text">{question.questionText}</div>
          </div>

          {(question.platform || question.module) && (
            <div className="context-badge">
              <strong>Context:</strong> {question.platform}
              {question.module && <> &gt; {question.module}</>}
              {question.subModule && <> &gt; {question.subModule}</>}
            </div>
          )}

          <div className="question-card-tags">
            <span className="badge badge-type">{TYPE_LABELS[question.questionType] || question.questionType}</span>
            {(question.isStartQuestion || question.isStarQuestion) && (
              <span className="badge badge-start">Start Question</span>
            )}
          </div>

          {question.questionType === "TEXT" && (
            <div className="type-info">User enters text directly. No options required.</div>
          )}
          {question.questionType === "NUMBER" && (
            <div className="type-info">User enters a number directly. No options required.</div>
          )}
          {question.questionType === "COMPLEXITY" && (
            <div className="type-info">User selects High, Medium, or Low. Hours are automatically allocated.</div>
          )}

          {isChoiceType && (
            <div className="mt-2">
              <div className="section-title">Options</div>
              <OptionList question={question} onAddOption={onAddOption} onDeleteOption={onDeleteOption} />
            </div>
          )}

          <div className="mt-2">
            <div className="section-title">Rules</div>
            <RuleList question={question} allQuestions={allQuestions}
              onAddRule={onAddRule} onDeleteRule={onDeleteRule} />
          </div>

          <div className="question-card-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(question)}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}
