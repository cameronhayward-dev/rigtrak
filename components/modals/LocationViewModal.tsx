"use client";

import { useStore } from "@/context/store";
import { StatusBadge } from "../ui";
import Modal from "./Modal";

export default function LocationViewModal({ locationName }: { locationName: string }) {
  const { assets, closeModal, openView, openEdit } = useStore();

  const registered = assets.filter((a) => a.location === locationName && a.name);
  const unregistered = assets.filter((a) => a.location === locationName && !a.name);
  const isEmpty = registered.length === 0 && unregistered.length === 0;

  return (
    <Modal title={locationName} onClose={closeModal}>
      {isEmpty && (
        <div style={{ textAlign: "center", padding: 32, color: "var(--dim)" }}>
          No assets assigned here yet.
        </div>
      )}

      {registered.length > 0 && (
        <div className="asset-list">
          {registered.map((a) => (
            <div className="asset-card" key={a.id} onClick={() => openView(a.id)}>
              <div className="asset-card-body">
                <div className="asset-card-name">{a.name}</div>
                <div className="asset-card-sub">{a.description || a.epc}</div>
              </div>
              <StatusBadge status={a.status} />
              <div className="asset-card-arrow">›</div>
            </div>
          ))}
        </div>
      )}

      {unregistered.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: registered.length ? 16 : 0 }}>
            ⚠ Pending ID ({unregistered.length})
          </div>
          <div className="asset-list">
            {unregistered.map((a) => (
              <div className="asset-card" key={a.id} onClick={() => openEdit(a.id)}>
                <div className="asset-card-body">
                  <div className="asset-card-name" style={{ color: "var(--muted)" }}>
                    Tap to register
                  </div>
                  <div className="asset-card-sub">{a.epc}</div>
                </div>
                <span className="badge badge-unregistered">Unreg.</span>
                <div className="asset-card-arrow">›</div>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
