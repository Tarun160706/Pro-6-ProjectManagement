import React, { useState } from "react";

export default function VersionModal({ open, projectName, onConfirm, onCancel }) {
  const [versionName, setVersionName] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = versionName.trim();
    if (!trimmed) {
      setError("Please enter a version name/number.");
      return;
    }
    setError("");
    onConfirm(trimmed);
    setVersionName("");
  };

  const handleCancel = () => {
    setVersionName("");
    setError("");
    onCancel();
  };

  return (
    <div className="rg-modal-overlay" onClick={handleCancel}>
      <div className="rg-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="rg-modal-header">
          <h2 className="rg-modal-title">Add Version</h2>
          <p className="rg-modal-subtitle">
            {projectName ? `Project: ${projectName}` : ""}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="rg-modal-error">{error}</div>}
          <div className="rg-modal-field">
            <label htmlFor="version-name-input">Version Name / Number</label>
            <input
              id="version-name-input"
              className="rg-input"
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="e.g. v1.0, 2.0, Sprint-1"
              autoFocus
            />
          </div>
          <div className="rg-modal-actions">
            <button type="button" className="rg-btn rg-btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="rg-btn rg-btn-primary">
              Add Version & Open Builder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
