/**
 * Shared Tailwind strings for the landing page.
 *
 * The landing runs a different visual language to the app (glass, concentric
 * shells, fluid motion), so its primitives live here rather than in lib/styles.
 */

/** Outer enclosure of the double-bezel pair. Holds the hairline + outer radius. */
export const shell =
  "bg-white/[0.035] border border-white/[0.08] rounded-shell p-1.5 transition-[border-color,transform,background-color] duration-700 ease-fluid";

/** Adds lift on hover. Only for cards that are actually interactive-feeling. */
export const shellHover =
  "hover:border-white/[0.14] hover:bg-white/[0.06] hover:-translate-y-[3px] will-change-transform";

/** Inner core. Its radius is the shell's minus the 1.5 padding, so curves nest. */
export const core =
  "bg-linear-to-b from-panel/[0.72] to-steel/[0.55] rounded-core shadow-[inset_0_1px_1px_rgba(255,255,255,0.09)] h-full p-7";

export const eyebrow =
  "inline-flex items-center gap-2 rounded-full px-3 py-[5px] text-[10px] uppercase tracking-[0.2em] font-medium text-dim bg-white/[0.035] border border-white/[0.08]";

export const eyebrowDot = "w-[5px] h-[5px] rounded-full bg-orange shadow-[0_0_8px_#f46b1a]";

const btnBase =
  "group inline-flex items-center gap-3 rounded-full py-3 pl-6 pr-3 text-[15px] font-medium tracking-[-0.01em] cursor-pointer border border-transparent no-underline transition-[transform,background-color,border-color,opacity] duration-700 ease-fluid active:scale-[0.98] will-change-transform";

export const btn = {
  primary: `${btnBase} bg-orange text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.09),0_8px_30px_-8px_rgba(244,107,26,0.5)] hover:bg-[#ff7d2e]`,
  ghost: `${btnBase} bg-white/[0.035] text-fg border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.09)] hover:bg-white/[0.06] hover:border-white/[0.14]`,
} as const;

/**
 * Trailing icon in its own circle, flush with the button's right padding. Moves
 * diagonally on hover against the button's own press-scale.
 */
export const btnIcon =
  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-700 ease-fluid group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105";

export const btnIconOnPrimary = `${btnIcon} bg-black/[0.18]`;
export const btnIconOnGhost = `${btnIcon} bg-white/[0.08]`;

export const cardIcon =
  "w-11 h-11 rounded-[0.875rem] flex items-center justify-center text-orange bg-orange/[0.09] border border-orange/[0.18] mb-5 transition-transform duration-700 ease-fluid group-hover:scale-[1.06]";

export const cardTitle = "text-[19px] font-semibold tracking-[-0.02em] mb-2";
export const cardBody = "text-[15px] leading-relaxed text-dim";

export const h2 =
  "text-[clamp(2.1rem,4.6vw,3.5rem)] font-semibold tracking-[-0.03em] leading-[0.98]";
export const lead =
  "text-[clamp(1.0625rem,1.5vw,1.25rem)] leading-relaxed text-dim max-w-[54ch]";

/* The landing keeps Tailwind's stock md/lg breakpoints — `app:` (700px) is the
   app's asset-table breakpoint and means nothing here. */
export const wrap = "max-w-[1200px] mx-auto px-4 md:px-8";
export const section = "py-20 md:py-[clamp(6rem,12vw,10rem)]";
