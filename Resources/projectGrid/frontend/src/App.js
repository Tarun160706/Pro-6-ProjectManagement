import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchProjects,
  createProject,
  insertProject,
  updateCell,
  deleteProject,
  addVersion,
  deleteVersion,
  updateVersion,
  copyVersion,
} from "./api";
import {
  createQuestionnaire,
  QUESTIONNAIRE_URL,
  fetchQuestionnaireStatusAll,
} from "./questionnaireApi";
import { exportToWord, exportToExcel, exportToPDF } from "./exportService";
import VersionModal from "./VersionModal";
import QuestionnaireStatusPage from "./QuestionnaireStatusPage";
import "./App.css";

const getInitialTheme = () => {
  try { return localStorage.getItem("rg-theme") || "dark"; } catch { return "dark"; }
};

const GRID_LINKS = [
  { name: "Technical Stack", url: "http://localhost:5173", desc: "Manage technical stack items", icon: "TS" },
  { name: "Queries & Responses", url: "http://localhost:5174", desc: "Manage queries and responses", icon: "Q&R" },
  { name: "Resource Grid", url: "http://localhost:3001", desc: "Manage resource allocation", icon: "RG" },
  { name: "Assumptions", url: "http://localhost:5175", desc: "Manage project assumptions", icon: "AG" },
  { name: "Dependencies", url: "http://localhost:3002", desc: "Manage project dependencies", icon: "DG" },
  { name: "Features Grid", url: "http://localhost:3003", desc: "Manage project features", icon: "FG" },
  { name: "Streams Grid", url: "http://localhost:3004", desc: "Manage stream allocation", icon: "SG" },
  { name: "Out of Scope", url: "http://localhost:3005", desc: "Manage out of scope items", icon: "OS" },
  { name: "Milestones", url: "http://localhost:3006", desc: "Manage project milestones", icon: "MS" },
];

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const projectName = params.get("projectName") || null;
  const version = params.get("version") || null;
  const [theme, setTheme] = useState(getInitialTheme);
  const [view, setView] = useState("grid"); // "grid" | "status"

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("rg-theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [newVersionNames, setNewVersionNames] = useState({});
  const [editingVersion, setEditingVersion] = useState(null);
  const [exportMenuPosition, setExportMenuPosition] = useState(null);
  const [versionModal, setVersionModal] = useState(null); // { projectId, projectName }
  const [statusMap, setStatusMap] = useState({});
  const menuRef = useRef(null);
  const exportMenuRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchProjects();
      setRows(data);
      // Also load answer status
      const status = await fetchQuestionnaireStatusAll();
      setStatusMap(status || {});
    } catch {
      setError("Failed to load data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setContextMenu(null);
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) setExportMenuPosition(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  // ── Project CRUD ──────────────────────────────────────────────

  const handleAddRow = async () => {
    try {
      const { data } = await createProject({ projectName: "", columns: {} });
      setRows((prev) => [...prev, data]);
      showToast("Project added");
    } catch {
      showToast("Failed to add project", "error");
    }
  };

  const handleInsertAfter = async (afterIndex) => {
    setContextMenu(null);
    try {
      await insertProject({ afterIndex, projectName: "", columns: {} });
      const { data } = await fetchProjects();
      setRows(data);
      showToast("Row inserted");
    } catch {
      showToast("Failed to insert row", "error");
    }
  };

  const handleInsertBefore = (rowIndex) => handleInsertAfter(rowIndex - 1);

  const handleDeleteRow = async (id) => {
    setContextMenu(null);
    if (!window.confirm("Delete this row?")) return;
    try {
      await deleteProject(id);
      setRows((prev) => prev.filter((r) => r._id !== id));
      showToast("Row deleted");
    } catch {
      showToast("Failed to delete row", "error");
    }
  };

  const handleCellBlur = async (id, col, value) => {
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      await updateCell(id, col, value);
      setRows((prev) => prev.map((r) => {
        if (r._id !== id) return r;
        if (col === "projectName") return { ...r, projectName: value };
        return { ...r, columns: { ...r.columns, [col]: value } };
      }));
      // Questionnaire is created per-version when a version is added
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRowRightClick = (e, rowIndex) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, rowIndex }); };

  const toggleExpand = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Version Management ────────────────────────────────────────

  const handleOpenVersionModal = (projectId, projectName) => {
    setVersionModal({ projectId, projectName });
  };

  const handleVersionModalConfirm = async (versionName) => {
    if (!versionModal) return;
    const { projectId, projectName } = versionModal;
    setVersionModal(null);

    try {
      // Create a NEW questionnaire for this specific version
      const result = await createQuestionnaire(projectName.trim());
      const versionQId = result?.questionnaireId || null;

      if (!versionQId) {
        showToast("Failed to create questionnaire for version", "error");
        return;
      }

      // Add version with the new questionnaireId
      const { data } = await addVersion(projectId, versionName, versionQId);
      setRows((prev) => prev.map((r) => (r._id === projectId ? data : r)));
      showToast(`Version "${versionName}" added`);

      // Open questionnaire builder for this version-specific questionnaire
      window.open(`${QUESTIONNAIRE_URL}/questionnaire/${versionQId}`, "_blank");
    } catch {
      showToast("Failed to add version", "error");
    }
  };

  const handleVersionModalCancel = () => {
    setVersionModal(null);
  };

  const handleDeleteVersion = async (projectId, versionId, versionName) => {
    if (!window.confirm(`Delete version "${versionName || versionId}"?`)) return;
    try {
      const { data } = await deleteVersion(projectId, versionId);
      setRows((prev) => prev.map((r) => (r._id === projectId ? data : r)));
      showToast("Version deleted");
    } catch {
      showToast("Failed to delete version", "error");
    }
  };

  const handleRenameVersion = async (projectId, versionId, newName) => {
    if (!newName.trim()) {
      showToast("Version name cannot be empty", "error");
      return;
    }
    try {
      const { data } = await updateVersion(projectId, versionId, newName);
      setRows((prev) => prev.map((r) => (r._id === projectId ? data : r)));
      setEditingVersion(null);
      showToast("Version renamed");
    } catch {
      showToast("Failed to rename version", "error");
    }
  };

  const handleCopyVersion = async (projectId, versionId, versionName) => {
    try {
      showToast(`Copying version "${versionName}"…`);
      const { data } = await copyVersion(projectId, versionId);
      setRows((prev) => prev.map((r) => (r._id === projectId ? data : r)));
      
      const oldNames = rows.find(r => r._id === projectId)?.versions.map(v => v.versionName) || [];
      const newVer = data.versions.find(v => !oldNames.includes(v.versionName));
      const newName = newVer ? newVer.versionName : "new copy";
      showToast(`Version "${versionName}" copied to "${newName}"`);
      
      const status = await fetchQuestionnaireStatusAll();
      setStatusMap(status || {});
    } catch (err) {
      showToast(`Failed to copy version: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  const navigateToGrid = (baseUrl, pName, vName) => {
    const p = new URLSearchParams({ projectName: pName || "Untitled", version: vName || "Unnamed" });
    window.open(`${baseUrl}?${p.toString()}`, "_blank");
  };

  const handleOpenBuilder = async (projectId, projectName, questionnaireId, versions) => {
    // Only allow opening builder if at least one version exists
    if (!versions || versions.length === 0) {
      showToast("Create a version first to open the questionnaire", "error");
      return;
    }
    // Use the latest version's questionnaire ID
    const latestVersion = versions[versions.length - 1];
    const versionQId = latestVersion?.questionnaireId;
    if (versionQId) {
      window.open(`${QUESTIONNAIRE_URL}/questionnaire/${versionQId}`, "_blank");
      return;
    }
    // Fallback: if version has no questionnaireId yet, create one
    if (!projectName || !projectName.trim()) {
      showToast("Please set a project name first", "error");
      return;
    }
    const result = await createQuestionnaire(projectName.trim());
    if (result?.questionnaireId) {
      window.open(`${QUESTIONNAIRE_URL}/questionnaire/${result.questionnaireId}`, "_blank");
    } else {
      showToast("Could not open questionnaire. Is the questionnaire API running?", "error");
    }
  };

  const answerVersion = async (projectId, projectName, verName, versionObj) => {
    if (!projectName || !projectName.trim()) {
      showToast("Please set a project name first", "error");
      return;
    }
    // Use version-specific questionnaireId
    let qId = versionObj?.questionnaireId;
    if (!qId) {
      showToast("No questionnaire linked to this version", "error");
      return;
    }
    window.open(
      `${QUESTIONNAIRE_URL}/take/${qId}?version=${encodeURIComponent(verName || "")}`,
      "_blank"
    );
  };

  // ── Render ────────────────────────────────────────────────────

  if (view === "status") {
    return (
      <QuestionnaireStatusPage
        rows={rows}
        onBack={() => setView("grid")}
      />
    );
  }

  if (loading) return (<div className="rg-loading"><div className="rg-spinner" /><span>Connecting to database…</span></div>);
  if (error) return (<div className="rg-error"><span className="rg-error-icon">!</span><p>{error}</p><button onClick={loadData}>Retry</button></div>);

  return (
    <div className="rg-page">
      <header className="rg-header">
        <div className="rg-header-inner">
          <div className="rg-title-block">
            <span className="rg-eyebrow">PROJECT PLANNER</span>
            <h1 className="rg-title">Project Grid</h1>
            {projectName && <p className="rg-subtitle">{projectName} · {version || 'Unnamed'}</p>}
          </div>
          <div className="rg-header-actions">
            <span className="rg-row-count">{rows.length} project{rows.length !== 1 ? "s" : ""}</span>
            <button className="rg-btn rg-btn-secondary" onClick={() => setView("status")}>
              📋 Answer Status
            </button>
            <button className="rg-btn rg-btn-primary" onClick={handleAddRow}>
              <span className="rg-btn-icon">+</span> Add Project
            </button>
            <button className="rg-theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      <main className="rg-main">
        <div className="rg-table-wrap">
          <table className="rg-table">
            <thead>
              <tr>
                <th className="rg-th rg-th-project">Project Name</th>
                <th className="rg-th rg-th-version">Version Controls</th>
                <th className="rg-th rg-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="rg-empty">
                    <div className="rg-empty-inner">
                      <span className="rg-empty-icon" />
                      <p>No projects yet.</p>
                      <button className="rg-btn rg-btn-primary" onClick={handleAddRow}>Add first project</button>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => {
                  // Aggregate answer status across all version-specific questionnaires
                  const versionQIds = (row.versions || [])
                    .map(v => v.questionnaireId)
                    .filter(Boolean);
                  const anyAnswered = versionQIds.some(qId => statusMap[qId]?.isAnswered);
                  const totalSubCount = versionQIds.reduce((sum, qId) => sum + (statusMap[qId]?.submissionCount || 0), 0);
                  const isAnswered = anyAnswered;
                  const subCount = totalSubCount;

                  return (
                    <React.Fragment key={row._id}>
                      <tr className={`rg-row ${saving[row._id] ? "rg-row--saving" : ""}`} onContextMenu={(e) => handleRowRightClick(e, rowIndex)}>
                        <td className="rg-td rg-td-project">
                          <div className="rg-project-name-cell">
                            <input
                              className="rg-input"
                              type="text"
                              defaultValue={row.projectName || ""}
                              placeholder="Project name…"
                              onBlur={(e) => handleCellBlur(row._id, "projectName", e.target.value)}
                            />
                            {row.projectName && (
                              <button
                                className={`rg-questionnaire-btn ${(!row.versions || row.versions.length === 0) ? "rg-questionnaire-btn--disabled" : ""}`}
                                title={(!row.versions || row.versions.length === 0) ? "Create a version first" : "Open latest version's questionnaire"}
                                onClick={() => handleOpenBuilder(row._id, row.projectName, row.questionnaireId, row.versions)}
                              >
                                Q
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="rg-td rg-td-version">
                          <div className="rg-version-cell">
                            <div className="rg-version-summary">
                              <span className="rg-version-count">
                                {(row.versions || []).length} version{(row.versions || []).length !== 1 ? "s" : ""}
                              </span>
                              <button className="rg-expand-btn" onClick={() => toggleExpand(row._id)} title={expandedRows.has(row._id) ? "Collapse versions" : "Expand versions"}>
                                <span className={`rg-expand-arrow ${expandedRows.has(row._id) ? "rg-expand-arrow--open" : ""}`}>▸</span>
                              </button>
                            </div>
                            {expandedRows.has(row._id) && (
                              <div className="rg-version-detail">
                                {(row.versions || []).length === 0 ? (
                                  <div className="rg-version-empty">No versions yet</div>
                                ) : (
                                  <div className="rg-version-list">
                                    {[...(row.versions || [])].sort((a, b) => {
                                      const regex = /(\d+|\D+)/g;
                                      const partsA = (a.versionName || "").match(regex) || [];
                                      const partsB = (b.versionName || "").match(regex) || [];
                                      const maxLen = Math.max(partsA.length, partsB.length);
                                      for (let i = 0; i < maxLen; i++) {
                                        const partA = partsA[i];
                                        const partB = partsB[i];
                                        if (partA === undefined) return -1;
                                        if (partB === undefined) return 1;
                                        const isNumA = /^\d+$/.test(partA);
                                        const isNumB = /^\d+$/.test(partB);
                                        if (isNumA && isNumB) {
                                          const numA = parseInt(partA, 10);
                                          const numB = parseInt(partB, 10);
                                          if (numA !== numB) return numA - numB;
                                        } else if (partA !== partB) {
                                          return partA.localeCompare(partB);
                                        }
                                      }
                                      return 0;
                                    }).map((ver) => (
                                      <div key={ver._id} className="rg-version-item">
                                        {editingVersion && editingVersion.projectId === row._id && editingVersion.versionId === ver._id ? (
                                          <input
                                            className="rg-input rg-input--mini"
                                            type="text"
                                            defaultValue={ver.versionName}
                                            autoFocus
                                            onBlur={(e) => handleRenameVersion(row._id, ver._id, e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") handleRenameVersion(row._id, ver._id, e.target.value);
                                              if (e.key === "Escape") setEditingVersion(null);
                                            }}
                                          />
                                        ) : (
                                          <span
                                            className="rg-version-name"
                                            onDoubleClick={() => setEditingVersion({ projectId: row._id, versionId: ver._id })}
                                            title="Double-click to rename"
                                          >
                                            {ver.versionName || "Unnamed"}
                                            {ver.copiedFrom && (
                                              <span 
                                                style={{ 
                                                  fontSize: "10px", 
                                                  fontStyle: "italic", 
                                                  opacity: 0.6, 
                                                  marginLeft: "6px", 
                                                  color: "var(--text-accent)" 
                                                }}
                                              >
                                                (copied from {ver.copiedFrom})
                                              </span>
                                            )}
                                          </span>
                                        )}
                                        <div className="rg-version-links">
                                          <button
                                            className="rg-version-copy-btn"
                                            title="Copy this version"
                                            onClick={() => handleCopyVersion(row._id, ver._id, ver.versionName)}
                                          >
                                            Copy
                                          </button>
                                          <span className="rg-version-link-label">Open in:</span>
                                          {GRID_LINKS.map((grid) => (
                                            <button
                                              key={grid.name}
                                              className="rg-version-link-btn"
                                              title={`Open in ${grid.name}`}
                                              onClick={() => navigateToGrid(grid.url, row.projectName, ver.versionName)}
                                            >
                                              {grid.icon}
                                            </button>
                                          ))}
                                          <button
                                            className="rg-version-link-btn rg-version-link-btn--answer"
                                            title="Answer questionnaire for this version"
                                            onClick={() => answerVersion(row._id, row.projectName, ver.versionName, ver)}
                                          >
                                            Answer
                                          </button>
                                          <div className="rg-version-export-wrap">
                                            <button
                                              className="rg-version-export-btn"
                                              title="Export all grids"
                                              onClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setExportMenuPosition({
                                                  x: rect.left,
                                                  y: rect.bottom + 4,
                                                  projectName: row.projectName,
                                                  versionName: ver.versionName,
                                                });
                                              }}
                                            >
                                              Export
                                            </button>
                                          </div>
                                          <button
                                            className="rg-version-del-btn"
                                            title="Delete version"
                                            onClick={() => handleDeleteVersion(row._id, ver._id, ver.versionName)}
                                          >
                                            X
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="rg-version-add">
                                  <button
                                    className="rg-btn rg-btn-primary rg-version-add-btn"
                                    onClick={() => handleOpenVersionModal(row._id, row.projectName)}
                                  >
                                    + Add Version
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="rg-td rg-td-actions">
                          <div className="rg-actions">
                            <button className="rg-icon-btn rg-icon-btn--insert" title="Insert row below" onClick={() => handleInsertAfter(rowIndex)}>+</button>
                            <button className="rg-icon-btn rg-icon-btn--delete" title="Delete row" onClick={() => handleDeleteRow(row._id)}>X</button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div className="rg-bottom-bar">
            <button className="rg-add-row-btn" onClick={handleAddRow}>
              <span>+</span> Add row
            </button>
          </div>
        )}
      </main>

      {/* Version Modal */}
      <VersionModal
        open={Boolean(versionModal)}
        projectName={versionModal?.projectName || ""}
        onConfirm={handleVersionModalConfirm}
        onCancel={handleVersionModalCancel}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div className="rg-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} ref={menuRef}>
          <button onClick={() => handleInsertBefore(contextMenu.rowIndex)}>Insert row above</button>
          <button onClick={() => handleInsertAfter(contextMenu.rowIndex)}>Insert row below</button>
          <div className="rg-menu-divider" />
          <button className="rg-menu-danger" onClick={() => handleDeleteRow(rows[contextMenu.rowIndex]._id)}>Delete row</button>
        </div>
      )}

      {/* Export Menu */}
      {exportMenuPosition && (
        <div className="rg-export-dropdown-fixed" ref={exportMenuRef} style={{ top: exportMenuPosition.y, left: exportMenuPosition.x }}>
          <button className="rg-export-option" onClick={async () => {
            const { projectName, versionName } = exportMenuPosition;
            setExportMenuPosition(null); showToast("Exporting…");
            try { await exportToWord(projectName, versionName); showToast("Export complete!"); } catch (e) { showToast(`Export failed: ${e?.message || 'Unknown error'}`, "error"); console.error(e); }
          }}>
            <span className="rg-export-icon">📄</span> Word
          </button>
          <button className="rg-export-option" onClick={async () => {
            const { projectName, versionName } = exportMenuPosition;
            setExportMenuPosition(null); showToast("Exporting…");
            try { await exportToExcel(projectName, versionName); showToast("Export complete!"); } catch (e) { showToast(`Export failed: ${e?.message || 'Unknown error'}`, "error"); console.error(e); }
          }}>
            <span className="rg-export-icon">📊</span> Excel
          </button>
          <button className="rg-export-option" onClick={async () => {
            const { projectName, versionName } = exportMenuPosition;
            setExportMenuPosition(null); showToast("Exporting…");
            try { await exportToPDF(projectName, versionName); showToast("Export complete!"); } catch (e) { showToast(`Export failed: ${e?.message || 'Unknown error'}`, "error"); console.error(e); }
          }}>
            <span className="rg-export-icon">📕</span> PDF
          </button>
        </div>
      )}

      {toast && <div className={`rg-toast rg-toast--${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
