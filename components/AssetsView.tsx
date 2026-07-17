"use client";

import { useMemo, useRef } from "react";
import { useStore } from "@/context/store";
import { daysUntil, formatDateAU, getSerial, sortAssets } from "@/lib/helpers";
import { assetCard, badge, badgeTone, btn, btnFull, btnSm, card, cx } from "@/lib/styles";
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

const selectEl =
  "h-12 rounded-app border border-edge bg-steel px-2.5 py-3 text-[15px] text-fg focus:border-orange focus:outline-none";

const th = "px-[14px] py-[11px] text-left text-[11px] font-bold uppercase tracking-[0.8px] text-dim";
const td = "overflow-hidden border-b border-edge px-[14px] py-[13px] align-middle text-sm last:pr-[18px]";
/** Compact icon button for the desktop table's row actions. Must go through cx:
    the padding here has to beat btnSm's, and only twMerge guarantees that. */
const rowBtn = cx(btn.icon, btnSm, "min-h-auto min-w-auto px-2 py-1.5");

function AssetCard({ asset }: { asset: Asset }) {
  const { selectedIds, toggleSelect, openView } = useStore();
  const isSelected = selectedIds.has(asset.id);
  const diff = daysUntil(asset.complianceDate);
  const edge =
    diff === null ? "" : diff < 0 ? "border-l-[3px] border-l-red" : diff <= 30 ? "border-l-[3px] border-l-yellow" : "";
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
      className={cx(assetCard, edge)}
      onClick={handleTap}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
    >
      <div
        className={cx(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2",
          isSelected ? "border-orange bg-orange" : "border-edge",
        )}
      >
        {isSelected ? "✓" : ""}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-bold">
          {asset.name || <span className="text-muted">Tap to register</span>}
        </div>
        <div className="mt-1 truncate text-xs text-dim">
          {asset.location ? asset.location + " · " : ""}
          {serial ? "S/N " + serial : "no serial number"}
        </div>
      </div>
      {!asset.epc && <span className={cx(badge, badgeTone.unregistered)}>Untagged</span>}
      {asset.checkedOut && (
        <span className={cx(badge, badgeTone.quarantine)}>
          <Icon name="truck" /> Out: {asset.checkedOutTo}
        </span>
      )}
      <StatusBadge status={asset.status} />
      <div className="shrink-0 text-xl text-dim">›</div>
    </div>
  );
}

function AssetRow({ asset }: { asset: Asset }) {
  const { selectedIds, toggleSelect, openView, openEdit, deleteAsset } = useStore();
  const serial = getSerial(asset);

  return (
    <tr
      onClick={() => openView(asset.id)}
      className="cursor-pointer hover:bg-white/[0.02] last:[&>td]:border-b-0"
    >
      <td className={td}>
        <input
          type="checkbox"
          checked={selectedIds.has(asset.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleSelect(asset.id)}
        />
      </td>
      <td className={td}>
        <div className="font-bold break-words whitespace-normal">
          {asset.name || <span className="text-muted">Unregistered</span>}
        </div>
        {asset.description && (
          <div className="text-xs break-words whitespace-normal text-dim">{asset.description}</div>
        )}
      </td>
      <td className={td}>
        {serial ? (
          <span className="block max-w-[160px] truncate font-mono text-[11px] text-dim">{serial}</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className={cx(td, "truncate whitespace-nowrap")}>
        {asset.location || <span className="text-muted">—</span>}
      </td>
      <td className={td}>
        <StatusBadge status={asset.status} />
        {!asset.epc && <span className={cx(badge, badgeTone.unregistered)}> Untagged</span>}
      </td>
      <td className={td}>
        <ComplianceDisplay dateStr={asset.complianceDate} />
      </td>
      <td className={cx(td, "truncate whitespace-nowrap text-xs text-dim")}>
        {asset.lastChecked ? formatDateAU(asset.lastChecked) : "—"}
      </td>
      <td className={td}>
        <div className="flex justify-end gap-1.5">
          <button
            className={rowBtn}
            onClick={(e) => {
              e.stopPropagation();
              openEdit(asset.id);
            }}
          >
            <Icon name="pencil" />
          </button>
          <button
            className={cx(rowBtn, "text-red")}
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
        <div className="mb-3 flex items-center gap-3 rounded-app border border-green/35 bg-green/10 px-[14px] py-3">
          <Icon name="circle-check" className="text-[22px] text-green" />
          <div className="flex-1 text-sm">
            {importReviewCount} item{importReviewCount !== 1 ? "s" : ""} imported —{" "}
            {importReviewCount !== 1 ? "they need" : "it needs"} RFID tags linked.
          </div>
          <button className={cx(btn.primary, btnSm)} onClick={reviewImportedAssets}>
            Review
          </button>
          <button className={cx(btn.icon, btnSm)} onClick={dismissImportBanner}>
            <Icon name="x" />
          </button>
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <input
          className="h-12 min-w-[140px] flex-1 rounded-app border border-edge bg-steel px-[14px] py-3 text-base text-fg placeholder:text-muted focus:border-orange focus:outline-none"
          type="search"
          placeholder="Search assets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={selectEl} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Quarantine">Quarantine</option>
          <option value="Condemned">Condemned</option>
          <option value="Untagged">Untagged</option>
          <option value="CheckedOut">Checked Out</option>
        </select>
        <select className={selectEl} value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-0.5">
        {SORTS.map((s) => (
          <button
            key={s.key}
            className={cx(
              "shrink-0 cursor-pointer whitespace-nowrap rounded-[20px] border px-3 py-1.5 text-xs font-bold",
              sort === s.key ? "border-orange bg-orange text-white" : "border-edge bg-panel text-dim",
            )}
            onClick={() => setSort(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <BulkBar visibleIds={visibleIds} />

      {loading ? (
        <div className="flex items-center justify-center gap-3 p-12 text-dim">
          <div className="h-6 w-6 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-edge border-t-orange" />{" "}
          Loading…
        </div>
      ) : isEmpty ? (
        <div className="px-4 py-12 text-center text-dim">
          <div className="mb-[14px] text-[52px]">
            <Icon name="package" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-fg">No assets yet</h3>
          <p className="mb-5 text-sm leading-normal">
            Import a register or add an asset manually to get started.
          </p>
          <button className={cx(btn.primary, btnFull)} onClick={openImport}>
            <Icon name="upload" /> Import Register
          </button>
        </div>
      ) : (
        <>
          {/* Card list on mobile; the table below takes over at 700px. */}
          <div className="flex flex-col gap-2 app:hidden">
            {filtered.length ? (
              filtered.map((a) => <AssetCard key={a.id} asset={a} />)
            ) : (
              <div className="p-8 text-center text-dim">No assets match your search.</div>
            )}
          </div>

          <div className={cx(card, "hidden overflow-x-auto app:block")}>
            <table className="w-full table-fixed border-collapse">
              <thead className="border-b border-edge bg-panel">
                <tr>
                  <th className={cx(th, "w-9")}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked, visibleIds)}
                    />
                  </th>
                  <th className={cx(th, "w-auto")}>Asset</th>
                  <th className={cx(th, "w-[14%]")}>Serial Number</th>
                  <th className={cx(th, "w-[12%]")}>Location</th>
                  <th className={cx(th, "w-[10%]")}>Status</th>
                  <th className={cx(th, "w-[11%]")}>Compliance</th>
                  <th className={cx(th, "w-[11%]")}>Inspection Date</th>
                  <th className={cx(th, "w-20")} />
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
