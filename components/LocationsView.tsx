"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/context/store";
import { Icon } from "./ui";

export default function LocationsView() {
  const { locations, assets, addLocation, deleteLocation, openLocationView, cleanUpDuplicateLocations } =
    useStore();
  const [newLocation, setNewLocation] = useState("");

  const submit = async () => {
    await addLocation(newLocation);
    setNewLocation("");
  };

  // Surface any duplicate location records so they can be merged.
  const dupeCount = useMemo(() => {
    const counts = new Map<string, number>();
    locations.forEach((l) => {
      const key = l.name.trim().toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.values()].filter((n) => n > 1).length;
  }, [locations]);

  return (
    <div>
      <div className="add-location-row">
        <input
          type="text"
          placeholder="New location name…"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button className="btn-primary" onClick={submit}>
          Add
        </button>
      </div>

      {dupeCount > 0 && (
        <div
          style={{
            background: "rgba(241,196,15,0.1)",
            border: "1px solid rgba(241,196,15,0.3)",
            borderRadius: "var(--radius)",
            padding: 12,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Icon name="alert-triangle" style={{ color: "var(--yellow)", fontSize: 20 }} />
          <div style={{ flex: 1, fontSize: 13 }}>
            {dupeCount} location{dupeCount !== 1 ? "s are" : " is"} listed more than once. Merging won&apos;t
            affect your assets.
          </div>
          <button className="btn-warning btn-sm" onClick={cleanUpDuplicateLocations}>
            Merge
          </button>
        </div>
      )}

      {locations.map((l) => {
        const inLocation = assets.filter((a) => a.location === l.name);
        const registered = inLocation.filter((a) => a.name).length;
        const unregistered = inLocation.filter((a) => !a.name).length;
        return (
          <div className="location-card" key={l.id} onClick={() => openLocationView(l.name)}>
            <div>
              <div className="location-name">{l.name}</div>
              <div className="location-count">
                {registered} asset{registered !== 1 ? "s" : ""}
                {unregistered > 0 ? ` · ${unregistered} pending ID` : ""}
              </div>
            </div>
            <div className="location-actions">
              <button
                className="btn-icon btn-sm"
                style={{ color: "var(--red)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLocation(l.id, l.name);
                }}
              >
                <Icon name="trash" />
              </button>
              <span style={{ color: "var(--dim)", fontSize: 20 }}>›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
