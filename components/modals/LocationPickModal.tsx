"use client";

import { useStore } from "@/context/store";
import Modal from "./Modal";

export default function LocationPickModal() {
  const { locations, assets, closeModal, pickLocationForCheck } = useStore();

  return (
    <Modal title="Which location are you checking?" onClose={closeModal}>
      <div className="location-picker">
        {locations.map((l) => {
          const count = assets.filter((a) => a.location === l.name && a.name).length;
          return (
            <button key={l.id} className="location-pick-btn" onClick={() => pickLocationForCheck(l.name)}>
              <div>{l.name}</div>
              <div style={{ fontSize: 13, color: "var(--dim)", fontWeight: 400, marginTop: 3 }}>
                {count} registered asset{count !== 1 ? "s" : ""}
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
