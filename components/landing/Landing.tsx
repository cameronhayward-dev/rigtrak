"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cx } from "@/lib/styles";
import Nav from "./Nav";
import Reveal from "./Reveal";
import {
  btn,
  btnIconOnPrimary,
  cardBody,
  cardIcon,
  cardTitle,
  core,
  eyebrow,
  eyebrowDot,
  h2,
  lead,
  section,
  shell,
  shellHover,
  wrap,
} from "./styles";

const SERVICES = [
  {
    icon: "radar-2",
    title: "Tag once, scan everything",
    body: "Give each item an RFID tag once, then read a whole rack in a single pass. No line of sight, no reading serial numbers off a swing tag by hand.",
  },
  {
    icon: "calendar-stats",
    title: "Never miss an inspection",
    body: "Monthly, quarterly, six-monthly and annual cycles run independently on the same asset. RigTrak tracks every due date automatically and flags it before it lapses.",
  },
  {
    icon: "file-text",
    title: "One register, always current",
    body: "Import the register you already keep in Excel, then export a PDF an auditor will accept — inspector, ticket number and date against every line.",
  },
];

const CAPABILITIES = [
  {
    icon: "arrows-exchange",
    title: "Check-out and check-in",
    body: "Scan gear onto a truck and off it again. Every movement is stamped with a destination and a time, so the question of who had it last stops being an argument.",
    span: "md:col-span-8",
  },
  {
    icon: "target-arrow",
    title: "Hunt mode",
    body: "Pick a target, walk the yard, follow the signal until you're standing on it.",
    span: "md:col-span-4",
  },
  {
    icon: "clipboard-check",
    title: "Location checks",
    body: "Reconcile a shed, a container or a truck against its expected contents in one sweep.",
    span: "md:col-span-4",
  },
  {
    icon: "id-badge-2",
    title: "Inspectors and tickets",
    body: "Hold ticket type, number and expiry against each inspector, so a lapsed ticket doesn't quietly invalidate six months of sign-offs.",
    span: "md:col-span-8",
  },
  {
    icon: "hourglass-low",
    title: "Retirement dates",
    body: "Height safety gear has a hard expiry regardless of condition. RigTrak tracks it alongside the inspection cycle and condemns on schedule.",
    span: "md:col-span-6",
  },
  {
    icon: "map-pin",
    title: "Locations that match reality",
    body: "Yard, shed, container, truck — model the places your gear actually lives, not an abstract warehouse bin.",
    span: "md:col-span-6",
  },
];

const INDUSTRIES = [
  { icon: "crane", name: "Construction", sub: "Slings, shackles, chain blocks" },
  { icon: "mountain", name: "Mining & Energy", sub: "Remote site registers" },
  { icon: "arrow-bar-up", name: "Height Safety", sub: "Harnesses, lanyards, anchors" },
  { icon: "confetti", name: "Events & Rigging", sub: "Truss, motors, steels" },
  { icon: "building-warehouse", name: "Warehousing", sub: "Forklift and dock gear" },
  { icon: "anchor", name: "Marine & Ports", sub: "Mooring and lifting sets" },
];

const WHY = [
  {
    icon: "bolt",
    title: "Designed for handheld use",
    body: "Large touch targets and high-contrast type, so the register stays readable on a scanner screen in direct sunlight.",
  },
  {
    icon: "database-export",
    title: "Your register stays yours",
    body: "Import from the spreadsheet you already maintain and export back out to Excel or PDF whenever you want. No lock-in on your own compliance data.",
  },
  {
    icon: "shield-check",
    title: "Audit-ready by default",
    body: "Inspector, ticket, date and outcome are captured at the point of inspection, so the paperwork is a by-product of the work rather than a weekend job.",
  },
];

/** Demo rows in the hero panel — illustrative, not real data. */
const HERO_ROWS = [
  { name: "4t Round Sling 3m", sub: "RT-000147 · Annual · Yard", pill: "Found", tone: "bg-green/10 text-green" },
  { name: "Bow Shackle 6.5t", sub: "RT-000212 · Quarterly · Yard", pill: "Found", tone: "bg-green/10 text-green" },
  { name: "Chain Block 2t", sub: "RT-000088 · Six-monthly · 12d", pill: "Due soon", tone: "bg-yellow/10 text-yellow" },
  { name: "Fall Arrest Harness", sub: "RT-000301 · Retires 2026", pill: "Missing", tone: "bg-red/10 text-red" },
  { name: "Lever Hoist 1.5t", sub: "RT-000163 · Monthly · Truck 2", pill: "Unexpected", tone: "bg-yellow/10 text-yellow" },
];

const STRIP = [
  { icon: "wifi", label: "Passive UHF RFID" },
  { icon: "file-spreadsheet", label: "Excel import & export" },
  { icon: "device-mobile", label: "Works on the handheld" },
  { icon: "cloud-lock", label: "Your register, exportable" },
];

const orb = "absolute rounded-full blur-[60px] opacity-[0.35] md:blur-[90px] md:opacity-50";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      id="top"
      className="relative overflow-x-clip bg-[#08090a] font-display text-base leading-normal text-fg"
    >
      {/* Ambient depth. Fixed + pointer-events-none so scrolling never repaints it. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className={cx(
            orb,
            "-top-[14vw] -right-[8vw] h-[46vw] w-[46vw]",
            "bg-[radial-gradient(circle,rgba(244,107,26,0.5),transparent_68%)]",
          )}
        />
        <div
          className={cx(
            orb,
            "top-[46vh] -left-[12vw] h-[38vw] w-[38vw]",
            "bg-[radial-gradient(circle,rgba(46,204,113,0.16),transparent_70%)]",
          )}
        />
        <div
          className={cx(
            orb,
            "-bottom-[10vw] right-[4vw] h-[34vw] w-[34vw]",
            "bg-[radial-gradient(circle,rgba(244,107,26,0.22),transparent_70%)]",
          )}
        />
      </div>
      <div className="grain pointer-events-none fixed inset-0 z-[1] opacity-[0.035]" aria-hidden="true" />

      <Nav menuOpen={menuOpen} onToggleMenu={setMenuOpen} />

      <div className="relative z-[2]">
        {/* ---------------------------------------------------------- HERO */}
        <section className="flex items-center pt-32 pb-12 md:min-h-[100dvh] md:pt-36 md:pb-20">
          <div className={cx(wrap, "grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16")}>
            <Reveal>
              <span className={eyebrow}>
                <span className={eyebrowDot} />
                RFID asset &amp; compliance tracking
              </span>

              <h1 className="my-7 text-[clamp(2.75rem,7vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
                Rigging compliance that <span className="text-orange">holds under load</span>
              </h1>

              <p className={lead}>
                Keep every asset, inspection and compliance record in one place. RigTrak tags your
                lifting and height safety gear with RFID, so you can scan a whole location in one
                pass and know what you own, where it is and when it&apos;s next due.
              </p>

              <div className="mt-8 flex flex-wrap gap-6">
                {["Tag once, scan forever", "Every cycle tracked", "Audit-ready exports"].map((t) => (
                  <span key={t} className="flex items-center gap-2 text-sm text-dim">
                    <Icon name="circle-check" className="text-base text-green" />
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className={shell}>
                <div className={core}>
                  <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <span className="text-[13px] font-semibold tracking-[0.02em]">
                      Yard — Location check
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-green">
                      <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-green" />
                      Scanning
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {HERO_ROWS.map((r) => (
                      <div
                        key={r.name}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-[13px]"
                      >
                        <div className="min-w-0 flex-1 font-medium">
                          <div className="truncate">{r.name}</div>
                          <div className="mt-0.5 text-[11px] text-muted">{r.sub}</div>
                        </div>
                        <span
                          className={cx(
                            "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
                            r.tone,
                          )}
                        >
                          {r.pill}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------------- STRIP */}
        <div className="border-y border-white/[0.08] bg-white/[0.012] py-8">
          <div className={wrap}>
            <Reveal>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
                {STRIP.map((s) => (
                  <span
                    key={s.label}
                    className="flex items-center justify-start gap-3 text-left text-[13px] text-dim lg:justify-center lg:text-center"
                  >
                    <Icon name={s.icon} className="shrink-0 text-lg text-orange" />
                    {s.label}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ----------------------------------------------------- PLATFORM */}
        <section className={section} id="platform">
          <div className={wrap}>
            <Reveal>
              <div className="mb-16 max-w-2xl">
                <span className={eyebrow}>
                  <span className={eyebrowDot} />
                  The platform
                </span>
                <h2 className={cx(h2, "mt-5 mb-4")}>
                  Track smarter. <span className="text-orange">Prove it faster.</span>
                </h2>
                <p className={lead}>
                  Three things decide whether a register survives an audit: knowing what you own,
                  knowing when it was last looked at, and being able to show both on demand. RigTrak
                  is built around exactly those.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
              {SERVICES.map((s, i) => (
                <Reveal key={s.title} delay={i * 100}>
                  <div className={cx(shell, shellHover, "group h-full")}>
                    <div className={core}>
                      <div className={cardIcon}>
                        <Icon name={s.icon} className="text-xl" />
                      </div>
                      <h3 className={cardTitle}>{s.title}</h3>
                      <p className={cardBody}>{s.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- CAPABILITIES */}
        <section className={section} id="capabilities">
          <div className={wrap}>
            <Reveal>
              <div className="mb-16 max-w-2xl">
                <span className={eyebrow}>
                  <span className={eyebrowDot} />
                  Capabilities
                </span>
                <h2 className={cx(h2, "mt-5 mb-4")}>Everything the yard actually does</h2>
                <p className={lead}>
                  Gear moves, gets borrowed, goes missing and comes back. RigTrak models the messy
                  parts rather than pretending they don&apos;t happen.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-4">
              {CAPABILITIES.map((c, i) => (
                <Reveal key={c.title} delay={(i % 2) * 80} className={c.span}>
                  <div className={cx(shell, shellHover, "group h-full")}>
                    <div className={cx(core, "flex flex-col justify-between md:min-h-[19rem]")}>
                      <div>
                        <div className={cardIcon}>
                          <Icon name={c.icon} className="text-xl" />
                        </div>
                        <h3 className={cardTitle}>{c.title}</h3>
                        <p className={cardBody}>{c.body}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- INDUSTRIES */}
        <section className={section} id="industries">
          <div className={wrap}>
            <Reveal>
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className={eyebrow}>
                  <span className={eyebrowDot} />
                  Industries
                </span>
                <h2 className={cx(h2, "mt-5 mb-4")}>Wherever gear is rated and inspected</h2>
                <p className={cx(lead, "mx-auto")}>
                  If it has a working load limit stamped on it, someone has to prove it was checked.
                  That someone is usually holding a spreadsheet.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
              {INDUSTRIES.map((ind, i) => (
                <Reveal key={ind.name} delay={(i % 3) * 90}>
                  <div className={cx(shell, shellHover, "group")}>
                    <div className={cx(core, "flex items-center gap-4 p-5")}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] bg-orange/[0.08] text-orange transition-transform duration-700 ease-fluid group-hover:scale-[1.08]">
                        <Icon name={ind.icon} className="text-[17px]" />
                      </span>
                      <span>
                        <span className="block text-[15px] font-medium tracking-[-0.015em]">
                          {ind.name}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-muted">{ind.sub}</span>
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- WHY */}
        <section className={cx(section, "pt-0")}>
          <div className={wrap}>
            <Reveal>
              <div className="mb-16 max-w-2xl">
                <span className={eyebrow}>
                  <span className={eyebrowDot} />
                  Why RigTrak
                </span>
                <h2 className={cx(h2, "mt-5")}>Built for daily use on site</h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
              {WHY.map((w, i) => (
                <Reveal key={w.title} delay={i * 100}>
                  <div className={cx(shell, shellHover, "group h-full")}>
                    <div className={core}>
                      <div className={cardIcon}>
                        <Icon name={w.icon} className="text-xl" />
                      </div>
                      <h3 className={cardTitle}>{w.title}</h3>
                      <p className={cardBody}>{w.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- CTA */}
        <section className={cx(section, "pt-0")}>
          <div className={wrap}>
            <Reveal>
              <div className={shell}>
                <div
                  className={cx(
                    core,
                    "px-8 py-[clamp(3rem,7vw,5.5rem)] text-center",
                    "bg-[radial-gradient(120%_140%_at_50%_0%,rgba(244,107,26,0.16),transparent_62%)]",
                  )}
                >
                  <span className={eyebrow}>
                    <span className={eyebrowDot} />
                    Get started
                  </span>
                  <h2 className={cx(h2, "mt-5 mb-5")}>
                    Ready to know what&apos;s <span className="text-orange">actually</span> in the
                    yard?
                  </h2>
                  <p className={cx(lead, "mx-auto mb-10")}>
                    Open the dashboard and browse the demo register. No setup, no sales call.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a
                      href="mailto:cameron.hayward@rigtrak.com"
                      className={cx(btn.primary, "max-md:w-full max-md:justify-between")}
                    >
                      Contact us
                      <span className={btnIconOnPrimary}>
                        <Icon name="mail" />
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------------- FOOTER */}
        <footer className="border-t border-white/[0.08] pt-16 pb-10">
          <div className={wrap}>
            <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)] lg:gap-12">
              <div>
                <div className="mb-4 text-[22px] font-bold tracking-[-0.04em]">
                  Rig<span className="text-orange">Trak</span>
                </div>
                <p className="max-w-[30ch] text-sm leading-relaxed text-muted">
                  RFID asset and compliance tracking for rigging, lifting and height safety gear.
                </p>
              </div>

              <FooterCol
                heading="Platform"
                links={[
                  { href: "#platform", label: "RFID scanning" },
                  { href: "#platform", label: "Compliance cycles" },
                  { href: "#capabilities", label: "Check-out & check-in" },
                  { href: "#capabilities", label: "Reports & exports" },
                ]}
              />
              <FooterCol
                heading="Industries"
                links={INDUSTRIES.slice(0, 4).map((i) => ({ href: "#industries", label: i.name }))}
              />
              <FooterCol
                heading="Company"
                links={[
                  { href: "#top", label: "Who we are" },
                  { href: "#top", label: "Contact" },
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-8 text-[13px] text-muted">
              <span>© {new Date().getFullYear()} RigTrak. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <div className="mb-5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
        {heading}
      </div>
      <ul className="flex list-none flex-col gap-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-sm text-dim no-underline transition-colors duration-700 ease-fluid hover:text-fg"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
