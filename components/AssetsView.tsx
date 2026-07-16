"use client";

import { useMemo, useRef } from "react";
import { useStore } from "@/context/store";
import { daysUntil, formatDateAU, getSerial, sortAssets } from "@/lib/helpers";
import type { Asset, SortKey } from "@/lib/types";
import { ComplianceDisplay, Icon, StatusBadge } from "./ui";
import AlertsBanner from "./AlertsBanner";
import BulkBar from "./BulkBar";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "name", label: "A–Z" },
  { key: "compliance", label: "Compliance" },
  { key: "status", label: "Status" },
  { key: "recent", label: "Recent" },
];

function AssetCard({ asset }: { asset: Asset }) {
  const { selectedIds, toggleSelect, openView } = useStore();
  const isSelected = selectedIds.has(asset.id);
  const diff = daysUntil(asset.complianceDate);
  const cardClass = diff === null ? "" : diff < 0 ? "overdue" : diff <= 30 ? "due-soon" : "";
  const serial = getSerial(asset);

  // Long press enters select mode on mobile.
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPress = () => {
    pressTimer.current = setTimeout(() => toggleSelect(asset.id), 600);
  };
  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleTap = () => {
    // Once anything is selected, tapping keeps selecting rather than opening.
    if (selectedIds.size > 0) toggleSelect(asset.id);
    else openView(asset.id);
  };

  return (
    <div
      className={`asset-card ${cardClass}`}
      onClick={handleTap}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
    >
      <div className={`select-checkbox ${isSelected ? "checked" : ""}`}>{isSelected ? "✓" : ""}</div>
      <div className="asset-card-body">
        <div className="asset-card-name">
          {asset.name || <span style={{ color: "var(--muted)" }}>Tap to register</span>}
        </div>
        <div className="asset-card-sub">
          {asset.location ? asset.location + " · " : ""}
          {serial ? "S/N " + serial : "no serial number"}
        </div>
      </div>
      {!asset.epc && <span className="badge badge-unregistered">Untagged</span>}
      {asset.checkedOut && (
        <span className="badge badge-quarantine">
          <Icon name="truck" /> Out: {asset.checkedOutTo}
        </span>
      )}
      <StatusBadge status={asset.status} />
      <div className="asset-card-arrow">›</div>
    </div>
  );
}

function AssetRow({ asset }: { asset: Asset }) {
  const { selectedIds, toggleSelect, openView, openEdit, deleteAsset } = useStore();
  const serial = getSerial(asset);

  return (
    <tr onClick={() => openView(asset.id)}>
      <td>
        <input
          type="checkbox"
          checked={selectedIds.has(asset.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleSelect(asset.id)}
        />
      </td>
      <td style={{ overflow: "hidden" }}>
        <div style={{ fontWeight: 700, whiteSpace: "normal", overflowWrap: "break-word" }}>
          {asset.name || <span style={{ color: "var(--muted)" }}>Unregistered</span>}
        </div>
        {asset.description && (
          <div
            style={{
              fontSize: 12,
              color: "var(--dim)",
              whiteSpace: "normal",
              overflowWrap: "break-word",
            }}
          >
            {asset.description}
          </div>
        )}
      </td>
      <td style={{ overflow: "hidden" }}>
        {serial ? <span className="epc-code">{serial}</span> : <span style={{ color: "var(--muted)" }}>—</span>}
      </td>
      <td style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {asset.location || <span style={{ color: "var(--muted)" }}>—</span>}
      </td>
      <td style={{ overflow: "hidden" }}>
        <StatusBadge status={asset.status} />
        {!asset.epc && <span className="badge badge-unregistered"> Untagged</span>}
      </td>
      <td style={{ overflow: "hidden" }}>
        <ComplianceDisplay dateStr={asset.complianceDate} />
      </td>
      <td
        style={{
          fontSize: 12,
          color: "var(--dim)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {asset.lastChecked ? formatDateAU(asset.lastChecked) : "—"}
      </td>
      <td>
        <div className="row-actions">
          <button
            className="btn-icon btn-sm"
            style={{ minWidth: "auto", minHeight: "auto", padding: "6px 8px" }}
            onClick={(e) => {
              e.stopPropagation();
              openEdit(asset.id);
            }}
          >
            <Icon name="pencil" />
          </button>
          <button
            className="btn-icon btn-sm"
            style={{ minWidth: "auto", minHeight: "auto", padding: "6px 8px", color: "var(--red)" }}
            onClick={(e) => {
              e.stopPropagation();
              deleteAsset(asset.id);
            }}
          >
            <Icon name="trash" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AssetsView() {
  const {
    assets,
    locations,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
    sort,
    setSort,
    selectedIds,
    toggleSelectAll,
    openImport,
    importReviewCount,
    reviewImportedAssets,
    dismissImportBanner,
  } = useStore();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = assets
      .filter((a) => a.name)
      .filter((a) => {
        const serial = getSerial(a).toLowerCase();
        const matchSearch =
          !q ||
          (a.name || "").toLowerCase().includes(q) ||
          serial.includes(q) ||
          (a.epc || "").toLowerCase().includes(q) ||
          (a.location || "").toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) ||
          (a.rigtrakId || "").toLowerCase().includes(q);
        const matchStatus =
          !statusFilter ||
          (statusFilter === "Untagged"
            ? !a.epc
            : statusFilter === "CheckedOut"
              ? a.checkedOut
              : a.status === statusFilter);
        return matchSearch && matchStatus && (!locationFilter || a.location === locationFilter);
      });
    return sortAssets(list, sort);
  }, [assets, search, statusFilter, locationFilter, sort]);

  const visibleIds = filtered.map((a) => a.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const isEmpty = assets.filter((a) => a.name).length === 0;

  return (
    <div>
      <AlertsBanner />

      {importReviewCount !== null && (
        <div
          style={{
            background: "rgba(46,204,113,0.1)",
            border: "1px solid rgba(46,204,113,0.35)",
            borderRadius: "var(--radius)",
            padding: "12px 14px",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Icon name="circle-check" style={{ color: "var(--green)", fontSize: 22 }} />
          <div style={{ flex: 1, fontSize: 14 }}>
            {importReviewCount} item{importReviewCount !== 1 ? "s" : ""} imported —{" "}
            {importReviewCount !== 1 ? "they need" : "it needs"} RFID tags linked.
          </div>
          <button className="btn-primary btn-sm" onClick={reviewImportedAssets}>
            Review
          </button>
          <button className="btn-icon btn-sm" onClick={dismissImportBanner}>
            <Icon name="x" />
          </button>
        </div>
      )}

      <div className="toolbar">
        <input
          className="search-box"
          type="search"
          placeholder="Search assets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Quarantine">Quarantine</option>
          <option value="Condemned">Condemned</option>
          <option value="Untagged">Untagged</option>
          <option value="CheckedOut">Checked Out</option>
        </select>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sort-bar">
        {SORTS.map((s) => (
          <button
            key={s.key}
            className={`sort-btn ${sort === s.key ? "active" : ""}`}
            onClick={() => setSort(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <BulkBar visibleIds={visibleIds} />

      {loading ? (
        <div className="loading">
          <div className="spinner" /> Loading…
        </div>
      ) : isEmpty ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="package" />
          </div>
          <h3>No assets yet</h3>
          <p>Import a register or add an asset manually to get started.</p>
          <button className="btn-primary btn-full" onClick={openImport}>
            <Icon name="upload" /> Import Register
          </button>
        </div>
      ) : (
        <>
          <div className="asset-list" id="assetList">
            {filtered.length ? (
              filtered.map((a) => <AssetCard key={a.id} asset={a} />)
            ) : (
              <div style={{ textAlign: "center", padding: 32, color: "var(--dim)" }}>
                No assets match your search.
              </div>
            )}
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked, visibleIds)}
                    />
                  </th>
                  <th style={{ width: "auto" }}>Asset</th>
                  <th style={{ width: "14%" }}>Serial Number</th>
                  <th style={{ width: "12%" }}>Location</th>
                  <th style={{ width: "10%" }}>Status</th>
                  <th style={{ width: "11%" }}>Compliance</th>
                  <th style={{ width: "11%" }}>Inspection Date</th>
                  <th style={{ width: 80 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <AssetRow key={a.id} asset={a} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
