"use client";

import { useState } from "react";
import { useStore } from "@/context/store";
import { Icon } from "./ui";

/** Translucent white button, for use on the orange bulk bar. */
const bulkBtn =
  "cursor-pointer rounded-app border border-white/30 bg-white/20 px-3 py-2 text-[13px] font-bold text-white transition-opacity duration-150 active:opacity-70";

export default function BulkBar({ visibleIds }: { visibleIds: string[] }) {
  const { selectedIds, toggleSelectAll, clearSelection, bulkSetLocation, bulkSetStatus, bulkDelete, locations } =
    useStore();
  const [bulkLocation, setBulkLocation] = useState("");

  if (selectedIds.size === 0) return null;

  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-app bg-orange px-4 py-3">
      <div className="text-sm font-bold text-white">{selectedIds.size} selected</div>
      <div className="flex flex-wrap gap-2">
        <button className={bulkBtn} onClick={() => toggleSelectAll(true, visibleIds)}>
          <Icon name="checkbox" /> Select All
        </button>
        <select
          value={bulkLocation}
          onChange={(e) => setBulkLocation(e.target.value)}
          className="h-[34px] rounded-app border border-edge bg-panel px-2 py-1 text-[13px] text-fg"
        >
          <option value="">— location —</option>
          {locations.map((l) => (
            <option key={l.id} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
        <button className={bulkBtn} onClick={() => bulkSetLocation(bulkLocation)}>
          <Icon name="map-pin" /> Set Location
        </button>
        <button className={bulkBtn} onClick={() => bulkSetStatus("Active")}>
          <Icon name="circle-check" /> Active
        </button>
        <button className={bulkBtn} onClick={() => bulkSetStatus("Quarantine")}>
          <Icon name="alert-triangle" /> Quarantine
        </button>
        <button className={bulkBtn} onClick={() => bulkSetStatus("Condemned")}>
          <Icon name="ban" /> Condemn
        </button>
        <button className={bulkBtn} onClick={bulkDelete}>
          <Icon name="trash" /> Delete
        </button>
        <button className={bulkBtn} onClick={clearSelection}>
          <Icon name="x" /> Cancel
        </button>
      </div>
    </div>
  );
}
