/**
 * Tailwind class strings for the primitives the app reuses everywhere.
 *
 * These were `.btn-primary`, `.badge`, `.asset-card` etc. in globals.css. They
 * live here rather than being repeated inline because ~20 components share
 * them; Tailwind's source scanner picks the strings up from this file.
 */

import { twMerge } from "tailwind-merge";

/**
 * Join class strings, dropping falsy branches, and resolve conflicts so the
 * LAST class wins.
 *
 * twMerge is not optional here. Tailwind resolves two utilities that set the
 * same property by their order in the generated stylesheet, not by their order
 * in the class attribute — so appending `px-2` to a constant that already
 * carries `px-[14px]` silently loses. Every `cx(btn.x, btnSm, "…")` override in
 * this codebase depends on this.
 */
export function cx(...parts: (string | false | null | undefined)[]) {
  return twMerge(parts.filter(Boolean).join(" "));
}

const btnBase =
  "font-bold rounded-app cursor-pointer transition-opacity duration-150 active:opacity-70";

export const btn = {
  primary: `${btnBase} bg-orange text-white text-[15px] px-[18px] py-3`,
  secondary: `${btnBase} bg-panel text-fg border border-edge text-[15px] px-[18px] py-3`,
  danger: `${btnBase} bg-red text-white text-[15px] px-[18px] py-3`,
  warning: `${btnBase} bg-yellow text-[#000] text-[15px] px-[18px] py-3`,
  /** Square icon-only button. Keeps the 44px minimum touch target. */
  icon: `${btnBase} bg-panel text-fg border border-edge px-3 py-[10px] text-[18px] min-w-11 min-h-11 inline-flex items-center justify-center`,
} as const;

/** Compact modifier — pair with a btn.* variant, overriding its padding. */
export const btnSm = "px-[14px] py-[10px] text-[13px]";
/** Full-width modifier — pair with a btn.* variant. */
export const btnFull = "w-full text-center p-4 text-base";

export const badge =
  "inline-block px-[10px] py-1 rounded-[20px] text-[11px] font-bold uppercase tracking-[0.5px] shrink-0";

export const badgeTone = {
  active: "bg-green/15 text-green",
  quarantine: "bg-yellow/15 text-yellow",
  condemned: "bg-red/15 text-red",
  unregistered: "bg-dim/15 text-dim",
  found: "bg-green/15 text-green",
  missing: "bg-red/15 text-red",
} as const;

/** The steel panel used for asset rows, location rows, check headers. */
export const card = "bg-steel border border-edge rounded-app";

/** Tappable asset row, plus the pieces inside it. */
export const assetCard = `${card} p-4 flex items-center gap-3 cursor-pointer relative active:opacity-80`;
export const assetList = "flex flex-col gap-2";
export const assetBody = "min-w-0 flex-1";
export const assetName = "truncate text-base font-bold";
export const assetSub = "mt-1 truncate text-xs text-dim";
export const assetArrow = "shrink-0 text-xl text-dim";

export const searchBox =
  "h-12 w-full rounded-app border border-edge bg-steel px-[14px] py-3 text-base text-fg placeholder:text-muted focus:border-orange focus:outline-none";

export const input =
  "w-full bg-panel border border-edge rounded-app px-[14px] py-[13px] text-fg text-base font-sans focus:outline-none focus:border-orange";

export const label =
  "block text-xs font-bold text-dim uppercase tracking-[0.5px] mb-[7px]";

export const textarea = `${input} min-h-20 resize-y`;

/** Select inside a form. Matches `input` but keeps the 48px control height. */
export const formSelect =
  "h-12 w-full rounded-app border border-edge bg-panel px-[14px] py-[13px] text-base text-fg font-sans focus:outline-none focus:border-orange";

export const formGroup = "mb-4";
/** Two-up on desktop, stacked on mobile. */
export const formRow = "grid grid-cols-1 gap-3 app:grid-cols-2";

export const epcDisplay =
  "rounded-app border border-edge bg-panel px-[14px] py-[13px] font-mono text-[13px] break-all text-dim";

/** Small uppercase divider used above list groups. */
export const sectionLabel =
  "text-[11px] font-bold uppercase tracking-[0.8px] text-dim pt-[10px] pb-[6px]";

export const compliance = {
  ok: "text-green font-semibold",
  due: "text-yellow font-semibold",
  overdue: "text-red font-semibold",
} as const;
