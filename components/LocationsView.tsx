"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/context/store";
import { btn, btnSm, card, cx, input } from "@/lib/styles";
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
      <div className="mb-4 flex gap-2">
        <input
          className={cx(input, "flex-1")}
          type="text"
          placeholder="New location name…"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button className={btn.primary} onClick={submit}>
          Add
        </button>
      </div>

      {dupeCount > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-app border border-yellow/30 bg-yellow/10 p-3">
          <Icon name="alert-triangle" className="text-xl text-yellow" />
          <div className="flex-1 text-[13px]">
            {dupeCount} location{dupeCount !== 1 ? "s are" : " is"} listed more than once. Merging won&apos;t
            affect your assets.
          </div>
          <button className={cx(btn.warning, btnSm)} onClick={cleanUpDuplicateLocations}>
            Merge
          </button>
        </div>
      )}

      {locations.map((l) => {
        const inLocation = assets.filter((a) => a.location === l.name);
        const registered = inLocation.filter((a) => a.name).length;
        const unregistered = inLocation.filter((a) => !a.name).length;
        return (
          <div
            className={cx(card, "mb-2 flex min-h-16 cursor-pointer items-center justify-between p-4 active:opacity-80")}
            key={l.id}
            onClick={() => openLocationView(l.name)}
          >
            <div>
              <div className="text-base font-bold">{l.name}</div>
              <div className="mt-[3px] text-xs text-dim">
                {registered} asset{registered !== 1 ? "s" : ""}
                {unregistered > 0 ? ` · ${unregistered} pending ID` : ""}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                className={cx(btn.icon, btnSm, "text-red")}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLocation(l.id, l.name);
                }}
              >
                <Icon name="trash" />
              </button>
              <span className="text-xl text-dim">›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
