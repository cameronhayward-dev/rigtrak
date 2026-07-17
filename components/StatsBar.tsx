"use client";

import { useMemo } from "react";
import { useStore } from "@/context/store";
import { daysUntil } from "@/lib/helpers";
import { card, cx } from "@/lib/styles";

function StatCard({
  label,
  value,
  color,
  onClick,
}: {
  label: string;
  value: number | string;
  color: string;
  onClick: () => void;
}) {
  return (
    <div
      className={cx(card, "cursor-pointer px-3 py-[14px] text-center active:opacity-80")}
      onClick={onClick}
    >
      <div className="mb-1.5 text-[10px] uppercase tracking-[0.8px] text-dim">{label}</div>
      <div className={cx("text-[26px] font-extrabold leading-none", color)}>{value}</div>
    </div>
  );
}

export default function StatsBar() {
  const { assets, loading, filterByStatus, filterDueSoon, switchTab, switchScanView } = useStore();

  const stats = useMemo(() => {
    const named = assets.filter((a) => a.name);
    return {
      total: named.length,
      active: named.filter((a) => a.status === "Active").length,
      quarantine: named.filter((a) => a.status === "Quarantine").length,
      condemned: named.filter((a) => a.status === "Condemned").length,
      needsAction: assets.filter((a) => !a.name && a.epc).length,
      due: named.filter((a) => {
        const d = daysUntil(a.complianceDate);
        return d !== null && d <= 30;
      }).length,
    };
  }, [assets]);

  const show = (n: number) => (loading ? "—" : n);

  return (
    <div className="mb-4 grid grid-cols-3 gap-2 app:grid-cols-6">
      <StatCard label="Total" value={show(stats.total)} color="text-orange" onClick={() => filterByStatus("")} />
      <StatCard label="Active" value={show(stats.active)} color="text-green" onClick={() => filterByStatus("Active")} />
      <StatCard
        label="Quarantine"
        value={show(stats.quarantine)}
        color="text-yellow"
        onClick={() => filterByStatus("Quarantine")}
      />
      <StatCard
        label="Condemned"
        value={show(stats.condemned)}
        color="text-red"
        onClick={() => filterByStatus("Condemned")}
      />
      <StatCard
        label="Needs Action"
        value={show(stats.needsAction)}
        color="text-dim"
        onClick={() => {
          switchTab("scan");
          switchScanView("needsaction");
        }}
      />
      <StatCard label="Due Soon" value={show(stats.due)} color="text-yellow" onClick={filterDueSoon} />
    </div>
  );
}
