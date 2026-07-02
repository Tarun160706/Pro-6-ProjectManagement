import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from "docx";
applyPlugin(jsPDF);

const API_URL = "http://localhost:5002/api/grids";

function sanitizeFileName(name) { return name.replace(/[^a-zA-Z0-9_]/g, "_"); }

async function fetchData(projectName, version) {
  const pName = projectName || "Untitled"; const ver = version || "Unnamed";
  try {
    const seedRes = await axios.post(`${API_URL}/seed`, { name: `Queries and Responses - ${pName}/${ver}` });
    const gridId = seedRes.data?.data?._id;
    if (gridId) {
      const qRes = await axios.get(`${API_URL}/${gridId}/rows`);
      return qRes.data?.data?.rows || [];
    }
    return [];
  } catch { return []; }
}

export async function exportToWord(projectName, version) {
  const pName = projectName || "Untitled"; const ver = version || "Unnamed";
  const rows = await fetchData(pName, ver);
  const headers = ["Query", "Response"];
  const COL_W = [4500, 4500];
  const headerRow = new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({ width: { size: COL_W[i], type: WidthType.DXA }, shading: { fill: "2b2b5e" }, verticalAlign: "center", children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, color: "ffffff", size: 16, font: "Calibri" })] })] })) });
  const dataRows = rows.map((r, ri) => {
    const vals = [r.data?.query || "", r.data?.response || ""];
    return new TableRow({ children: headers.map((_, ci) => new TableCell({ width: { size: COL_W[ci], type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? "f2f2f7" : "ffffff" }, children: [new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: String(vals[ci] || ""), size: 16, font: "Calibri", color: "1d1d1f" })] })] })) });
  });
  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: pName, bold: true, size: 48, font: "Calibri", color: "1d1d1f" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: `Version: ${ver}`, size: 28, font: "Calibri", color: "5b5aff" })] }),
    new Paragraph({ spacing: { before: 200, after: 120 }, children: [new TextRun({ text: "Queries & Responses", bold: true, size: 28, font: "Calibri", color: "2b2b5e" })] }),
    rows.length === 0 ? new Paragraph({ spacing: { before: 80, after: 200 }, children: [new TextRun({ text: "(No data)", italics: true, size: 20, font: "Calibri", color: "888888" })] }) : new Table({ width: { size: 9000, type: WidthType.DXA }, rows: [headerRow, ...dataRows] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, border: { top: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" } }, children: [new TextRun({ text: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, size: 16, font: "Calibri", color: "888888", italics: true })] }),
  ];
  const doc = new Document({ title: `${pName} - ${ver} - Queries`, styles: { default: { document: { run: { font: "Calibri", size: 22 } } } }, sections: [{ children }] });
  saveAs(await Packer.toBlob(doc), `${sanitizeFileName(pName)}_${sanitizeFileName(ver)}_Queries.docx`);
  return true;
}

export async function exportToExcel(projectName, version) {
  const pName = projectName || "Untitled"; const ver = version || "Unnamed";
  const rows = await fetchData(pName, ver);
  const headers = ["Query", "Response"];
  const data = rows.map((r, i) => [r.data?.query || "", r.data?.response || ""]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  ws["!cols"] = headers.map((_, i) => ({ wch: 40 }));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Queries");
  saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), `${sanitizeFileName(pName)}_${sanitizeFileName(ver)}_Queries.xlsx`);
  return true;
}

export async function exportToPDF(projectName, version) {
  const pName = projectName || "Untitled"; const ver = version || "Unnamed";
  const rows = await fetchData(pName, ver);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(18); doc.text(pName, doc.internal.pageSize.getWidth() / 2, 18, { align: "center" });
  doc.setFontSize(12); doc.setTextColor(91, 90, 255); doc.text(`Version: ${ver}`, doc.internal.pageSize.getWidth() / 2, 26, { align: "center" });
  doc.setFontSize(14); doc.setTextColor(43, 43, 94); doc.text("Queries & Responses", 14, 38);
  if (rows.length > 0) {
    doc.autoTable({ head: [["Query", "Response"]], body: rows.map((r, i) => [r.data?.query || "", r.data?.response || ""]), startY: 42, theme: "grid", headStyles: { fillColor: [43, 43, 94], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 }, bodyStyles: { fontSize: 8 }, alternateRowStyles: { fillColor: [242, 242, 247] } });
  }
  doc.setFontSize(8); doc.setTextColor(136, 136, 136);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  doc.save(`${sanitizeFileName(pName)}_${sanitizeFileName(ver)}_Queries.pdf`);
  return true;
}
