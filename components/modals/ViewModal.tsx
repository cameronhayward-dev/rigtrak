"use client";

import { useStore } from "@/context/store";
import { formatDateAU, getSchedules, getSerial } from "@/lib/helpers";
import { ComplianceDisplay, Icon, StatusBadge } from "../ui";
import Modal from "./Modal";

function DetailRow({
  label,
  children,
  valueStyle,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value" style={valueStyle}>
        {children}
      </span>
    </div>
  );
}

export default function ViewModal({ assetId }: { assetId: string }) {
  const { assets, closeModal, openEdit, deleteAsset, resolveQuarantine, toast } = useStore();
  const a = assets.find((x) => x.id === assetId);
  if (!a) return null;

  const serial = getSerial(a);

  return (
    <Modal
      title={a.name || "Unregistered Tag"}
      onClose={closeModal}
      footer={
        <>
          <button className="btn-danger btn-sm" onClick={() => deleteAsset(a.id)}>
            Delete
          </button>
          <button className="btn-primary" onClick={() => openEdit(a.id)}>
            <Icon name="pencil" /> Edit
          </button>
        </>
      }
    >
      {a.status === "Quarantine" && (
        <div
          style={{
            background: "rgba(241,196,15,0.12)",
            border: "1px solid rgba(241,196,15,0.4)",
            borderRadius: "var(--radius)",
            padding: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            <Icon name="alert-triangle" style={{ color: "var(--yellow)" }} /> Quarantined — needs a decision
          </div>
          <div style={{ fontSize: 13, color: "var(--dim)", marginBottom: 10, lineHeight: 1.5 }}>
            Repair it back into service, or condemn it if it&apos;s beyond use.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn-sm"
              style={{
                flex: 1,
                background: "var(--green)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius)",
                padding: 8,
              }}
              onClick={() => resolveQuarantine(a.id, "Active")}
            >
              <Icon name="circle-check" /> Back to Service
            </button>
            <button
              className="btn-sm"
              style={{
                flex: 1,
                background: "var(--red)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius)",
                padding: 8,
              }}
              onClick={() => resolveQuarantine(a.id, "Condemned")}
            >
              <Icon name="ban" /> Condemn
            </button>
          </div>
        </div>
      )}

      {a.photo && (
        <img
          src={a.photo}
          alt=""
          style={{
            width: "100%",
            maxHeight: 200,
            objectFit: "cover",
            borderRadius: "var(--radius)",
            marginBottom: 12,
          }}
        />
      )}

      {a.rigtrakId && (
        <DetailRow label="RigTrak ID" valueStyle={{ fontFamily: "monospace" }}>
          {a.rigtrakId}
        </DetailRow>
      )}
      <DetailRow label="Serial Number">{serial || "—"}</DetailRow>
      <DetailRow label="Status">
        <StatusBadge status={a.status} />
        {!a.epc && <span className="badge badge-unregistered"> Untagged</span>}
      </DetailRow>
      {a.checkedOut && (
        <DetailRow label="Checked Out" valueStyle={{ color: "var(--yellow)" }}>
          <Icon name="truck" /> {a.checkedOutTo}
        </DetailRow>
      )}
      <DetailRow label="Location">{a.location || "—"}</DetailRow>
      <DetailRow label="Description">{a.description || "—"}</DetailRow>
      {a.assetCategory && <DetailRow label="Asset Type">{a.assetCategory}</DetailRow>}
      {a.wllValue && (
        <DetailRow label="Capacity">
          {a.wllValue} {a.wllUnit || ""}
        </DetailRow>
      )}
      {a.manufacturer && <DetailRow label="Manufacturer">{a.manufacturer}</DetailRow>}

      {getSchedules(a).map((s, i) => (
        <DetailRow key={i} label={s.type} valueStyle={{ fontSize: 13 }}>
          Inspected {s.lastInspected ? formatDateAU(s.lastInspected) : "—"} · Due{" "}
          {s.nextDue ? <ComplianceDisplay dateStr={s.nextDue} /> : "—"}
        </DetailRow>
      ))}

      {a.retirementDate && (
        <DetailRow label="Retirement / Expiry" valueStyle={{ color: "var(--red)", fontWeight: 600 }}>
          {formatDateAU(a.retirementDate)}
        </DetailRow>
      )}
      {a.inspector && <DetailRow label="Inspector">{a.inspector}</DetailRow>}
      {a.sourceRegister && (
        <DetailRow label="Source Register" valueStyle={{ fontSize: 12 }}>
          {a.sourceRegister}
        </DetailRow>
      )}
      {a.needsReview && (
        <DetailRow label="⚠ Review" valueStyle={{ color: "var(--yellow)" }}>
          {a.needsReview}
        </DetailRow>
      )}

      <div
        style={{
          marginTop: 14,
          padding: 12,
          background: "var(--panel)",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--dim)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 6,
          }}
        >
          <Icon name="certificate" /> Certificates &amp; Documents
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
          Upload test certificates and documents against this asset — coming soon.
        </div>
        <button
          className="btn-secondary btn-sm"
          style={{ marginTop: 10, opacity: 0.5, cursor: "not-allowed" }}
          onClick={() => toast("Certificate uploads are coming soon", "info")}
        >
          <Icon name="upload" /> Upload Certificate
        </button>
      </div>

      <div className="detail-row" style={{ opacity: 0.5, marginTop: 6 }}>
        <span className="detail-label" style={{ fontSize: 10 }}>
          RFID Tag (technical)
        </span>
        <span className="detail-value" style={{ fontFamily: "monospace", fontSize: 11 }}>
          {a.epc || "not linked yet"}
        </span>
      </div>
    </Modal>
  );
}
