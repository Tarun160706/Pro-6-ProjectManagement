import { useState } from "react";

const CHOICE_TYPES = ["SINGLE_CHOISE", "MULTIPLE_CHOISE"];

export default function OptionList({ question, onAddOption, onDeleteOption }) {
  const [showForm, setShowForm] = useState(false);
  const [optionText, setOptionText] = useState("");
  const [displayOrder, setDisplayOrder] = useState((question.options?.length || 0) + 1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!CHOICE_TYPES.includes(question.questionType)) return null;

  const options = [...(question.options || [])].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!optionText.trim()) { setError("Option text is required"); return; }
    try {
      setSaving(true);
      setError("");
      await onAddOption(question._id, { optionText: optionText.trim(), displayOrder: Number(displayOrder) });
      setOptionText("");
      setDisplayOrder(Number(displayOrder) + 1);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to add option");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="option-list">
      {options.length > 0 ? (
        options.map((option, index) => (
          <div key={option._id} className="option-row">
            <span className="option-order">{index + 1}.</span>
            <span style={{ flex: 1 }}>{option.optionText}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onDeleteOption(option._id)}>
              Delete
            </button>
          </div>
        ))
      ) : (
        <p className="text-muted text-sm">No options available</p>
      )}

      {showForm ? (
        <form className="rule-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="field">
            <label>Option Text</label>
            <input className="input" type="text" value={optionText} placeholder="Option text"
              onChange={(e) => setOptionText(e.target.value)} />
          </div>
          <div className="field">
            <label>Display Order</label>
            <input className="input" type="number" value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)} />
          </div>
          <div className="flex gap-8">
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? <span className="spinner" /> : "Add Option"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(true)}>
          + Add Option
        </button>
      )}
    </div>
  );
}
