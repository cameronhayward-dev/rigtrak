"use client";

import { useStore } from "@/context/store";
import { exportLocationCheckExcel, exportLocationCheckPDF } from "@/lib/exports";
import { getSerial } from "@/lib/helpers";
import {
  assetArrow,
  assetBody,
  assetCard,
  assetList,
  assetName,
  assetSub,
  badge,
  badgeTone,
  btn,
  btnFull,
  card,
  cx,
  sectionLabel,
} from "@/lib/styles";
import type { Asset } from "@/lib/types";
import { ComplianceFlagBadge, EmptyState, Icon } from "../ui";
import ScanBackButton from "./ScanBackButton";

const checkStat = "rounded-app p-3 text-center";
const checkStatNum = "text-[32px] font-extrabold";
const checkStatLabel = "mt-0.5 text-[11px] uppercase tracking-[0.5px] text-dim";
/** Export/action buttons wrap onto their own rows on narrow screens. */
const actionBtn = "min-w-30 flex-1";

function ResultCard({
  asset,
  tone,
  showCompliance,
}: {
  asset: Asset;
  tone: "found" | "missing";
  showCompliance?: boolean;
}) {
  const { openView } = useStore();
  return (
    <div className={assetCard} onClick={() => openView(asset.id)}>
      <div className={assetBody}>
        <div className={assetName}>{asset.name}</div>
        <div className={assetSub}>
          {getSerial(asset) ? "S/N " + getSerial(asset) : tone === "found" ? asset.description || "" : ""}
        </div>
      </div>
      {showCompliance && <ComplianceFlagBadge asset={asset} />}
      <span className={cx(badge, badgeTone[tone])}>{tone === "found" ? "Found" : "Missing"}</span>
      <div className={assetArrow}>›</div>
    </div>
  );
}

export default function LiveCheckView() {
  const {
    assets,
    checkLocationName,
    liveCheckEpcs,
    checkData,
    openLocationPick,
    stopLiveCheck,
    company,
    toast,
  } = useStore();

  if (!checkLocationName || !checkData) {
    return (
      <div>
        <ScanBackButton />
        <EmptyState
          icon="map-pin-check"
          title="Verify a Location"
          action={
            <button className={cx(btn.primary, btnFull)} onClick={openLocationPick}>
              <Icon name="map-pin" /> Pick a Location
            </button>
          }
        >
          Pick a location, then scan everything in it. Results update live as you go — found, missing, and
          anything that shouldn&apos;t be there.
        </EmptyState>
      </div>
    );
  }

  const { found, missing, unexpected } = checkData;
  const unexpectedEpcs = [...liveCheckEpcs].filter(
    (epc) => !assets.some((a) => a.name && a.location === checkLocationName && a.epc === epc)
  );

  return (
    <div>
      <ScanBackButton />

      <div className={cx(card, "mb-3 p-4")}>
        <div className="mb-1 text-[17px] font-bold">
          <Icon name="map-pin" /> {checkLocationName}{" "}
          <span className="ml-1.5 text-xs font-bold text-green">● LIVE</span>
        </div>
        <div className="text-[13px] text-dim">
          {liveCheckEpcs.size} tag{liveCheckEpcs.size !== 1 ? "s" : ""} scanned this session
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className={cx(checkStat, "border border-green/30 bg-green/10")}>
            <div className={cx(checkStatNum, "text-green")}>{found.length}</div>
            <div className={checkStatLabel}>Found</div>
          </div>
          <div className={cx(checkStat, "border border-red/30 bg-red/10")}>
            <div className={cx(checkStatNum, "text-red")}>{missing.length}</div>
            <div className={checkStatLabel}>Missing</div>
          </div>
          <div className={cx(checkStat, "border border-red/30 bg-red/10")}>
            <div className={cx(checkStatNum, "text-red")}>{unexpected.length}</div>
            <div className={checkStatLabel}>Unexpected</div>
          </div>
        </div>
      </div>

      {found.length > 0 && (
        <>
          <div className={sectionLabel}>
            <Icon name="circle-check" className="text-green" /> Found ({found.length})
          </div>
          <div className={assetList}>
            {found.map((a) => (
              <ResultCard key={a.id} asset={a} tone="found" showCompliance />
            ))}
          </div>
        </>
      )}

      {missing.length > 0 && (
        <>
          <div className={cx(sectionLabel, "mt-4")}>
            <Icon name="circle-x" className="text-red" /> Missing ({missing.length})
          </div>
          <div className={assetList}>
            {missing.map((a) => (
              <ResultCard key={a.id} asset={a} tone="missing" />
            ))}
          </div>
        </>
      )}

      {unexpectedEpcs.length > 0 && (
        <>
          <div className={cx(sectionLabel, "mt-4")}>
            <Icon name="flag" className="text-red" /> Unexpected ({unexpectedEpcs.length})
          </div>
          <div className={assetList}>
            {unexpectedEpcs.map((epc) => {
              const elsewhere = assets.find((a) => a.epc === epc && a.name);
              const label = elsewhere
                ? `Registered at ${elsewhere.location || "no location"} — not here`
                : "Not registered anywhere — added to Needs Action";
              return <UnexpectedCard key={epc} label={label} name={elsewhere?.name} assetId={elsewhere?.id} />;
            })}
          </div>
        </>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className={cx(btn.primary, actionBtn)}
          onClick={() =>
            exportLocationCheckPDF(checkData, company).catch((e) =>
              toast("Export failed: " + (e as Error).message, "error")
            )
          }
        >
          <Icon name="file-type-pdf" /> Export PDF
        </button>
        <button
          className={cx(btn.primary, actionBtn)}
          onClick={() =>
            exportLocationCheckExcel(checkData, company).catch((e) =>
              toast("Export failed: " + (e as Error).message, "error")
            )
          }
        >
          <Icon name="file-spreadsheet" /> Export Excel
        </button>
        <button className={cx(btn.secondary, actionBtn)} onClick={openLocationPick}>
          <Icon name="map-pin" /> Change Location
        </button>
        <button className={cx(btn.danger, actionBtn)} onClick={stopLiveCheck}>
          <Icon name="x" /> Stop Checking
        </button>
      </div>
    </div>
  );
}

function UnexpectedCard({ label, name, assetId }: { label: string; name?: string; assetId?: string }) {
  const { openView } = useStore();
  return (
    <div
      className={cx(assetCard, "border-l-[3px] border-l-red")}
      onClick={assetId ? () => openView(assetId) : undefined}
    >
      <div className={assetBody}>
        <div className={assetName}>{name || "Unregistered tag"}</div>
        <div className={cx(assetSub, "text-red")}>{label}</div>
      </div>
      <div className={assetArrow}>›</div>
    </div>
  );
}
