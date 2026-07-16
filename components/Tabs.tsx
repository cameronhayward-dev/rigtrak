"use client";

import { useStore } from "@/context/store";
import type { TabKey } from "@/lib/types";
import { Icon } from "./ui";

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: "assets", icon: "package", label: "Assets" },
  { key: "scan", icon: "radar-2", label: "Scan" },
  { key: "locations", icon: "map-pin", label: "Locations" },
  { key: "report", icon: "file-report", label: "Reports" },
];

export default function Tabs() {
  const { tab, switchTab, assets } = useStore();
  const needsActionCount = assets.filter((a) => !a.name && a.epc).length;

  return (
    <div className="tabs">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`tab ${tab === t.key ? "active" : ""}`}
          onClick={() => switchTab(t.key)}
        >
          <Icon name={t.icon} /> {t.label}
          {t.key === "scan" && needsActionCount > 0 && (
            <span className="tab-badge">{needsActionCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}
