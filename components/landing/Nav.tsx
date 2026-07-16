"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui";

const LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#industries", label: "Industries" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav({
  menuOpen,
  onToggleMenu,
  onLogin,
}: {
  menuOpen: boolean;
  onToggleMenu: (open: boolean) => void;
  onLogin: () => void;
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
      <nav className="lp-nav">
        <a href="#top" className="lp-nav-logo">
          Rig<span>Trak</span>
        </a>

        <div className="lp-nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="lp-nav-link">
              {l.label}
            </a>
          ))}
        </div>

        <button className="lp-btn lp-btn-primary lp-nav-cta" onClick={onLogin}>
          Log in
          <span className="lp-btn-icon">
            <Icon name="arrow-up-right" />
          </span>
        </button>

        <button
          className="lp-burger"
          data-open={menuOpen}
          onClick={() => onToggleMenu(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className="lp-burger-line" />
          <span className="lp-burger-line" />
        </button>
      </nav>

      <div className="lp-overlay" data-open={menuOpen}>
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="lp-overlay-link"
            onClick={() => onToggleMenu(false)}
          >
            {l.label}
          </a>
        ))}
        <button
          className="lp-btn lp-btn-primary"
          style={{ marginTop: "2rem", alignSelf: "flex-start" }}
          onClick={() => {
            onToggleMenu(false);
            onLogin();
          }}
        >
          Log in
          <span className="lp-btn-icon">
            <Icon name="arrow-up-right" />
          </span>
        </button>
      </div>
    </>
  );
}
