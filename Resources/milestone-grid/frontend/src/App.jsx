import React, { useState, useEffect, useRef } from 'react';
import MilestonePage from './pages/MilestonePage';
import { exportToWord, exportToExcel, exportToPDF } from './services/exportService';
import './App.css';

const getInitialTheme = () => {
  try { return localStorage.getItem('rg-theme') || 'dark'; } catch { return 'dark'; }
};

function App() {
  const params = new URLSearchParams(window.location.search);
  const projectName = params.get('projectName') || null;
  const version = params.get('version') || null;
  const [theme, setTheme] = useState(getInitialTheme);
  const [exportMenuPosition, setExportMenuPosition] = useState(null);
  const [toast, setToast] = useState(null);
  const exportMenuRef = useRef(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('rg-theme', theme); } catch {}
  }, [theme]);

  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) setExportMenuPosition(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div className="rg-page">
      <header className="rg-header">
        <div className="rg-header-inner">
          <div className="rg-title-block">
            <span className="rg-eyebrow">MILESTONE GRID</span>
            <h1 className="rg-title">Milestone Grid</h1>
            {projectName && <p className="rg-subtitle">{projectName} · {version || 'Unnamed'}</p>}
          </div>
          <div className="rg-header-actions">
            {(projectName || true) && (
              <button className="rg-btn rg-export-trigger-btn" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setExportMenuPosition(exportMenuPosition ? null : {
                  x: rect.left,
                  y: rect.bottom + 4,
                  projectName,
                  versionName: version,
                });
              }}>
                <span className="rg-btn-icon">↓</span> Export
              </button>
            )}
            <button className="rg-theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </header>
      <main className="rg-main">
        <MilestonePage projectName={projectName} version={version} />
        {projectName && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a
              href={`http://localhost:3000?projectName=${encodeURIComponent(projectName)}&version=${encodeURIComponent(version || '')}`}
              className="rg-btn rg-btn-primary"
              style={{ textDecoration: 'none', display: 'inline-flex' }}
            >
              ← Return to Project Page
            </a>
          </div>
        )}
      </main>
      {exportMenuPosition && (
        <div className="rg-export-dropdown-fixed" ref={exportMenuRef} style={{ top: exportMenuPosition.y, left: exportMenuPosition.x }}>
          <button className="rg-export-option" onClick={async () => {
            const { projectName: pn, versionName: vn } = exportMenuPosition;
            setExportMenuPosition(null); showToast('Exporting…');
            try { await exportToWord(pn, vn); showToast('Export complete!'); } catch { showToast('Export failed', 'error'); }
          }}>
            <span className="rg-export-icon">📄</span> Word
          </button>
          <button className="rg-export-option" onClick={async () => {
            const { projectName: pn, versionName: vn } = exportMenuPosition;
            setExportMenuPosition(null); showToast('Exporting…');
            try { await exportToExcel(pn, vn); showToast('Export complete!'); } catch { showToast('Export failed', 'error'); }
          }}>
            <span className="rg-export-icon">📊</span> Excel
          </button>
          <button className="rg-export-option" onClick={async () => {
            const { projectName: pn, versionName: vn } = exportMenuPosition;
            setExportMenuPosition(null); showToast('Exporting…');
            try { await exportToPDF(pn, vn); showToast('Export complete!'); } catch { showToast('Export failed', 'error'); }
          }}>
            <span className="rg-export-icon">📕</span> PDF
          </button>
        </div>
      )}
      {toast && <div className={`rg-toast rg-toast--${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default App;
