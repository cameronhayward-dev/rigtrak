"use client";

import { useMemo } from "react";
import { useStore } from "@/context/store";
import { daysUntil } from "@/lib/helpers";

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
    <div className="stat-card" onClick={onClick}>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color}`}>{value}</div>
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
    <div className="stats-bar">
      <StatCard label="Total" value={show(stats.total)} color="c-orange" onClick={() => filterByStatus("")} />
      <StatCard label="Active" value={show(stats.active)} color="c-green" onClick={() => filterByStatus("Active")} />
      <StatCard
        label="Quarantine"
        value={show(stats.quarantine)}
        color="c-yellow"
        onClick={() => filterByStatus("Quarantine")}
      />
      <StatCard
        label="Condemned"
        value={show(stats.condemned)}
        color="c-red"
        onClick={() => filterByStatus("Condemned")}
      />
      <StatCard
        label="Needs Action"
        value={show(stats.needsAction)}
        color="c-dim"
        onClick={() => {
          switchTab("scan");
          switchScanView("needsaction");
        }}
      />
      <StatCard label="Due Soon" value={show(stats.due)} color="c-yellow" onClick={filterDueSoon} />
    </div>
  );
}
