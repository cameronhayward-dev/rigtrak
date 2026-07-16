"use client";

import { useStore } from "@/context/store";
import { Icon } from "../ui";
import ScanBackButton from "./ScanBackButton";

/** Unmatched scans, collected without a blocking popup so scanning stays fast. */
export default function NeedsActionView() {
  const { assets, openMatch, openEdit, deleteAsset } = useStore();
  const items = assets.filter((a) => !a.name && a.epc);

  return (
    <div>
      <ScanBackButton />

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="mood-check" />
          </div>
          <h3>All caught up</h3>
          <p>
            Scanned tags that don&apos;t match anything in RigTrak yet will show up here — no popups, scan
            freely and sort them out whenever&apos;s convenient.
          </p>
        </div>
      ) : (
        items.map((a) => (
          <div className="needs-action-card" key={a.id}>
            <div className="asset-card-body">
              <div className="asset-card-name" style={{ color: "var(--muted)" }}>
                Unmatched tag
              </div>
              <div className="asset-card-sub" style={{ fontFamily: "monospace", fontSize: 11 }}>
                {a.epc}
              </div>
              <div className="asset-card-sub">
                {a.rigtrakId || ""}
                {a.createdAt
                  ? " · scanned " +
                    new Date(a.createdAt).toLocaleString("en-AU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            </div>
            <div className="needs-action-actions">
              <button className="btn-sm btn-secondary" onClick={() => openMatch(a.id)}>
                <Icon name="link" /> Match to Register
              </button>
              <button className="btn-sm btn-primary" onClick={() => openEdit(a.id)}>
                <Icon name="plus" /> New Asset
              </button>
              <button className="btn-sm btn-danger" onClick={() => deleteAsset(a.id)}>
                <Icon name="trash" /> Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
