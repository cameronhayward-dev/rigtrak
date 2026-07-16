"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/context/store";
import { getSerial } from "@/lib/helpers";
import Modal from "./Modal";

/** Links a scanned tag to the untagged register item it belongs to. */
export default function MatchModal({ stubId }: { stubId: string }) {
  const { assets, closeModal, confirmMatch } = useStore();
  const [search, setSearch] = useState("");

  const untagged = useMemo(() => {
    const q = search.toLowerCase();
    return assets.filter(
      (a) =>
        a.name &&
        !a.epc &&
        (!q ||
          (a.name || "").toLowerCase().includes(q) ||
          getSerial(a).toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) ||
          (a.rigtrakId || "").toLowerCase().includes(q))
    );
  }, [assets, search]);

  return (
    <Modal title="Match to Register Item" onClose={closeModal}>
      <p style={{ color: "var(--dim)", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
        Find the untagged register item this physical tag belongs to. Tap it to link the EPC.
      </p>
      <input
        className="search-box"
        type="search"
        placeholder="Search by description or source ID…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />
      <div className="asset-list" style={{ maxHeight: "50vh", overflowY: "auto" }}>
        {untagged.length ? (
          untagged.map((a) => (
            <div className="asset-card" key={a.id} onClick={() => confirmMatch(stubId, a.id)}>
              <div className="asset-card-body">
                <div className="asset-card-name">{a.name}</div>
                <div className="asset-card-sub">
                  {getSerial(a) ? "S/N " + getSerial(a) + " · " : ""}
                  {a.location || "no location set"}
                </div>
              </div>
              <div className="asset-card-arrow">›</div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: 24, color: "var(--dim)", fontSize: 14 }}>
            No untagged register items match. Import a register first, or create a new asset instead.
          </div>
        )}
      </div>
    </Modal>
  );
}
