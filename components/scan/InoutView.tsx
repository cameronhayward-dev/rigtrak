"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/context/store";
import { getSerial } from "@/lib/helpers";
import type { SessionItem } from "@/lib/types";
import { Icon } from "../ui";
import ScanBackButton from "./ScanBackButton";

const timeOf = (t: string) =>
  new Date(t).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });

function SessionList({ items, badge }: { items: SessionItem[]; badge: "Out" | "In" }) {
  if (!items.length) {
    return (
      <div style={{ textAlign: "center", padding: 24, color: "var(--dim)" }}>
        Scan items now — they&apos;ll appear here.
      </div>
    );
  }
  return (
    <>
      {items.map((it, i) => (
        <div className="asset-card" style={{ cursor: "default" }} key={`${it.time}-${i}`}>
          <div className="asset-card-body">
            <div className="asset-card-name">{it.name}</div>
            <div className="asset-card-sub">
              {it.serial ? "S/N " + it.serial + " · " : ""}
              {timeOf(it.time)}
            </div>
          </div>
          <span className={`badge ${badge === "Out" ? "badge-quarantine" : "badge-active"}`}>{badge}</span>
        </div>
      ))}
    </>
  );
}

export default function InoutView() {
  const {
    inoutState,
    goToInoutState,
    backToScanMenu,
    locations,
    assets,
    checkoutDestination,
    checkoutSessionItems,
    checkinReturnLocation,
    checkinSessionItems,
    beginCheckout,
    beginCheckin,
    huntTargets,
    huntFoundEpcs,
    huntSelectedIds,
    huntToggleSelect,
    huntSelectAllMatches,
    beginHunt,
    stopInoutSession,
  } = useStore();

  const [destInput, setDestInput] = useState("");
  const [checkinLocation, setCheckinLocation] = useState("");
  const [huntSearch, setHuntSearch] = useState("");

  const huntMatches = useMemo(() => {
    const q = huntSearch.toLowerCase();
    return assets.filter(
      (a) =>
        a.name &&
        a.epc &&
        (!q || a.name.toLowerCase().includes(q) || getSerial(a).toLowerCase().includes(q))
    );
  }, [assets, huntSearch]);

  return (
    <div>
      <ScanBackButton />

      {inoutState === "menu" && (
        <>
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="arrows-exchange" />
            </div>
            <h3>Check In / Out &amp; Find</h3>
            <p>
              Track gear leaving and returning, or hunt down a specific item by scanning around until it turns
              up.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn-primary btn-full" onClick={() => goToInoutState("checkoutPicker")}>
              <Icon name="logout" /> Check Out Gear
            </button>
            <button className="btn-secondary btn-full" onClick={() => goToInoutState("checkinPicker")}>
              <Icon name="login" /> Check In Gear
            </button>
            <button className="btn-secondary btn-full" onClick={() => goToInoutState("huntPicker")}>
              <Icon name="search" /> Find an Item
            </button>
          </div>
        </>
      )}

      {inoutState === "checkoutPicker" && (
        <>
          <p style={{ color: "var(--dim)", fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
            Where&apos;s this gear going? Type a job, truck, or site name — then scan everything heading there.
          </p>
          <div className="add-location-row">
            <input
              type="text"
              placeholder="Job, truck, or site name…"
              value={destInput}
              onChange={(e) => setDestInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && beginCheckout(destInput)}
            />
            <button className="btn-primary" onClick={() => beginCheckout(destInput)}>
              Start
            </button>
          </div>
          <button className="btn-secondary btn-full" style={{ marginTop: 12 }} onClick={backToScanMenu}>
            ← Back to Scan
          </button>
        </>
      )}

      {inoutState === "checkoutLive" && (
        <>
          <div className="check-header">
            <div className="check-title">
              <Icon name="logout" /> Checking out to: {checkoutDestination}{" "}
              <span style={{ color: "var(--green)", fontSize: 12, fontWeight: 700, marginLeft: 6 }}>
                ● LIVE
              </span>
            </div>
            <div className="check-sub">
              {checkoutSessionItems.length} item{checkoutSessionItems.length !== 1 ? "s" : ""} scanned this
              session
            </div>
          </div>
          <div className="asset-list" style={{ marginTop: 12 }}>
            <SessionList items={checkoutSessionItems} badge="Out" />
          </div>
          <button className="btn-danger btn-full" style={{ marginTop: 12 }} onClick={stopInoutSession}>
            <Icon name="x" /> Done Checking Out
          </button>
        </>
      )}

      {inoutState === "checkinPicker" && (
        <>
          <p style={{ color: "var(--dim)", fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
            Where is this gear returning to?
          </p>
          <div className="add-location-row">
            <select
              className="form-select"
              style={{ flex: 1 }}
              value={checkinLocation}
              onChange={(e) => setCheckinLocation(e.target.value)}
            >
              <option value="">— Returning to —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            <button className="btn-primary" onClick={() => beginCheckin(checkinLocation)}>
              Start
            </button>
          </div>
          <button className="btn-secondary btn-full" style={{ marginTop: 12 }} onClick={backToScanMenu}>
            ← Back to Scan
          </button>
        </>
      )}

      {inoutState === "checkinLive" && (
        <>
          <div className="check-header">
            <div className="check-title">
              <Icon name="login" /> Checking in to: {checkinReturnLocation}{" "}
              <span style={{ color: "var(--green)", fontSize: 12, fontWeight: 700, marginLeft: 6 }}>
                ● LIVE
              </span>
            </div>
            <div className="check-sub">
              {checkinSessionItems.length} item{checkinSessionItems.length !== 1 ? "s" : ""} scanned this
              session
            </div>
          </div>
          <div className="asset-list" style={{ marginTop: 12 }}>
            <SessionList items={checkinSessionItems} badge="In" />
          </div>
          <button className="btn-danger btn-full" style={{ marginTop: 12 }} onClick={stopInoutSession}>
            <Icon name="x" /> Done Checking In
          </button>
        </>
      )}

      {inoutState === "huntPicker" && (
        <>
          <p style={{ color: "var(--dim)", fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
            Search for what you need, tap items to select them (or select all matches), then scan around until
            you&apos;ve found enough. Only tagged items can be searched for.
          </p>
          <input
            className="search-box"
            type="search"
            placeholder="Search by name or serial number…"
            value={huntSearch}
            onChange={(e) => setHuntSearch(e.target.value)}
            style={{ width: "100%", marginBottom: 12 }}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              className="btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => huntSelectAllMatches(huntMatches.map((a) => a.id))}
            >
              ☑ Select all {huntMatches.length} match{huntMatches.length !== 1 ? "es" : ""}
            </button>
            <button
              className="btn-primary btn-sm"
              style={{
                flex: 1,
                ...(huntSelectedIds.size ? {} : { opacity: 0.4, pointerEvents: "none" as const }),
              }}
              onClick={beginHunt}
            >
              Start Finding ({huntSelectedIds.size})
            </button>
          </div>
          <div className="asset-list" style={{ maxHeight: "45vh", overflowY: "auto" }}>
            {huntMatches.length ? (
              huntMatches.slice(0, 100).map((a) => (
                <div className="asset-card" key={a.id} onClick={() => huntToggleSelect(a.id)}>
                  <div className={`select-checkbox ${huntSelectedIds.has(a.id) ? "checked" : ""}`}>
                    {huntSelectedIds.has(a.id) ? "✓" : ""}
                  </div>
                  <div className="asset-card-body">
                    <div className="asset-card-name">{a.name}</div>
                    <div className="asset-card-sub">
                      {getSerial(a) ? "S/N " + getSerial(a) + " · " : ""}
                      {a.location || ""}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: 24, color: "var(--dim)" }}>
                No tagged items match. Only items with a linked tag can be searched for.
              </div>
            )}
          </div>
          <button className="btn-secondary btn-full" style={{ marginTop: 12 }} onClick={backToScanMenu}>
            ← Back to Scan
          </button>
        </>
      )}

      {inoutState === "huntLive" && (
        <HuntLive
          targets={huntTargets}
          foundEpcs={huntFoundEpcs}
          onStop={stopInoutSession}
        />
      )}
    </div>
  );
}

function HuntLive({
  targets,
  foundEpcs,
  onStop,
}: {
  targets: ReturnType<typeof useStore>["huntTargets"];
  foundEpcs: Set<string>;
  onStop: () => void;
}) {
  const foundCount = targets.filter((t) => foundEpcs.has(t.epc)).length;
  const allFound = foundCount === targets.length;
  // Found items float to the top so progress is visible at a glance.
  const ordered = [...targets].sort(
    (a, b) => (foundEpcs.has(b.epc) ? 1 : 0) - (foundEpcs.has(a.epc) ? 1 : 0)
  );

  return (
    <>
      <div className="check-header" style={{ textAlign: "center" }}>
        <div className="check-title">
          <Icon name="search" /> Finding: {foundCount} of {targets.length} found{" "}
          {allFound && <span style={{ color: "var(--green)" }}>— all found!</span>}
        </div>
        <div className="check-sub">
          Scan anywhere — no need to pick a location. Stop whenever you&apos;ve got enough.
        </div>
      </div>
      <div className="asset-list" style={{ marginTop: 12 }}>
        {ordered.map((t) => (
          <div
            className="asset-card"
            key={t.id}
            style={{ cursor: "default", ...(foundEpcs.has(t.epc) ? { borderLeft: "3px solid var(--green)" } : {}) }}
          >
            <div className="asset-card-body">
              <div className="asset-card-name">{t.name}</div>
              <div className="asset-card-sub">
                {t.serial ? "S/N " + t.serial + " · " : ""}
                {t.location || ""}
              </div>
            </div>
            {foundEpcs.has(t.epc) ? (
              <span className="badge badge-found">Found</span>
            ) : (
              <span className="badge badge-unregistered">Not yet</span>
            )}
          </div>
        ))}
      </div>
      <button className={`${allFound ? "btn-primary" : "btn-danger"} btn-full`} style={{ marginTop: 12 }} onClick={onStop}>
        {allFound ? "Done" : <><Icon name="x" /> Stop Searching</>}
      </button>
    </>
  );
}
