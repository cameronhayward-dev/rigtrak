import type { RegisterRow } from "./types";

function findCol(header: string[], candidates: string[]): number {
  for (const c of candidates) {
    const idx = header.findIndex((h) => h.includes(c));
    if (idx !== -1) return idx;
  }
  return -1;
}

export class NotARegisterError extends Error {
  constructor() {
    super("This doesn't look like a register file — it needs a Description column. Try the template.");
    this.name = "NotARegisterError";
  }
}

/**
 * Parses a customer's asset register (CSV/XLSX) into rows ready to import.
 *
 * EPC is deliberately never read from an import file, even if a column called
 * "epc" exists — imported assets always start untagged, and tags get linked
 * later by scanning on site.
 */
export async function parseRegisterFile(file: File): Promise<RegisterRow[]> {
  const XLSX = await import("xlsx");
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
  if (!rows.length) throw new NotARegisterError();

  const header = (rows[0] as unknown[]).map((h) => String(h).toLowerCase().trim());
  const descIdx = findCol(header, ["description"]);
  if (descIdx === -1) throw new NotARegisterError();

  const serialIdx = findCol(header, ["serial number", "serial no", "serial", "source id", "id#", "external id"]);
  const categoryIdx = findCol(header, ["asset type", "asset category", "category"]);
  const capacityIdx = findCol(header, ["capacity", "wll value", "wll"]);
  const capacityUnitIdx = findCol(header, ["capacity unit", "wll unit", "unit"]);
  const lengthIdx = findCol(header, ["length"]);
  const mfrIdx = findCol(header, ["manufacturer"]);
  const locIdx = findCol(header, ["location"]);
  const statusIdx = findCol(header, ["status", "result"]);
  const lastInspIdx = findCol(header, [
    "last inspection",
    "last inspected",
    "inspection date",
    "inspected on",
    "date inspected",
    "insp date",
    "last checked",
  ]);
  const nextInspIdx = findCol(header, [
    "next inspection",
    "next inspection due",
    "next due",
    "due date",
    "next test",
    "retest",
    "compliance date",
    "compliance",
  ]);
  const notesIdx = findCol(header, ["notes", "comments"]);
  const registerNameIdx = findCol(header, ["source register"]);

  const cell = (r: unknown[], idx: number) => (idx !== -1 ? String(r[idx] ?? "").trim() : "");

  const parsed: RegisterRow[] = [];
  const seen = new Set<string>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    if (!r || r.every((c) => c === undefined || c === "")) continue;
    const description = cell(r, descIdx);
    if (!description) continue;

    const serialNumber = cell(r, serialIdx);
    const key = serialNumber + "|" + description;
    const isDup = Boolean(serialNumber) && seen.has(key);
    seen.add(key);

    parsed.push({
      serialNumber,
      description,
      category: cell(r, categoryIdx),
      capacity: cell(r, capacityIdx),
      capacityUnit: cell(r, capacityUnitIdx),
      lengthM: cell(r, lengthIdx),
      manufacturer: cell(r, mfrIdx),
      location: cell(r, locIdx),
      status: cell(r, statusIdx),
      lastInspection: cell(r, lastInspIdx),
      nextInspection: cell(r, nextInspIdx),
      notes: cell(r, notesIdx),
      sourceRegister: cell(r, registerNameIdx) || file.name,
      needsReview: isDup ? "Possible duplicate — verify against source register" : "",
    });
  }
  return parsed;
}
