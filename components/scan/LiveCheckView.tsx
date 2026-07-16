"use client";

import { useStore } from "@/context/store";
import { exportLocationCheckExcel, exportLocationCheckPDF } from "@/lib/exports";
import { getSerial } from "@/lib/helpers";
import type { Asset } from "@/lib/types";
import { ComplianceFlagBadge, Icon } from "../ui";
import ScanBackButton from "./ScanBackButton";

function ResultCard({
  asset,
  badge,
  showCompliance,
}: {
  asset: Asset;
  badge: "found" | "missing";
  showCompliance?: boolean;
}) {
  const { openView } = useStore();
  return (
    <div className="asset-card" onClick={() => openView(asset.id)}>
      <div className="asset-card-body">
        <div className="asset-card-name">{asset.name}</div>
        <div className="asset-card-sub">
          {getSerial(asset) ? "S/N " + getSerial(asset) : badge === "found" ? asset.description || "" : ""}
        </div>
      </div>
      {showCompliance && <ComplianceFlagBadge asset={asset} />}
      <span className={`badge badge-${badge}`}>{badge === "found" ? "Found" : "Missing"}</span>
      <div className="asset-card-arrow">›</div>
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
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="map-pin-check" />
          </div>
          <h3>Verify a Location</h3>
          <p>
            Pick a location, then scan everything in it. Results update live as you go — found, missing, and
            anything that shouldn&apos;t be there.
          </p>
          <button className="btn-primary btn-full" onClick={openLocationPick}>
            <Icon name="map-pin" /> Pick a Location
          </button>
        </div>
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

      <div className="check-header">
        <div className="check-title">
          <Icon name="map-pin" /> {checkLocationName}{" "}
          <span style={{ color: "var(--green)", fontSize: 12, fontWeight: 700, marginLeft: 6 }}>● LIVE</span>
        </div>
        <div className="check-sub">
          {liveCheckEpcs.size} tag{liveCheckEpcs.size !== 1 ? "s" : ""} scanned this session
        </div>
        <div className="check-summary">
          <div className="check-stat check-stat-found">
            <div className="check-stat-num" style={{ color: "var(--green)" }}>
              {found.length}
            </div>
            <div className="check-stat-label">Found</div>
          </div>
          <div className="check-stat check-stat-missing">
            <div className="check-stat-num" style={{ color: "var(--red)" }}>
              {missing.length}
            </div>
            <div className="check-stat-label">Missing</div>
          </div>
          <div className="check-stat check-stat-missing">
            <div className="check-stat-num" style={{ color: "var(--red)" }}>
              {unexpected.length}
            </div>
            <div className="check-stat-label">Unexpected</div>
          </div>
        </div>
      </div>

      {found.length > 0 && (
        <>
          <div className="section-label">
            <Icon name="circle-check" style={{ color: "var(--green)" }} /> Found ({found.length})
          </div>
          <div className="asset-list">
            {found.map((a) => (
              <ResultCard key={a.id} asset={a} badge="found" showCompliance />
            ))}
          </div>
        </>
      )}

      {missing.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 16 }}>
            <Icon name="circle-x" style={{ color: "var(--red)" }} /> Missing ({missing.length})
          </div>
          <div className="asset-list">
            {missing.map((a) => (
              <ResultCard key={a.id} asset={a} badge="missing" />
            ))}
          </div>
        </>
      )}

      {unexpectedEpcs.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 16 }}>
            <Icon name="flag" style={{ color: "var(--red)" }} /> Unexpected ({unexpectedEpcs.length})
          </div>
          <div className="asset-list">
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

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          className="btn-primary"
          style={{ flex: 1, minWidth: 120 }}
          onClick={() =>
            exportLocationCheckPDF(checkData, company).catch((e) =>
              toast("Export failed: " + (e as Error).message, "error")
            )
          }
        >
          <Icon name="file-type-pdf" /> Export PDF
        </button>
        <button
          className="btn-primary"
          style={{ flex: 1, minWidth: 120 }}
          onClick={() =>
            exportLocationCheckExcel(checkData, company).catch((e) =>
              toast("Export failed: " + (e as Error).message, "error")
            )
          }
        >
          <Icon name="file-spreadsheet" /> Export Excel
        </button>
        <button className="btn-secondary" style={{ flex: 1, minWidth: 120 }} onClick={openLocationPick}>
          <Icon name="map-pin" /> Change Location
        </button>
        <button className="btn-danger" style={{ flex: 1, minWidth: 120 }} onClick={stopLiveCheck}>
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
      className="asset-card"
      style={{ borderLeft: "3px solid var(--red)" }}
      onClick={assetId ? () => openView(assetId) : undefined}
    >
      <div className="asset-card-body">
        <div className="asset-card-name">{name || "Unregistered tag"}</div>
        <div className="asset-card-sub" style={{ color: "var(--red)" }}>
          {label}
        </div>
      </div>
      <div className="asset-card-arrow">›</div>
    </div>
  );
}
