"use client";

import { useStore } from "@/context/store";
import { cx } from "@/lib/styles";
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
    <div className="mb-4 flex gap-0.5 rounded-app bg-panel p-[3px]">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={cx(
            "min-h-11 flex-1 cursor-pointer whitespace-nowrap rounded-md px-1.5 py-3 text-center text-xs font-bold",
            tab === t.key ? "bg-steel text-fg" : "bg-transparent text-dim",
          )}
          onClick={() => switchTab(t.key)}
        >
          {/* Icon stacks above the label rather than sitting inline. */}
          <Icon name={t.icon} className="mx-auto mb-[3px] block align-baseline" /> {t.label}
          {t.key === "scan" && needsActionCount > 0 && (
            <span className="ml-1 inline-block rounded-[10px] bg-red px-1.5 py-px align-middle text-[10px] text-white">
              {needsActionCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
