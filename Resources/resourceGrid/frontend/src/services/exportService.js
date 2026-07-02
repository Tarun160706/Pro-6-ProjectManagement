import axios from "axios";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);

const COLS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const API_URL = "http://localhost:5003/api/resources";

function getCellValue(row, col) { if (!row.columns || typeof row.columns !== "object") return ""; return row.columns[col] ?? ""; }
function getTotalHours(row) { let t = 0; for (let c = 1; c <= 12; c++) { const v = parseFloat(getCellValue(row, String(c))); if (!isNaN(v)) t += v; } return t; }
function getRate(row) { return parseFloat(row.rate) || 0; }
function getCost(row) { return getTotalHours(row) * getRate(row); }
function sanitizeFileName(name) { return name.replace(/[^a-zA-Z0-9_]/g, "_"); }

async function fetchData(projectName, version) {
  const pName = projectName || "Untitled"; const ver = version || "Unnamed";
  try { const res = await axios.get(API_URL, { params: { projectName: pName, version: ver } }); return Array.isArray(res.data) ? res.data : []; } catch { return []; }
}

// ── Word Export (internal - takes rows) ─────────────────────────
async function generateWord(rows, pName, ver) {
  const headers = ["Resource Name", ...COLS, "Total Hours", "Rate", "Cost"];
  const COL_WIDTHS = [2000, ...COLS.map(() => 600), 900, 800, 1000];
  const headerRow = new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({
    width: { size: COL_WIDTHS[i] || 600, type: WidthType.DXA }, shading: { fill: "2b2b5e" }, verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, color: "ffffff", size: 16, font: "Calibri" })] })],
  })) });
  const dataRows = rows.map((row, ri) => {
    const vals = [row.resourceName || "", ...COLS.map((c) => getCellValue(row, c)), getTotalHours(row) > 0 ? String(getTotalHours(row)) : "", row.rate || "", getCost(row) > 0 ? getCost(row).toFixed(2) : ""];
    return new TableRow({ children: vals.map((val, ci) => new TableCell({
      width: { size: COL_WIDTHS[ci] || 600, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? "f2f2f7" : "ffffff" },
      children: [new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: String(val || ""), size: 16, font: "Calibri", color: "1d1d1f" })] })],
    })) });
  });
  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: pName, bold: true, size: 48, font: "Calibri", color: "1d1d1f" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: `Version: ${ver}`, size: 28, font: "Calibri", color: "5b5aff" })] }),
    new Paragraph({ spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "Resource Grid", bold: true, size: 28, font: "Calibri", color: "2b2b5e" })] }),
    rows.length === 0 ? new Paragraph({ spacing: { before: 80, after: 200 }, children: [new TextRun({ text: "(No data)", italics: true, size: 20, font: "Calibri", color: "888888" })] }) : new Table({ width: { size: COL_WIDTHS.reduce((a, b) => a + b, 0), type: WidthType.DXA }, rows: [headerRow, ...dataRows] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, border: { top: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" } }, children: [new TextRun({ text: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, size: 16, font: "Calibri", color: "888888", italics: true })] }),
  ];
  return new Document({ title: `${pName} - ${ver} - Resource Grid`, styles: { default: { document: { run: { font: "Calibri", size: 22 } } } }, sections: [{ children }] });
}

// ── App.js exports (fetch data internally, no rows param needed) ─
export async function exportToWord(projectName, version) {
  const pName = projectName || "Untitled"; const ver = version || "Unnamed";
  const rows = await fetchData(pName, ver);
  const doc = await generateWord(rows, pName, ver);
  saveAs(await Packer.toBlob(doc), `${sanitizeFileName(pName)}_${sanitizeFileName(ver)}_Resources.docx`);
  return true;
}

export async function exportToExcel(projectName, version) {
  const pName = projectName || "Untitled"; const ver = version || "Unnamed";
  const rows = await fetchData(pName, ver);
  const headers = ["Resource Name", ...COLS, "Total Hours", "Rate", "Cost"];
  const data = rows.map((row, i) => [row.resourceName || "", ...COLS.map((c) => getCellValue(row, c)), getTotalHours(row) > 0 ? getTotalHours(row) : "", row.rate ? parseFloat(row.rate) : null, getCost(row) > 0 ? getCost(row) : ""]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  ws["!cols"] = [{ wch: 25 }, ...COLS.map(() => ({ wch: 8 })), { wch: 10 }, { wch: 10 }, { wch: 12 }];
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Resources");
  saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), `${sanitizeFileName(pName)}_${sanitizeFileName(ver)}_Resources.xlsx`);
  return true;
}

export async function exportToPDF(projectName, version) {
  const pName = projectName || "Untitled"; const ver = version || "Unnamed";
  const rows = await fetchData(pName, ver);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(18); doc.text(pName, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
  doc.setFontSize(12); doc.setTextColor(91, 90, 255); doc.text(`Version: ${ver}`, doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });
  doc.setFontSize(14); doc.setTextColor(43, 43, 94); doc.text("Resource Grid", 14, 40);
  if (rows.length > 0) {
    doc.autoTable({ head: [["Resource Name", ...COLS, "Total Hours", "Rate", "Cost"]], body: rows.map((row, i) => [row.resourceName || "", ...COLS.map((c) => getCellValue(row, c)), getTotalHours(row) > 0 ? String(getTotalHours(row)) : "", row.rate || "", getCost(row) > 0 ? getCost(row).toFixed(2) : ""]), startY: 44, theme: "grid", headStyles: { fillColor: [43, 43, 94], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 }, bodyStyles: { fontSize: 8 }, alternateRowStyles: { fillColor: [242, 242, 247] }, columnStyles: { 0: { cellWidth: 50 } }, margin: { left: 8, right: 8 } });
  }
  doc.setFontSize(8); doc.setTextColor(136, 136, 136);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  doc.save(`${sanitizeFileName(pName)}_${sanitizeFileName(ver)}_Resources.pdf`);
  return true;
}

// ── ResourceGrid.jsx dispatcher (takes rows param, uses local data) ─
export async function exportResources(format, rows, projectName, version) {
  const pName = projectName || "Untitled"; const ver = version || "Unnamed";
  switch (format) {
    case "word-existing":
    case "word-new": {
      const doc = await generateWord(rows, pName, ver);
      saveAs(await Packer.toBlob(doc), `${sanitizeFileName(pName)}_${sanitizeFileName(ver)}_Resources.docx`);
      return true;
    }
    case "excel": {
      const headers = ["Resource Name", ...COLS, "Total Hours", "Rate", "Cost"];
      const data = rows.map((row, i) => [row.resourceName || "", ...COLS.map((c) => getCellValue(row, c)), getTotalHours(row) > 0 ? getTotalHours(row) : "", row.rate ? parseFloat(row.rate) : null, getCost(row) > 0 ? getCost(row) : ""]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      ws["!cols"] = [{ wch: 25 }, ...COLS.map(() => ({ wch: 8 })), { wch: 10 }, { wch: 10 }, { wch: 12 }];
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Resources");
      saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), `${sanitizeFileName(pName)}_${sanitizeFileName(ver)}_Resources.xlsx`);
      return true;
    }
    case "pdf": {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18); doc.text(pName, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
      doc.setFontSize(12); doc.setTextColor(91, 90, 255); doc.text(`Version: ${ver}`, doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });
      doc.setFontSize(14); doc.setTextColor(43, 43, 94); doc.text("Resource Grid", 14, 40);
      if (rows.length > 0) {
        doc.autoTable({ head: [["Resource Name", ...COLS, "Total Hours", "Rate", "Cost"]], body: rows.map((row, i) => [row.resourceName || "", ...COLS.map((c) => getCellValue(row, c)), getTotalHours(row) > 0 ? String(getTotalHours(row)) : "", row.rate || "", getCost(row) > 0 ? getCost(row).toFixed(2) : ""]), startY: 44, theme: "grid", headStyles: { fillColor: [43, 43, 94], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 }, bodyStyles: { fontSize: 8 }, alternateRowStyles: { fillColor: [242, 242, 247] }, columnStyles: { 0: { cellWidth: 50 } }, margin: { left: 8, right: 8 } });
      }
      doc.setFontSize(8); doc.setTextColor(136, 136, 136);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
      doc.save(`${sanitizeFileName(pName)}_${sanitizeFileName(ver)}_Resources.pdf`);
      return true;
    }
    default: throw new Error(`Unknown export format: ${format}`);
  }
}
