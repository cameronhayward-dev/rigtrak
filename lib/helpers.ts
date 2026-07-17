import { badgeTone } from "./styles";
import { SCHEDULE_TYPES, type Asset, type Inspector, type Schedule } from "./types";

export const DAY_MS = 86400000;

/** Whole days from today (midnight) until the given ISO date. null if no date. */
export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - today.getTime()) / DAY_MS);
}

export function formatDateAU(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-AU");
}

/** Tailwind colour classes for an asset status. */
export function statusBadgeClass(status?: string): string {
  const map: Record<string, string> = {
    Active: badgeTone.active,
    Quarantine: badgeTone.quarantine,
    Condemned: badgeTone.condemned,
    Unregistered: badgeTone.unregistered,
  };
  return map[status ?? ""] ?? badgeTone.unregistered;
}

/**
 * Serial Number is the primary human identifier. Older data (from before this
 * field existed) may have it stored under the old field name "sourceId" — this
 * reads either so nothing already imported breaks.
 */
export function getSerial(a: Asset): string {
  return a.serialNumber || a.sourceId || "";
}

/**
 * Parses the many date shapes a spreadsheet can produce into YYYY-MM-DD.
 * Handles: ISO (2026-04-01), AU d/m/y with / or - separators, 2-digit years,
 * Excel serial numbers, and text months (1 Apr 2026 / Apr 1 2026).
 */
export function parseDateLoose(input: unknown): string | null {
  if (input === null || input === undefined || input === "") return null;
  const str = String(input).trim();
  if (!str) return null;

  const pad = (n: number | string) => String(n).padStart(2, "0");
  const fixYear = (y: string) => {
    const n = parseInt(y, 10);
    return n < 100 ? (n < 70 ? 2000 + n : 1900 + n) : n;
  };

  // Excel serial number (days since 1899-12-30)
  if (/^\d{4,6}(\.\d+)?$/.test(str)) {
    const serial = parseFloat(str);
    if (serial > 20000 && serial < 80000) {
      // ~1954 to ~2119, a sane range
      const d = new Date(Date.UTC(1899, 11, 30) + serial * DAY_MS);
      if (!isNaN(d.getTime())) {
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      }
    }
  }

  // ISO: 2026-04-01
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;

  // AU day/month/year with / or - : 1/4/2026, 01-04-26
  m = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (m) return `${fixYear(m[3])}-${pad(m[2])}-${pad(m[1])}`;

  // Text date fallback: "1 Apr 2026", "April 1, 2026" — let the browser try
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
  }

  return null;
}

export function mapAssetStatus(raw?: string): string {
  const r = (raw || "").toLowerCase();
  if (r.includes("fail") || r.includes("condemn")) return "Condemned";
  if (r.includes("repair") || r.includes("quarantine")) return "Quarantine";
  return "Active";
}

/**
 * An asset's inspection schedules. Older items from before schedules existed
 * present their single date pair as one unnamed schedule so nothing looks lost.
 */
export function getSchedules(a: Asset): Schedule[] {
  if (Array.isArray(a.schedules) && a.schedules.length) return a.schedules;
  if (a.complianceDate || a.lastChecked) {
    return [{ type: "Inspection", lastInspected: a.lastChecked || null, nextDue: a.complianceDate || null }];
  }
  return [];
}

/**
 * complianceDate / lastChecked are kept as DERIVED values — soonest next-due
 * across everything, and most recent inspection — so every existing display
 * (cards, stats, reports, exports, live checks) keeps working unchanged.
 */
export function deriveComplianceFields(
  schedules: Schedule[],
  retirementDate: string | null
): { complianceDate: string | null; lastChecked: string | null } {
  const dues = schedules.map((s) => s.nextDue).filter(Boolean) as string[];
  if (retirementDate) dues.push(retirementDate);
  const inspections = schedules.map((s) => s.lastInspected).filter(Boolean) as string[];
  return {
    complianceDate: dues.length ? [...dues].sort()[0] : null,
    lastChecked: inspections.length ? [...inspections].sort().reverse()[0] : null,
  };
}

/** Next due date implied by a schedule's interval from its inspection date. */
export function nextDueFrom(lastInspected: string | null, type: string): string | null {
  const months = SCHEDULE_TYPES[type];
  if (!lastInspected || !months) return null;
  const d = new Date(lastInspected);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function isTicketExpired(insp: Inspector): boolean {
  if (!insp.ticketExpiry) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(insp.ticketExpiry) < today;
}

export function sortAssets(assets: Asset[], sort: string): Asset[] {
  const copy = [...assets];
  if (sort === "name") return copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  if (sort === "recent") return copy; // already ordered by createdAt desc from the query
  if (sort === "status") return copy.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
  if (sort === "compliance") {
    return copy.sort((a, b) => {
      if (!a.complianceDate && !b.complianceDate) return 0;
      if (!a.complianceDate) return 1;
      if (!b.complianceDate) return -1;
      return new Date(a.complianceDate).getTime() - new Date(b.complianceDate).getTime();
    });
  }
  return copy;
}

/** Short compliance word used in exported tables. */
export function checkComplianceText(a: Asset): string {
  const diff = daysUntil(a.complianceDate);
  if (diff === null) return "";
  if (diff < 0) return "OVERDUE";
  if (diff <= 30) return "Due soon";
  return "OK";
}

/**
 * Images are stored inside database records, which have a hard 1MB size limit —
 * so every image gets shrunk to a screen-friendly size before saving. Shared by
 * asset photos (800px) and the company logo (400px).
 */
export function shrinkImage(file: File, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        let quality = 0.8;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > 900000 && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Couldn't read that image — try a different file"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Couldn't read that file"));
    reader.readAsDataURL(file);
  });
}
