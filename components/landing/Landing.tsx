"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import Nav from "./Nav";
import LoginModal from "./LoginModal";
import Reveal from "./Reveal";

const SERVICES = [
  {
    icon: "radar-2",
    title: "RFID Scanning",
    body: "Tag gear once with an EPC, then read a whole rack in a single pass. No line of sight, no serial numbers read off a swing tag with a torch in your teeth.",
  },
  {
    icon: "calendar-stats",
    title: "Compliance Scheduling",
    body: "Monthly, quarterly, six-monthly and annual cycles run independently on the same asset. RigTrak surfaces the soonest due date and flags it before it lapses.",
  },
  {
    icon: "file-text",
    title: "Registers & Reports",
    body: "Import the register you already keep in Excel. Export a PDF an auditor will accept, with inspector, ticket number and date against every line.",
  },
];

const METRICS = [
  {
    value: "One pass",
    sub: "Walk a location once. RigTrak reconciles what it read against what should be there and splits it into found, missing and unexpected.",
  },
  {
    value: "Four cycles",
    sub: "A single asset can carry monthly, quarterly, six-monthly and annual inspections at the same time, each with its own last-inspected date.",
  },
  {
    value: "Zero retyping",
    sub: "Point RigTrak at your existing spreadsheet register. It parses the rows, matches what it can and marks the rest for review.",
  },
];

const CAPABILITIES = [
  {
    icon: "arrows-exchange",
    title: "Check-out and check-in",
    body: "Scan gear onto a truck and off it again. Every movement is stamped with a destination and a time, so the question of who had it last stops being an argument.",
    span: "lp-b-8",
  },
  {
    icon: "target-arrow",
    title: "Hunt mode",
    body: "Pick a target, walk the yard, follow the signal until you're standing on it.",
    span: "lp-b-4",
  },
  {
    icon: "clipboard-check",
    title: "Location checks",
    body: "Reconcile a shed, a container or a truck against its expected contents in one sweep.",
    span: "lp-b-4",
  },
  {
    icon: "id-badge-2",
    title: "Inspectors and tickets",
    body: "Hold ticket type, number and expiry against each inspector, so a lapsed ticket doesn't quietly invalidate six months of sign-offs.",
    span: "lp-b-8",
  },
  {
    icon: "hourglass-low",
    title: "Retirement dates",
    body: "Height safety gear has a hard expiry regardless of condition. RigTrak tracks it alongside the inspection cycle and condemns on schedule.",
    span: "lp-b-6",
  },
  {
    icon: "map-pin",
    title: "Locations that match reality",
    body: "Yard, shed, container, truck — model the places your gear actually lives, not an abstract warehouse bin.",
    span: "lp-b-6",
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
    title: "Built for the yard, not the office",
    body: "Big touch targets, high contrast, and a layout that survives gloves and daylight. The interface assumes you're standing up.",
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

const FAQS = [
  {
    q: "What is RFID and why use it for rigging gear?",
    a: "An RFID tag is a small chip with a unique code (an EPC) that a reader picks up over radio, without needing to see it. For rigging that matters because gear lives in tangled piles, inside containers and on the back of trucks. A reader can identify a hundred tagged items in the time it takes to read one stamped serial number by hand.",
  },
  {
    q: "Do I have to re-enter my existing register?",
    a: "No. RigTrak imports the spreadsheet register you already keep. It reads serial numbers, descriptions, capacities, locations and inspection dates, matches what it recognises, and flags anything ambiguous for review rather than guessing. Untagged rows sit in the system until you link a tag to them.",
  },
  {
    q: "Can one asset be on more than one inspection cycle?",
    a: "Yes, and this is deliberate. A single item might need a quarterly visual and an annual thorough examination. RigTrak keeps each cycle separate with its own last-inspected date, then derives one compliance date from whichever falls soonest — including a hard retirement date if the item has one.",
  },
  {
    q: "What happens when gear is overdue or condemned?",
    a: "Assets carry a status of Active, Quarantine, Condemned or Unregistered. Anything overdue is flagged in the asset list and in the alerts banner. Condemned gear stays in the register rather than being deleted, so the history of why it left service is intact.",
  },
  {
    q: "How does a location check work?",
    a: "Pick a location, scan it, and RigTrak compares the tags it read against the assets it expected to find there. You get three lists: found, missing, and unexpected items that belong somewhere else. You can note the strays as you go.",
  },
  {
    q: "What can I get out of it for an auditor?",
    a: "A PDF report of the register or a specific check, with inspector name, ticket details, dates and status against each line, plus Excel export if the auditor wants to filter it themselves.",
  },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="lp" id="top">
      <div className="lp-atmos" aria-hidden="true">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />
      </div>
      <div className="lp-grain" aria-hidden="true" />

      <Nav
        menuOpen={menuOpen}
        onToggleMenu={setMenuOpen}
        onLogin={() => setLoginOpen(true)}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <div className="lp-content">
        {/* ---------------------------------------------------------- HERO */}
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-grid">
            <Reveal>
              <span className="lp-eyebrow">
                <span className="lp-dot" />
                RFID asset &amp; compliance tracking
              </span>

              <h1 className="lp-h1">
                Rigging compliance that <span className="lp-accent">holds under load</span>
              </h1>

              <p className="lp-lead">
                RigTrak tags your lifting and height safety gear, reads it by radio, and keeps
                every inspection cycle current — from the yard to the audit, without a
                clipboard in sight.
              </p>

              <div className="lp-hero-ticks">
                <span className="lp-tick">
                  <Icon name="circle-check" /> Tag once, scan forever
                </span>
                <span className="lp-tick">
                  <Icon name="circle-check" /> Every cycle tracked
                </span>
                <span className="lp-tick">
                  <Icon name="circle-check" /> Audit-ready exports
                </span>
              </div>

              <div className="lp-hero-ctas">
                <button className="lp-btn lp-btn-primary" onClick={() => setLoginOpen(true)}>
                  Log in to your yard
                  <span className="lp-btn-icon">
                    <Icon name="arrow-up-right" />
                  </span>
                </button>
                <a href="#platform" className="lp-btn lp-btn-ghost">
                  See how it works
                  <span className="lp-btn-icon">
                    <Icon name="arrow-down" />
                  </span>
                </a>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="lp-shell">
                <div className="lp-core">
                  <div className="lp-panel-head">
                    <span className="lp-panel-title">Yard — Location check</span>
                    <span className="lp-live">
                      <span className="lp-live-dot" />
                      Scanning
                    </span>
                  </div>

                  <div className="lp-panel-rows">
                    <div className="lp-row">
                      <div className="lp-row-name">
                        4t Round Sling 3m
                        <div className="lp-row-sub">RT-000147 · Annual · Yard</div>
                      </div>
                      <span className="lp-pill lp-pill-ok">Found</span>
                    </div>
                    <div className="lp-row">
                      <div className="lp-row-name">
                        Bow Shackle 6.5t
                        <div className="lp-row-sub">RT-000212 · Quarterly · Yard</div>
                      </div>
                      <span className="lp-pill lp-pill-ok">Found</span>
                    </div>
                    <div className="lp-row">
                      <div className="lp-row-name">
                        Chain Block 2t
                        <div className="lp-row-sub">RT-000088 · Six-monthly · 12d</div>
                      </div>
                      <span className="lp-pill lp-pill-due">Due soon</span>
                    </div>
                    <div className="lp-row">
                      <div className="lp-row-name">
                        Fall Arrest Harness
                        <div className="lp-row-sub">RT-000301 · Retires 2026</div>
                      </div>
                      <span className="lp-pill lp-pill-over">Missing</span>
                    </div>
                    <div className="lp-row">
                      <div className="lp-row-name">
                        Lever Hoist 1.5t
                        <div className="lp-row-sub">RT-000163 · Monthly · Truck 2</div>
                      </div>
                      <span className="lp-pill lp-pill-due">Unexpected</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------------- STRIP */}
        <div className="lp-strip">
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-strip-grid">
                <span className="lp-strip-item">
                  <Icon name="wifi" /> Passive UHF RFID
                </span>
                <span className="lp-strip-item">
                  <Icon name="file-spreadsheet" /> Excel import &amp; export
                </span>
                <span className="lp-strip-item">
                  <Icon name="device-mobile" /> Works on the handheld
                </span>
                <span className="lp-strip-item">
                  <Icon name="cloud-lock" /> Your register, exportable
                </span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ----------------------------------------------------- PLATFORM */}
        <section className="lp-section" id="platform">
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-head">
                <span className="lp-eyebrow">
                  <span className="lp-dot" />
                  The platform
                </span>
                <h2 className="lp-h2">
                  Track smarter. <span className="lp-accent">Prove it faster.</span>
                </h2>
                <p className="lp-lead">
                  Three things decide whether a register survives an audit: knowing what you own,
                  knowing when it was last looked at, and being able to show both on demand.
                  RigTrak is built around exactly those.
                </p>
              </div>
            </Reveal>

            <div className="lp-grid-3">
              {SERVICES.map((s, i) => (
                <Reveal key={s.title} delay={i * 100}>
                  <div className="lp-shell lp-shell-i" style={{ height: "100%" }}>
                    <div className="lp-core">
                      <div className="lp-card-icon">
                        <Icon name={s.icon} />
                      </div>
                      <h3 className="lp-card-title">{s.title}</h3>
                      <p className="lp-card-body">{s.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ METRICS */}
        <section className="lp-section" style={{ paddingBlockStart: 0 }}>
          <div className="lp-wrap">
            <div className="lp-grid-3">
              {METRICS.map((m, i) => (
                <Reveal key={m.value} delay={i * 100}>
                  <div className="lp-shell lp-shell-i" style={{ height: "100%" }}>
                    <div className="lp-core">
                      <div className="lp-metric">{m.value}</div>
                      <p className="lp-metric-sub">{m.sub}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- CAPABILITIES */}
        <section className="lp-section" id="capabilities">
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-head">
                <span className="lp-eyebrow">
                  <span className="lp-dot" />
                  Capabilities
                </span>
                <h2 className="lp-h2">Everything the yard actually does</h2>
                <p className="lp-lead">
                  Gear moves, gets borrowed, goes missing and comes back. RigTrak models the
                  messy parts rather than pretending they don&apos;t happen.
                </p>
              </div>
            </Reveal>

            <div className="lp-bento">
              {CAPABILITIES.map((c, i) => (
                <Reveal key={c.title} delay={(i % 2) * 80} className={c.span}>
                  <div className="lp-shell lp-shell-i lp-b-tall" style={{ height: "100%" }}>
                    <div className="lp-core">
                      <div>
                        <div className="lp-card-icon">
                          <Icon name={c.icon} />
                        </div>
                        <h3 className="lp-card-title">{c.title}</h3>
                        <p className="lp-card-body">{c.body}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- INDUSTRIES */}
        <section className="lp-section" id="industries">
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-head lp-head-center">
                <span className="lp-eyebrow">
                  <span className="lp-dot" />
                  Industries
                </span>
                <h2 className="lp-h2">Wherever gear is rated and inspected</h2>
                <p className="lp-lead">
                  If it has a working load limit stamped on it, someone has to prove it was
                  checked. That someone is usually holding a spreadsheet.
                </p>
              </div>
            </Reveal>

            <div className="lp-grid-3">
              {INDUSTRIES.map((ind, i) => (
                <Reveal key={ind.name} delay={(i % 3) * 90}>
                  <div className="lp-shell lp-shell-i">
                    <div className="lp-core lp-ind">
                      <span className="lp-ind-icon">
                        <Icon name={ind.icon} />
                      </span>
                      <span>
                        <span className="lp-ind-name">{ind.name}</span>
                        <span className="lp-ind-sub" style={{ display: "block" }}>
                          {ind.sub}
                        </span>
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- QUOTE */}
        <section className="lp-section" style={{ paddingBlockStart: 0 }}>
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-shell">
                <div className="lp-core" style={{ padding: "clamp(2.5rem, 5vw, 4rem)" }}>
                  <div className="lp-quote-mark">&ldquo;</div>
                  <p className="lp-quote">
                    Placeholder testimonial — swap this for a real quote from a real customer
                    before this page goes anywhere near production.
                  </p>
                  <div className="lp-attrib">
                    <span className="lp-avatar">
                      <Icon name="user" />
                    </span>
                    <span>
                      <span className="lp-attrib-name" style={{ display: "block" }}>
                        Name pending
                      </span>
                      <span className="lp-attrib-role">Role, Company</span>
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ----------------------------------------------------------- WHY */}
        <section className="lp-section" style={{ paddingBlockStart: 0 }}>
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-head">
                <span className="lp-eyebrow">
                  <span className="lp-dot" />
                  Why RigTrak
                </span>
                <h2 className="lp-h2">Made for people wearing gloves</h2>
              </div>
            </Reveal>

            <div className="lp-grid-3">
              {WHY.map((w, i) => (
                <Reveal key={w.title} delay={i * 100}>
                  <div className="lp-shell lp-shell-i" style={{ height: "100%" }}>
                    <div className="lp-core">
                      <div className="lp-card-icon">
                        <Icon name={w.icon} />
                      </div>
                      <h3 className="lp-card-title">{w.title}</h3>
                      <p className="lp-card-body">{w.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- FAQ */}
        <section className="lp-section" id="faq" style={{ paddingBlockStart: 0 }}>
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-head lp-head-center">
                <span className="lp-eyebrow">
                  <span className="lp-dot" />
                  FAQ
                </span>
                <h2 className="lp-h2">The questions that come up first</h2>
              </div>
            </Reveal>

            <Reveal>
              <div className="lp-faq-list">
                {FAQS.map((f, i) => (
                  <div
                    key={f.q}
                    className="lp-shell lp-faq-item"
                    data-open={openFaq === i}
                  >
                    <button
                      className="lp-faq-q"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      aria-expanded={openFaq === i}
                    >
                      {f.q}
                      <span className="lp-faq-sign">
                        <Icon name="plus" />
                      </span>
                    </button>
                    <div className="lp-faq-a">
                      <div className="lp-faq-a-inner">
                        <p>{f.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ----------------------------------------------------------- CTA */}
        <section className="lp-section lp-cta" style={{ paddingBlockStart: 0 }}>
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-shell">
                <div className="lp-core">
                  <span className="lp-eyebrow">
                    <span className="lp-dot" />
                    Get started
                  </span>
                  <h2 className="lp-h2">
                    Ready to know what&apos;s <span className="lp-accent">actually</span> in the
                    yard?
                  </h2>
                  <p className="lp-lead">
                    Sign in and take the demo register for a walk. No setup, no sales call.
                  </p>
                  <div className="lp-cta-btns">
                    <button
                      className="lp-btn lp-btn-primary"
                      onClick={() => setLoginOpen(true)}
                    >
                      Log in to your yard
                      <span className="lp-btn-icon">
                        <Icon name="arrow-up-right" />
                      </span>
                    </button>
                    <a href="#platform" className="lp-btn lp-btn-ghost">
                      Read the platform tour
                      <span className="lp-btn-icon">
                        <Icon name="arrow-up" />
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* -------------------------------------------------------- FOOTER */}
        <footer className="lp-footer">
          <div className="lp-wrap">
            <div className="lp-footer-grid">
              <div>
                <div className="lp-footer-logo">
                  Rig<span>Trak</span>
                </div>
                <p className="lp-footer-blurb">
                  RFID asset and compliance tracking for rigging, lifting and height safety gear.
                </p>
              </div>

              <div className="lp-footer-col">
                <div className="lp-footer-h">Platform</div>
                <ul>
                  <li>
                    <a href="#platform">RFID scanning</a>
                  </li>
                  <li>
                    <a href="#platform">Compliance cycles</a>
                  </li>
                  <li>
                    <a href="#capabilities">Check-out &amp; check-in</a>
                  </li>
                  <li>
                    <a href="#capabilities">Reports &amp; exports</a>
                  </li>
                </ul>
              </div>

              <div className="lp-footer-col">
                <div className="lp-footer-h">Industries</div>
                <ul>
                  {INDUSTRIES.slice(0, 4).map((i) => (
                    <li key={i.name}>
                      <a href="#industries">{i.name}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lp-footer-col">
                <div className="lp-footer-h">Company</div>
                <ul>
                  <li>
                    <a href="#faq">FAQ</a>
                  </li>
                  <li>
                    <a href="#top">Who we are</a>
                  </li>
                  <li>
                    <a href="#top">Contact</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lp-footer-base">
              <span>© {new Date().getFullYear()} RigTrak. All rights reserved.</span>
              <span>Built for the yard.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
