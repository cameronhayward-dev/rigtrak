import type { jsPDF } from "jspdf";
import { checkComplianceText, formatDateAU, getSerial } from "./helpers";
import type { Asset, CheckData, CompanyProfile } from "./types";

// jsPDF and XLSX are browser-only and heavy — loaded on demand so they never
// run during server prerender and never sit in the initial bundle.
const loadPdf = async () => (await import("jspdf")).jsPDF;
const loadXlsx = async () => await import("xlsx");

const todayStamp = () => new Date().toISOString().slice(0, 10);
const longDate = () =>
  new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

interface TableOptions {
  startX?: number;
  startY: number;
  colWidths: number[];
  head: (string | number)[];
  body: (string | number)[][];
  headColor?: [number, number, number];
}

/**
 * Draws a bordered table using only core jsPDF drawing commands (no plugins).
 * Returns the Y position after the table so more content can be placed below,
 * and starts a new page automatically when it runs out of room.
 */
function drawSimpleTable(
  docPdf: jsPDF,
  { startX = 14, startY, colWidths, head, body, headColor = [244, 107, 26] }: TableOptions
): number {
  const rowHeight = 8;
  const pageHeight = docPdf.internal.pageSize.getHeight();
  let y = startY;
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);

  const drawRow = (cells: (string | number)[], isHeader: boolean) => {
    if (y + rowHeight > pageHeight - 14) {
      docPdf.addPage();
      y = 18;
    }
    docPdf.setFillColor(...(isHeader ? headColor : ([255, 255, 255] as [number, number, number])));
    docPdf.rect(startX, y, totalWidth, rowHeight, "F");
    docPdf.setDrawColor(210, 210, 210);
    docPdf.rect(startX, y, totalWidth, rowHeight, "S");
    docPdf.setTextColor(...(isHeader ? ([255, 255, 255] as [number, number, number]) : ([30, 30, 30] as [number, number, number])));
    docPdf.setFont("helvetica", isHeader ? "bold" : "normal");
    docPdf.setFontSize(8);
    let x = startX;
    cells.forEach((cell, i) => {
      const text = String(cell ?? "");
      const maxChars = Math.floor(colWidths[i] / 1.8);
      docPdf.text(text.length > maxChars ? text.substring(0, maxChars - 1) + "…" : text, x + 2, y + 5.5);
      x += colWidths[i];
    });
    y += rowHeight;
  };

  drawRow(head, true);
  body.forEach((row) => drawRow(row, false));
  docPdf.setTextColor(0, 0, 0);
  return y;
}

/**
 * Draws the company's branding at the top of an exported PDF — logo on the left,
 * contact block on the right — modelled on a real industry register header.
 * Returns the Y position to start content below it.
 */
function drawPdfHeader(docPdf: jsPDF, title: string, company: CompanyProfile): number {
  const pageWidth = docPdf.internal.pageSize.getWidth();
  let y = 16;

  if (company.logo) {
    try {
      docPdf.addImage(company.logo, "JPEG", 14, 10, 34, 16, undefined, "FAST");
    } catch {
      // A bad logo image shouldn't break the whole export.
    }
  }

  if (company.name || company.abn || company.address || company.phone) {
    docPdf.setFontSize(10);
    docPdf.setFont("helvetica", "bold");
    docPdf.text(company.name || "", pageWidth - 14, 13, { align: "right" });
    docPdf.setFont("helvetica", "normal");
    docPdf.setFontSize(8);
    docPdf.setTextColor(90);
    const lines = [
      company.abn ? `ABN ${company.abn}` : "",
      company.address || "",
      company.phone || "",
    ].filter(Boolean);
    lines.forEach((line, i) => docPdf.text(line, pageWidth - 14, 18 + i * 4, { align: "right" }));
    docPdf.setTextColor(0);
    y = Math.max(30, 18 + lines.length * 4 + 4);
  }

  docPdf.setDrawColor(244, 107, 26);
  docPdf.setLineWidth(0.8);
  docPdf.line(14, y, pageWidth - 14, y);
  docPdf.setLineWidth(0.2);
  y += 9;

  docPdf.setFontSize(16);
  docPdf.setFont("helvetica", "bold");
  docPdf.text(title, 14, y);
  docPdf.setFont("helvetica", "normal");
  return y + 6;
}

/** Company details as leading rows on an exported spreadsheet, mirroring the PDF header. */
function excelCompanyRows(company: CompanyProfile): string[][] {
  const rows: string[][] = [];
  if (company.name) rows.push([company.name]);
  if (company.abn) rows.push([`ABN ${company.abn}`]);
  if (company.address) rows.push([company.address]);
  if (company.phone) rows.push([company.phone]);
  if (rows.length) rows.push([]);
  return rows;
}

export function getComplianceGroups(assets: Asset[]) {
  const today = new Date();
  const named = assets.filter((a) => a.name);
  const days = (a: Asset) =>
    Math.ceil((new Date(a.complianceDate as string).getTime() - today.getTime()) / 86400000);
  const overdue = named.filter((a) => a.complianceDate && days(a) < 0);
  const dueSoon = named.filter((a) => a.complianceDate && days(a) >= 0 && days(a) <= 30);
  return { named, overdue, dueSoon };
}

// ── SUMMARY REPORT (compliance overview) ──

export async function exportSummaryPDF(assets: Asset[], company: CompanyProfile) {
  const JsPDF = await loadPdf();
  const { named, overdue, dueSoon } = getComplianceGroups(assets);
  const docPdf = new JsPDF();
  let y = drawPdfHeader(docPdf, "Compliance Summary", company);
  docPdf.setFontSize(9);
  docPdf.setTextColor(120);
  docPdf.text(longDate(), 14, y);
  docPdf.setTextColor(0);
  y += 6;

  y = drawSimpleTable(docPdf, {
    startY: y,
    colWidths: [140, 40],
    head: ["Metric", "Count"],
    body: [
      ["Total Assets", named.length],
      ["Active", named.filter((a) => a.status === "Active").length],
      ["Quarantined", named.filter((a) => a.status === "Quarantine").length],
      ["Condemned", named.filter((a) => a.status === "Condemned").length],
    ],
  });
  y += 12;

  if (overdue.length) {
    docPdf.setFontSize(13);
    docPdf.text(`Compliance Overdue (${overdue.length})`, 14, y);
    y += 6;
    y = drawSimpleTable(docPdf, {
      startY: y,
      colWidths: [70, 40, 40, 30],
      head: ["Asset", "Serial", "Location", "Due"],
      body: overdue.map((a) => [a.name || "Unnamed", getSerial(a) || "—", a.location || "—", formatDateAU(a.complianceDate)]),
      headColor: [231, 76, 60],
    });
    y += 12;
  }
  if (dueSoon.length) {
    docPdf.setFontSize(13);
    docPdf.text(`Due Within 30 Days (${dueSoon.length})`, 14, y);
    y += 6;
    drawSimpleTable(docPdf, {
      startY: y,
      colWidths: [70, 40, 40, 30],
      head: ["Asset", "Serial", "Location", "Due"],
      body: dueSoon.map((a) => [a.name || "Unnamed", getSerial(a) || "—", a.location || "—", formatDateAU(a.complianceDate)]),
      headColor: [241, 196, 15],
    });
  }
  docPdf.save(`RigTrak_Summary_${todayStamp()}.pdf`);
}

export async function exportSummaryExcel(assets: Asset[], company: CompanyProfile) {
  const XLSX = await loadXlsx();
  const { named, overdue, dueSoon } = getComplianceGroups(assets);
  const wb = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ...excelCompanyRows(company),
    ["Compliance Summary", new Date().toLocaleDateString("en-AU")],
    [],
    ["Total Assets", named.length],
    ["Active", named.filter((a) => a.status === "Active").length],
    ["Quarantined", named.filter((a) => a.status === "Quarantine").length],
    ["Condemned", named.filter((a) => a.status === "Condemned").length],
  ]);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  const group = (list: Asset[]) => [
    ["Asset", "Serial Number", "Location", "Due Date"],
    ...list.map((a) => [a.name || "Unnamed", getSerial(a), a.location || "", formatDateAU(a.complianceDate)]),
  ];
  if (overdue.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(group(overdue)), "Overdue");
  if (dueSoon.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(group(dueSoon)), "Due Soon");

  XLSX.writeFile(wb, `RigTrak_Summary_${todayStamp()}.xlsx`);
}

// ── FULL ASSET REGISTER (client handover) ──

const REGISTER_HEADERS = [
  "RigTrak ID",
  "Serial Number",
  "Asset",
  "Description",
  "Location",
  "Status",
  "Next Inspection Due",
  "Last Checked",
];

function getRegisterRows(assets: Asset[]): string[][] {
  return assets
    .filter((a) => a.name)
    .map((a) => [
      a.rigtrakId || "",
      getSerial(a) || "",
      a.name || "",
      a.description || "",
      a.location || "",
      a.status || "",
      a.complianceDate ? formatDateAU(a.complianceDate) : "",
      a.lastChecked ? formatDateAU(a.lastChecked) : "",
    ]);
}

export async function exportRegisterPDF(assets: Asset[], company: CompanyProfile) {
  const JsPDF = await loadPdf();
  const docPdf = new JsPDF({ orientation: "landscape" });
  const y = drawPdfHeader(docPdf, "Asset Register", company);
  docPdf.setFontSize(9);
  docPdf.setTextColor(120);
  docPdf.text(longDate(), 14, y);
  docPdf.setTextColor(0);
  drawSimpleTable(docPdf, {
    startY: y + 6,
    colWidths: [28, 32, 45, 60, 30, 24, 30, 20],
    head: REGISTER_HEADERS,
    body: getRegisterRows(assets),
  });
  docPdf.save(`RigTrak_Register_${todayStamp()}.pdf`);
}

export async function exportRegisterExcel(assets: Asset[], company: CompanyProfile) {
  const XLSX = await loadXlsx();
  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([
    ...excelCompanyRows(company),
    REGISTER_HEADERS,
    ...getRegisterRows(assets),
  ]);
  XLSX.utils.book_append_sheet(wb, sheet, "Asset Register");
  XLSX.writeFile(wb, `RigTrak_Register_${todayStamp()}.xlsx`);
}

// ── LOCATION CHECK (scan-verified evidence of what was physically present) ──

export async function exportLocationCheckPDF(d: CheckData, company: CompanyProfile) {
  const JsPDF = await loadPdf();
  const docPdf = new JsPDF();
  const stamp = d.time.toLocaleString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  let y = drawPdfHeader(docPdf, "Location Check — Scan Verified", company);
  docPdf.setFontSize(11);
  docPdf.setFont("helvetica", "bold");
  docPdf.text(d.locationName, 14, y);
  docPdf.setFont("helvetica", "normal");
  docPdf.setFontSize(9);
  docPdf.setTextColor(120);
  docPdf.text(`Scanned ${stamp} · ${d.scannedEpcs.length} tags read`, 14, y + 5);
  docPdf.setTextColor(0);
  y += 11;

  y = drawSimpleTable(docPdf, {
    startY: y,
    colWidths: [120, 60],
    head: ["Result", "Count"],
    body: [
      ["Found (present)", d.found.length],
      ["Missing (not present)", d.missing.length],
      ["Unexpected (shouldn't be here)", d.unexpected.length],
    ],
  });
  y += 10;

  if (d.found.length) {
    docPdf.setFontSize(12);
    docPdf.text(`Found — physically present (${d.found.length})`, 14, y);
    y += 5;
    y = drawSimpleTable(docPdf, {
      startY: y,
      colWidths: [80, 45, 30, 27],
      head: ["Asset", "Serial", "Next Due", "Status"],
      body: d.found.map((a) => [
        a.name,
        getSerial(a) || "—",
        a.complianceDate ? formatDateAU(a.complianceDate) : "—",
        checkComplianceText(a) || "—",
      ]),
      headColor: [46, 204, 113],
    });
    y += 10;
  }
  if (d.missing.length) {
    docPdf.setFontSize(12);
    docPdf.text(`Missing — expected but not found (${d.missing.length})`, 14, y);
    y += 5;
    y = drawSimpleTable(docPdf, {
      startY: y,
      colWidths: [110, 72],
      head: ["Asset", "Serial"],
      body: d.missing.map((a) => [a.name, getSerial(a) || "—"]),
      headColor: [231, 76, 60],
    });
    y += 10;
  }
  if (d.unexpected.length) {
    docPdf.setFontSize(12);
    docPdf.text(`Unexpected — present but shouldn't be (${d.unexpected.length})`, 14, y);
    y += 5;
    drawSimpleTable(docPdf, {
      startY: y,
      colWidths: [60, 35, 87],
      head: ["Asset", "Serial", "Note"],
      body: d.unexpected.map((u) => [u.name, u.serial || "—", u.note]),
      headColor: [241, 196, 15],
    });
  }
  docPdf.save(`RigTrak_LocationCheck_${d.locationName.replace(/\s+/g, "_")}_${todayStamp()}.pdf`);
}

export async function exportLocationCheckExcel(d: CheckData, company: CompanyProfile) {
  const XLSX = await loadXlsx();
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ...excelCompanyRows(company),
      ["Location Check — Scan Verified"],
      ["Location", d.locationName],
      ["Scanned at", d.time.toLocaleString("en-AU")],
      ["Tags read", d.scannedEpcs.length],
      [],
      ["Found (present)", d.found.length],
      ["Missing (not present)", d.missing.length],
      ["Unexpected (shouldn't be here)", d.unexpected.length],
    ]),
    "Summary"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Asset", "Serial Number", "Location", "Next Inspection Due", "Compliance"],
      ...d.found.map((a) => [
        a.name,
        getSerial(a),
        a.location || "",
        a.complianceDate ? formatDateAU(a.complianceDate) : "",
        checkComplianceText(a),
      ]),
    ]),
    "Found"
  );

  if (d.missing.length) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        ["Asset", "Serial Number", "Next Inspection Due"],
        ...d.missing.map((a) => [a.name, getSerial(a), a.complianceDate ? formatDateAU(a.complianceDate) : ""]),
      ]),
      "Missing"
    );
  }

  if (d.unexpected.length) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        ["Asset", "Serial Number", "Note"],
        ...d.unexpected.map((u) => [u.name, u.serial, u.note]),
      ]),
      "Unexpected"
    );
  }

  XLSX.writeFile(wb, `RigTrak_LocationCheck_${d.locationName.replace(/\s+/g, "_")}_${todayStamp()}.xlsx`);
}

// ── REGISTER IMPORT TEMPLATE ──

export function downloadTemplate() {
  const headers = [
    "Serial Number",
    "Description",
    "Asset Type",
    "Manufacturer",
    "Capacity",
    "Capacity Unit",
    "Length (m)",
    "Location",
    "Last Inspection Date",
    "Next Inspection Due",
    "Notes",
  ];
  const blob = new Blob([headers.join(",") + "\n"], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "RigTrak_Register_Template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
