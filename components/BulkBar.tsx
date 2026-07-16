"use client";

import { useState } from "react";
import { useStore } from "@/context/store";
import { Icon } from "./ui";

export default function BulkBar({ visibleIds }: { visibleIds: string[] }) {
  const { selectedIds, toggleSelectAll, clearSelection, bulkSetLocation, bulkSetStatus, bulkDelete, locations } =
    useStore();
  const [bulkLocation, setBulkLocation] = useState("");

  if (selectedIds.size === 0) return null;

  return (
    <div className="bulk-bar">
      <div className="bulk-bar-left">{selectedIds.size} selected</div>
      <div className="bulk-bar-actions">
        <button className="bulk-btn" onClick={() => toggleSelectAll(true, visibleIds)}>
          <Icon name="checkbox" /> Select All
        </button>
        <select
          value={bulkLocation}
          onChange={(e) => setBulkLocation(e.target.value)}
          style={{
            height: 34,
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            background: "var(--panel)",
            color: "var(--text)",
            fontSize: 13,
            padding: "4px 8px",
          }}
        >
          <option value="">— location —</option>
          {locations.map((l) => (
            <option key={l.id} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
        <button className="bulk-btn" onClick={() => bulkSetLocation(bulkLocation)}>
          <Icon name="map-pin" /> Set Location
        </button>
        <button className="bulk-btn" onClick={() => bulkSetStatus("Active")}>
          <Icon name="circle-check" /> Active
        </button>
        <button className="bulk-btn" onClick={() => bulkSetStatus("Quarantine")}>
          <Icon name="alert-triangle" /> Quarantine
        </button>
        <button className="bulk-btn" onClick={() => bulkSetStatus("Condemned")}>
          <Icon name="ban" /> Condemn
        </button>
        <button className="bulk-btn" onClick={bulkDelete}>
          <Icon name="trash" /> Delete
        </button>
        <button className="bulk-btn" onClick={clearSelection}>
          <Icon name="x" /> Cancel
        </button>
      </div>
    </div>
  );
}
