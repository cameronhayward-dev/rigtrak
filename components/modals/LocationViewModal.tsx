"use client";

import { useStore } from "@/context/store";
import {
  assetArrow,
  assetBody,
  assetCard,
  assetList,
  assetName,
  assetSub,
  badge,
  badgeTone,
  cx,
  sectionLabel,
} from "@/lib/styles";
import { StatusBadge } from "../ui";
import Modal from "./Modal";

export default function LocationViewModal({ locationName }: { locationName: string }) {
  const { assets, closeModal, openView, openEdit } = useStore();

  const registered = assets.filter((a) => a.location === locationName && a.name);
  const unregistered = assets.filter((a) => a.location === locationName && !a.name);
  const isEmpty = registered.length === 0 && unregistered.length === 0;

  return (
    <Modal title={locationName} onClose={closeModal}>
      {isEmpty && <div className="p-8 text-center text-dim">No assets assigned here yet.</div>}

      {registered.length > 0 && (
        <div className={assetList}>
          {registered.map((a) => (
            <div className={assetCard} key={a.id} onClick={() => openView(a.id)}>
              <div className={assetBody}>
                <div className={assetName}>{a.name}</div>
                <div className={assetSub}>{a.description || a.epc}</div>
              </div>
              <StatusBadge status={a.status} />
              <div className={assetArrow}>›</div>
            </div>
          ))}
        </div>
      )}

      {unregistered.length > 0 && (
        <>
          <div className={cx(sectionLabel, registered.length > 0 && "mt-4")}>
            ⚠ Pending ID ({unregistered.length})
          </div>
          <div className={assetList}>
            {unregistered.map((a) => (
              <div className={assetCard} key={a.id} onClick={() => openEdit(a.id)}>
                <div className={assetBody}>
                  <div className={cx(assetName, "text-muted")}>Tap to register</div>
                  <div className={assetSub}>{a.epc}</div>
                </div>
                <span className={cx(badge, badgeTone.unregistered)}>Unreg.</span>
                <div className={assetArrow}>›</div>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
