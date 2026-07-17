"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/context/store";
import { getSerial } from "@/lib/helpers";
import {
  assetBody,
  assetCard,
  assetList,
  assetName,
  assetSub,
  badge,
  badgeTone,
  btn,
  btnFull,
  btnSm,
  card,
  cx,
  formSelect,
  input,
  searchBox,
} from "@/lib/styles";
import type { SessionItem } from "@/lib/types";
import { EmptyState, Icon } from "../ui";
import ScanBackButton from "./ScanBackButton";

const timeOf = (t: string) =>
  new Date(t).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });

const liveHeader = `${card} p-4`;
const liveTitle = "mb-1 text-[17px] font-bold";
const liveSub = "text-[13px] text-dim";
const liveDot = "ml-1.5 text-xs font-bold text-green";
const pickerRow = "mb-4 flex gap-2";

function SessionList({ items, tone }: { items: SessionItem[]; tone: "Out" | "In" }) {
  if (!items.length) {
    return <div className="p-6 text-center text-dim">Scan items now — they&apos;ll appear here.</div>;
  }
  return (
    <>
      {items.map((it, i) => (
        <div className={cx(assetCard, "cursor-default")} key={`${it.time}-${i}`}>
          <div className={assetBody}>
            <div className={assetName}>{it.name}</div>
            <div className={assetSub}>
              {it.serial ? "S/N " + it.serial + " · " : ""}
              {timeOf(it.time)}
            </div>
          </div>
          <span className={cx(badge, tone === "Out" ? badgeTone.quarantine : badgeTone.active)}>{tone}</span>
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
          <EmptyState icon="arrows-exchange" title="Check In / Out &amp; Find">
            Track gear leaving and returning, or hunt down a specific item by scanning around until it turns
            up.
          </EmptyState>
          <div className="flex flex-col gap-2.5">
            <button className={cx(btn.primary, btnFull)} onClick={() => goToInoutState("checkoutPicker")}>
              <Icon name="logout" /> Check Out Gear
            </button>
            <button className={cx(btn.secondary, btnFull)} onClick={() => goToInoutState("checkinPicker")}>
              <Icon name="login" /> Check In Gear
            </button>
            <button className={cx(btn.secondary, btnFull)} onClick={() => goToInoutState("huntPicker")}>
              <Icon name="search" /> Find an Item
            </button>
          </div>
        </>
      )}

      {inoutState === "checkoutPicker" && (
        <>
          <p className="mb-3 text-sm leading-normal text-dim">
            Where&apos;s this gear going? Type a job, truck, or site name — then scan everything heading there.
          </p>
          <div className={pickerRow}>
            <input
              className={cx(input, "flex-1")}
              type="text"
              placeholder="Job, truck, or site name…"
              value={destInput}
              onChange={(e) => setDestInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && beginCheckout(destInput)}
            />
            <button className={btn.primary} onClick={() => beginCheckout(destInput)}>
              Start
            </button>
          </div>
          <button className={cx(btn.secondary, btnFull, "mt-3")} onClick={backToScanMenu}>
            ← Back to Scan
          </button>
        </>
      )}

      {inoutState === "checkoutLive" && (
        <>
          <div className={liveHeader}>
            <div className={liveTitle}>
              <Icon name="logout" /> Checking out to: {checkoutDestination}{" "}
              <span className={liveDot}>● LIVE</span>
            </div>
            <div className={liveSub}>
              {checkoutSessionItems.length} item{checkoutSessionItems.length !== 1 ? "s" : ""} scanned this
              session
            </div>
          </div>
          <div className={cx(assetList, "mt-3")}>
            <SessionList items={checkoutSessionItems} tone="Out" />
          </div>
          <button className={cx(btn.danger, btnFull, "mt-3")} onClick={stopInoutSession}>
            <Icon name="x" /> Done Checking Out
          </button>
        </>
      )}

      {inoutState === "checkinPicker" && (
        <>
          <p className="mb-3 text-sm leading-normal text-dim">Where is this gear returning to?</p>
          <div className={pickerRow}>
            <select
              className={cx(formSelect, "flex-1")}
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
            <button className={btn.primary} onClick={() => beginCheckin(checkinLocation)}>
              Start
            </button>
          </div>
          <button className={cx(btn.secondary, btnFull, "mt-3")} onClick={backToScanMenu}>
            ← Back to Scan
          </button>
        </>
      )}

      {inoutState === "checkinLive" && (
        <>
          <div className={liveHeader}>
            <div className={liveTitle}>
              <Icon name="login" /> Checking in to: {checkinReturnLocation}{" "}
              <span className={liveDot}>● LIVE</span>
            </div>
            <div className={liveSub}>
              {checkinSessionItems.length} item{checkinSessionItems.length !== 1 ? "s" : ""} scanned this
              session
            </div>
          </div>
          <div className={cx(assetList, "mt-3")}>
            <SessionList items={checkinSessionItems} tone="In" />
          </div>
          <button className={cx(btn.danger, btnFull, "mt-3")} onClick={stopInoutSession}>
            <Icon name="x" /> Done Checking In
          </button>
        </>
      )}

      {inoutState === "huntPicker" && (
        <>
          <p className="mb-3 text-sm leading-normal text-dim">
            Search for what you need, tap items to select them (or select all matches), then scan around until
            you&apos;ve found enough. Only tagged items can be searched for.
          </p>
          <input
            className={cx(searchBox, "mb-3")}
            type="search"
            placeholder="Search by name or serial number…"
            value={huntSearch}
            onChange={(e) => setHuntSearch(e.target.value)}
          />
          <div className="mb-3 flex gap-2">
            <button
              className={cx(btn.secondary, btnSm, "flex-1")}
              onClick={() => huntSelectAllMatches(huntMatches.map((a) => a.id))}
            >
              ☑ Select all {huntMatches.length} match{huntMatches.length !== 1 ? "es" : ""}
            </button>
            <button
              className={cx(
                btn.primary,
                btnSm,
                "flex-1",
                !huntSelectedIds.size && "pointer-events-none opacity-40",
              )}
              onClick={beginHunt}
            >
              Start Finding ({huntSelectedIds.size})
            </button>
          </div>
          <div className={cx(assetList, "max-h-[45vh] overflow-y-auto")}>
            {huntMatches.length ? (
              huntMatches.slice(0, 100).map((a) => (
                <div className={assetCard} key={a.id} onClick={() => huntToggleSelect(a.id)}>
                  <div
                    className={cx(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2",
                      huntSelectedIds.has(a.id) ? "border-orange bg-orange" : "border-edge",
                    )}
                  >
                    {huntSelectedIds.has(a.id) ? "✓" : ""}
                  </div>
                  <div className={assetBody}>
                    <div className={assetName}>{a.name}</div>
                    <div className={assetSub}>
                      {getSerial(a) ? "S/N " + getSerial(a) + " · " : ""}
                      {a.location || ""}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-dim">
                No tagged items match. Only items with a linked tag can be searched for.
              </div>
            )}
          </div>
          <button className={cx(btn.secondary, btnFull, "mt-3")} onClick={backToScanMenu}>
            ← Back to Scan
          </button>
        </>
      )}

      {inoutState === "huntLive" && (
        <HuntLive targets={huntTargets} foundEpcs={huntFoundEpcs} onStop={stopInoutSession} />
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
      <div className={cx(liveHeader, "text-center")}>
        <div className={liveTitle}>
          <Icon name="search" /> Finding: {foundCount} of {targets.length} found{" "}
          {allFound && <span className="text-green">— all found!</span>}
        </div>
        <div className={liveSub}>
          Scan anywhere — no need to pick a location. Stop whenever you&apos;ve got enough.
        </div>
      </div>
      <div className={cx(assetList, "mt-3")}>
        {ordered.map((t) => (
          <div
            className={cx(
              assetCard,
              "cursor-default",
              foundEpcs.has(t.epc) && "border-l-[3px] border-l-green",
            )}
            key={t.id}
          >
            <div className={assetBody}>
              <div className={assetName}>{t.name}</div>
              <div className={assetSub}>
                {t.serial ? "S/N " + t.serial + " · " : ""}
                {t.location || ""}
              </div>
            </div>
            <span className={cx(badge, foundEpcs.has(t.epc) ? badgeTone.found : badgeTone.unregistered)}>
              {foundEpcs.has(t.epc) ? "Found" : "Not yet"}
            </span>
          </div>
        ))}
      </div>
      <button
        className={cx(allFound ? btn.primary : btn.danger, btnFull, "mt-3")}
        onClick={onStop}
      >
        {allFound ? (
          "Done"
        ) : (
          <>
            <Icon name="x" /> Stop Searching
          </>
        )}
      </button>
    </>
  );
}
