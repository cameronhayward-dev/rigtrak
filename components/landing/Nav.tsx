"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cx } from "@/lib/styles";
import { btn, btnIconOnPrimary } from "./styles";

const LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#industries", label: "Industries" },
];

/** Staggered reveal for the overlay links, applied only once the menu is open. */
const STAGGER = ["delay-100", "delay-150", "delay-200"];

/** Shared by both hamburger bars; each adds its own resting + open transform. */
const burgerLine =
  "absolute left-1/2 top-1/2 h-[1.5px] w-4 rounded-sm bg-fg -translate-x-1/2 transition-transform duration-700 ease-fluid will-change-transform";

export default function Nav({
  menuOpen,
  onToggleMenu,
}: {
  menuOpen: boolean;
  onToggleMenu: (open: boolean) => void;
}) {
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onToggleMenu(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, onToggleMenu]);

  return (
    <>
      <nav
        className={cx(
          "fixed top-6 z-[60] flex items-center rounded-full border border-white/[0.08] bg-[#0c0d0f]/60 backdrop-blur-[20px] backdrop-saturate-[160%]",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.09),0_12px_40px_-12px_rgba(0,0,0,0.8)]",
          // Mobile: edge-to-edge bar. Desktop: wide centred island, brand and
          // links pushed to opposite ends.
          "left-4 right-4 justify-between gap-4 py-2 pr-2 pl-5",
          "md:left-1/2 md:right-auto md:w-[min(64rem,calc(100vw-3rem))] md:-translate-x-1/2 md:pl-6",
        )}
      >
        <a href="#top" className="shrink-0 text-lg font-bold tracking-[-0.04em] text-fg no-underline">
          Rig<span className="text-orange">Trak</span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-normal text-dim no-underline transition-colors duration-700 ease-fluid hover:text-fg"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/dashboard"
            className={cx(btn.primary, "gap-2 py-2 pr-2 pl-[18px] text-sm")}
          >
            Dashboard
            <span className={cx(btnIconOnPrimary, "h-7 w-7")}>
              <Icon name="arrow-up-right" className="text-[13px]" />
            </span>
          </Link>
        </div>

        {/* Two bars that rotate into an X. Transform-only, so no layout work. */}
        <button
          data-open={menuOpen}
          onClick={() => onToggleMenu(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="group relative h-10 w-10 shrink-0 cursor-pointer rounded-full border border-white/[0.08] bg-white/[0.06] md:hidden"
        >
          <span
            className={cx(
              burgerLine,
              "translate-y-[calc(-50%-4px)] group-data-[open=true]:translate-y-[-50%] group-data-[open=true]:rotate-45",
            )}
          />
          <span
            className={cx(
              burgerLine,
              "translate-y-[calc(-50%+4px)] group-data-[open=true]:translate-y-[-50%] group-data-[open=true]:-rotate-45",
            )}
          />
        </button>
      </nav>

      <div
        data-open={menuOpen}
        className={cx(
          "fixed inset-0 z-[55] flex flex-col justify-center p-8",
          "bg-[#08090a]/80 backdrop-blur-[40px] backdrop-saturate-[140%]",
          "pointer-events-none opacity-0 transition-opacity duration-700 ease-fluid",
          "data-[open=true]:pointer-events-auto data-[open=true]:opacity-100",
        )}
      >
        {LINKS.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => onToggleMenu(false)}
            className={cx(
              "py-2 text-[clamp(2rem,9vw,3.25rem)] font-semibold tracking-[-0.04em] text-fg no-underline",
              "transition-[opacity,transform] duration-[800ms] ease-fluid",
              menuOpen ? cx("translate-y-0 opacity-100", STAGGER[i]) : "translate-y-12 opacity-0",
            )}
          >
            {l.label}
          </a>
        ))}

        <Link
          href="/dashboard"
          className={cx(btn.primary, "mt-8 self-start")}
          onClick={() => onToggleMenu(false)}
        >
          Dashboard
          <span className={btnIconOnPrimary}>
            <Icon name="arrow-up-right" />
          </span>
        </Link>
      </div>
    </>
  );
}
