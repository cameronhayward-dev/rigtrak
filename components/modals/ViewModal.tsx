"use client";

import { useStore } from "@/context/store";
import { formatDateAU, getSchedules, getSerial } from "@/lib/helpers";
import { badge, badgeTone, btn, btnSm, cx } from "@/lib/styles";
import { ComplianceDisplay, Icon, StatusBadge } from "../ui";
import Modal from "./Modal";

const detailRow =
  "flex items-start justify-between gap-3 border-b border-edge py-3 text-[15px] last:border-b-0";
const detailLabel = "shrink-0 mt-0.5 text-xs font-bold uppercase text-dim";
const detailValue = "text-right break-words";

function DetailRow({
  label,
  children,
  valueClass,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className={detailRow}>
      <span className={detailLabel}>{label}</span>
      <span className={cx(detailValue, valueClass)}>{children}</span>
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
          <button className={cx(btn.danger, btnSm)} onClick={() => deleteAsset(a.id)}>
            Delete
          </button>
          <button className={btn.primary} onClick={() => openEdit(a.id)}>
            <Icon name="pencil" /> Edit
          </button>
        </>
      }
    >
      {a.status === "Quarantine" && (
        <div className="mb-3 rounded-app border border-yellow/40 bg-yellow/[0.12] p-3">
          <div className="mb-1 text-sm font-bold">
            <Icon name="alert-triangle" className="text-yellow" /> Quarantined — needs a decision
          </div>
          <div className="mb-2.5 text-[13px] leading-normal text-dim">
            Repair it back into service, or condemn it if it&apos;s beyond use.
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 cursor-pointer rounded-app bg-green p-2 text-[13px] font-bold text-white"
              onClick={() => resolveQuarantine(a.id, "Active")}
            >
              <Icon name="circle-check" /> Back to Service
            </button>
            <button
              className="flex-1 cursor-pointer rounded-app bg-red p-2 text-[13px] font-bold text-white"
              onClick={() => resolveQuarantine(a.id, "Condemned")}
            >
              <Icon name="ban" /> Condemn
            </button>
          </div>
        </div>
      )}

      {a.photo && (
        // eslint-disable-next-line @next/next/no-img-element -- data URI from the device camera
        <img src={a.photo} alt="" className="mb-3 max-h-50 w-full rounded-app object-cover" />
      )}

      {a.rigtrakId && (
        <DetailRow label="RigTrak ID" valueClass="font-mono">
          {a.rigtrakId}
        </DetailRow>
      )}
      <DetailRow label="Serial Number">{serial || "—"}</DetailRow>
      <DetailRow label="Status">
        <StatusBadge status={a.status} />
        {!a.epc && <span className={cx(badge, badgeTone.unregistered)}> Untagged</span>}
      </DetailRow>
      {a.checkedOut && (
        <DetailRow label="Checked Out" valueClass="text-yellow">
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
        <DetailRow key={i} label={s.type} valueClass="text-[13px]">
          Inspected {s.lastInspected ? formatDateAU(s.lastInspected) : "—"} · Due{" "}
          {s.nextDue ? <ComplianceDisplay dateStr={s.nextDue} /> : "—"}
        </DetailRow>
      ))}

      {a.retirementDate && (
        <DetailRow label="Retirement / Expiry" valueClass="font-semibold text-red">
          {formatDateAU(a.retirementDate)}
        </DetailRow>
      )}
      {a.inspector && <DetailRow label="Inspector">{a.inspector}</DetailRow>}
      {a.sourceRegister && (
        <DetailRow label="Source Register" valueClass="text-xs">
          {a.sourceRegister}
        </DetailRow>
      )}
      {a.needsReview && (
        <DetailRow label="⚠ Review" valueClass="text-yellow">
          {a.needsReview}
        </DetailRow>
      )}

      <div className="mt-3.5 rounded-app border border-dashed border-edge bg-panel p-3">
        <div className="mb-1.5 text-xs font-bold uppercase tracking-[0.5px] text-dim">
          <Icon name="certificate" /> Certificates &amp; Documents
        </div>
        <div className="text-[13px] leading-normal text-muted">
          Upload test certificates and documents against this asset — coming soon.
        </div>
        <button
          className={cx(btn.secondary, btnSm, "mt-2.5 cursor-not-allowed opacity-50")}
          onClick={() => toast("Certificate uploads are coming soon", "info")}
        >
          <Icon name="upload" /> Upload Certificate
        </button>
      </div>

      <div className={cx(detailRow, "mt-1.5 opacity-50")}>
        <span className={cx(detailLabel, "text-[10px]")}>RFID Tag (technical)</span>
        <span className={cx(detailValue, "font-mono text-[11px]")}>{a.epc || "not linked yet"}</span>
      </div>
    </Modal>
  );
}
