"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/context/store";
import { getSerial } from "@/lib/helpers";
import {
  assetArrow,
  assetBody,
  assetCard,
  assetList,
  assetName,
  assetSub,
  cx,
  searchBox,
} from "@/lib/styles";
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
      <p className="mb-3 text-[13px] leading-normal text-dim">
        Find the untagged register item this physical tag belongs to. Tap it to link the EPC.
      </p>
      <input
        className={cx(searchBox, "mb-3")}
        type="search"
        placeholder="Search by description or source ID…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={cx(assetList, "max-h-[50vh] overflow-y-auto")}>
        {untagged.length ? (
          untagged.map((a) => (
            <div className={assetCard} key={a.id} onClick={() => confirmMatch(stubId, a.id)}>
              <div className={assetBody}>
                <div className={assetName}>{a.name}</div>
                <div className={assetSub}>
                  {getSerial(a) ? "S/N " + getSerial(a) + " · " : ""}
                  {a.location || "no location set"}
                </div>
              </div>
              <div className={assetArrow}>›</div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-sm text-dim">
            No untagged register items match. Import a register first, or create a new asset instead.
          </div>
        )}
      </div>
    </Modal>
  );
}
