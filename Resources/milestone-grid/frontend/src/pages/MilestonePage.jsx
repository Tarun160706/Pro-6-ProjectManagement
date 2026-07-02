import React, { useState, useEffect, useRef, useCallback } from 'react';
import milestoneApi from '../services/milestoneApi';

function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const selected = new Date(dateStr + 'T00:00:00');
  const today = new Date(getTodayString() + 'T00:00:00');
  return selected > today;
}

export default function MilestonePage({ projectName, version }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const data = await milestoneApi.getAll(projectName, version);
      setRows(data);
      setError(null);
    } catch {
      setError('Failed to load grid data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [projectName, version]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setContextMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAddRow = async () => {
    try {
      const newRow = await milestoneApi.create(projectName, version, 'New milestone', '');
      setRows(prev => [...prev, newRow]);
      showToast('Row added');
    } catch {
      showToast('Failed to add row', 'error');
    }
  };

  const handleInsertAfter = async (afterIndex) => {
    setContextMenu(null);
    try {
      await milestoneApi.create(projectName, version, 'New milestone', '');
      const data = await milestoneApi.getAll(projectName, version);
      setRows(data);
      showToast('Row inserted');
    } catch {
      showToast('Failed to insert row', 'error');
    }
  };

  const handleInsertBefore = (rowIndex) => handleInsertAfter(rowIndex - 1);

  const handleUpdateRow = async (id, field, value) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      await milestoneApi.update(id, { [field]: value });
      setRows(prev => prev.map(row =>
        row._id === id ? { ...row, [field]: value } : row
      ));
    } catch {
      showToast('Save failed', 'error');
      fetchRows();
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDateChange = (id, value) => {
    if (value && !isFutureDate(value)) {
      showToast('Date must be in the future', 'error');
      return;
    }
    handleUpdateRow(id, 'date', value);
  };

  const handleDeleteRow = async (id) => {
    setContextMenu(null);
    if (!window.confirm('Delete this row?')) return;
    try {
      await milestoneApi.remove(id);
      setRows(prev => prev.filter(row => row._id !== id));
      showToast('Row deleted');
    } catch {
      showToast('Failed to delete row', 'error');
    }
  };

  const handleRowRightClick = (e, rowIndex) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, rowIndex });
  };

  if (loading) {
    return (
      <div className="rg-loading">
        <div className="rg-spinner" />
        <span>Connecting to database…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rg-error">
        <span className="rg-error-icon">!</span>
        <p>{error}</p>
        <button onClick={fetchRows}>Retry</button>
      </div>
    );
  }

  const todayStr = getTodayString();

  return (
    <>
      <div className="rg-table-wrap">
        <table className="rg-table">
          <thead>
            <tr>
              <th className="rg-th" style={{ width: 44, textAlign: 'center' }}>#</th>
              <th className="rg-th">Milestone</th>
              <th className="rg-th" style={{ width: 180 }}>Date</th>
              <th className="rg-th rg-th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="rg-empty">
                  <div className="rg-empty-inner">
                    <span className="rg-empty-icon" />
                    <p>No milestones found.</p>
                    <button className="rg-btn rg-btn-primary" onClick={handleAddRow}>
                      Add first milestone
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row._id}
                  className={`rg-row ${saving[row._id] ? 'rg-row--saving' : ''}`}
                  onContextMenu={(e) => handleRowRightClick(e, index)}
                >
                  <td className="rg-td rg-row-num">{index + 1}</td>
                  <td className="rg-td">
                    <GridCell
                      value={row.milestone || ''}
                      rowId={row._id}
                      field="milestone"
                      onUpdate={handleUpdateRow}
                    />
                  </td>
                  <td className="rg-td">
                    <DatePickerCell
                      value={row.date || ''}
                      rowId={row._id}
                      minDate={todayStr}
                      onUpdate={handleDateChange}
                    />
                  </td>
                  <td className="rg-td rg-td-actions">
                    <div className="rg-actions">
                      <button
                        className="rg-icon-btn rg-icon-btn--insert"
                        title="Insert row below"
                        onClick={() => handleInsertAfter(index)}
                      >
                        +
                      </button>
                      <button
                        className="rg-icon-btn rg-icon-btn--delete"
                        title="Delete row"
                        onClick={() => handleDeleteRow(row._id)}
                      >
                        X
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="rg-bottom-bar">
          <button className="rg-add-row-btn" onClick={handleAddRow}>
            <span>+</span> Add milestone
          </button>
        </div>
      )}

      {contextMenu && (
        <div
          className="rg-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          ref={menuRef}
        >
          <button onClick={() => handleInsertBefore(contextMenu.rowIndex)}>
            Insert row above
          </button>
          <button onClick={() => handleInsertAfter(contextMenu.rowIndex)}>
            Insert row below
          </button>
          <div className="rg-menu-divider" />
          <button
            className="rg-menu-danger"
            onClick={() => handleDeleteRow(rows[contextMenu.rowIndex]._id)}
          >
            Delete row
          </button>
        </div>
      )}

      {toast && (
        <div className={`rg-toast rg-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}

function DatePickerCell({ value, rowId, minDate, onUpdate }) {
  const hiddenInputRef = useRef(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const handleTriggerClick = () => {
    if (hiddenInputRef.current) {
      // Try showPicker first (Chrome, Edge, Safari)
      if (typeof hiddenInputRef.current.showPicker === 'function') {
        hiddenInputRef.current.showPicker();
      } else {
        // Firefox fallback: directly focus and click
        hiddenInputRef.current.focus();
        hiddenInputRef.current.click();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTriggerClick();
    }
  };

  const handleDateChange = (e) => {
    const newVal = e.target.value;
    if (newVal !== value) {
      onUpdate(rowId, newVal);
    }
  };

  const displayText = formatDate(value);

  return (
    <div
      className="rg-date-trigger"
      onClick={handleTriggerClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      title="Pick a date"
    >
      <input
        ref={hiddenInputRef}
        type="date"
        value={value || ''}
        min={minDate || undefined}
        onChange={handleDateChange}
        className="rg-date-hidden-input"
        aria-hidden="true"
        tabIndex={-1}
      />
      <span className={`rg-date-display ${value ? 'rg-date-display--has' : ''}`}>
        {displayText || 'Select date'}
      </span>
      <span className="rg-date-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" />
          <line x1="1.5" y1="6.5" x2="14.5" y2="6.5" />
          <line x1="5" y1="1.5" x2="5" y2="4" />
          <line x1="11" y1="1.5" x2="11" y2="4" />
        </svg>
      </span>
    </div>
  );
}

function GridCell({ value, field, rowId, onUpdate }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
      onUpdate(rowId, field, localValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      e.target.blur();
    }
  };

  return (
    <input
      className="rg-input"
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="—"
    />
  );
}
