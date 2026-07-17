"use client";

import { useMemo, useRef, useState } from "react";
import { useStore } from "@/context/store";
import { deriveComplianceFields, getSchedules, getSerial, isTicketExpired, nextDueFrom, shrinkImage } from "@/lib/helpers";
import {
  btn,
  btnSm,
  cx,
  epcDisplay,
  formGroup,
  formRow,
  formSelect,
  input,
  label,
  textarea,
} from "@/lib/styles";
import { SCHEDULE_TYPES, type Schedule } from "@/lib/types";
import { Icon } from "../ui";
import Modal from "./Modal";

export default function AssetModal({ assetId }: { assetId: string | null }) {
  const { assets, locations, inspectors, closeModal, saveAsset, addLocationInline, toast } = useStore();
  const asset = assetId ? assets.find((a) => a.id === assetId) : null;

  const [name, setName] = useState(asset?.name ?? "");
  const [serial, setSerial] = useState(asset ? getSerial(asset) : "");
  const [location, setLocation] = useState(asset?.location ?? "");
  const [status, setStatus] = useState(asset?.status ?? "Active");
  const [description, setDescription] = useState(asset?.description ?? "");
  const [retirementDate, setRetirementDate] = useState(asset?.retirementDate ?? "");
  const [inspector, setInspector] = useState(asset?.inspector ?? "");
  const [photo, setPhoto] = useState<string | undefined>(asset?.photo);
  const [photoTouched, setPhotoTouched] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    asset
      ? getSchedules(asset).map((s) => ({
          type: SCHEDULE_TYPES[s.type] ? s.type : "Quarterly",
          lastInspected: s.lastInspected || null,
          nextDue: s.nextDue || null,
        }))
      : []
  );

  const photoInput = useRef<HTMLInputElement>(null);

  /**
   * Only inspectors with a current ticket can be picked. If an asset already
   * records an inspector who has since expired, that name is still shown (as
   * history) but marked, rather than silently vanishing.
   */
  const validInspectors = useMemo(() => inspectors.filter((i) => !isTicketExpired(i)), [inspectors]);
  const inspectorIsStale = Boolean(inspector) && !validInspectors.some((i) => i.name === inspector);

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await shrinkImage(file, 800);
      setPhoto(dataUrl);
      setPhotoTouched(true);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const updateSchedule = (i: number, field: keyof Schedule, value: string) => {
    setSchedules((prev) =>
      prev.map((s, idx) => {
        if (idx !== i) return s;
        const next = { ...s, [field]: value || null } as Schedule;
        // Setting the inspection date (or changing the type) auto-fills Next Due
        // from the schedule's interval — still overridable by hand afterwards.
        if (field === "lastInspected" || field === "type") {
          const derived = nextDueFrom(next.lastInspected, next.type);
          if (derived) next.nextDue = derived;
        }
        return next;
      })
    );
  };

  const addLocationPrompt = async () => {
    const input = prompt("New location name:");
    if (!input) return;
    const selected = await addLocationInline(input);
    if (selected) setLocation(selected);
  };

  const submit = () => {
    if (!name.trim()) {
      toast("Asset name is required", "error");
      return;
    }
    const kept = schedules.filter((s) => s.lastInspected || s.nextDue);
    const derived = deriveComplianceFields(kept, retirementDate || null);
    saveAsset(assetId, {
      name: name.trim(),
      serialNumber: serial.trim(),
      location,
      description: description.trim(),
      status,
      schedules: kept,
      retirementDate: retirementDate || null,
      complianceDate: derived.complianceDate,
      lastChecked: derived.lastChecked,
      inspector,
      ...(photoTouched && photo ? { photo } : {}),
    });
  };

  return (
    <Modal
      title={assetId ? (asset?.name ? "Edit Asset" : "Register Asset") : "Add Asset"}
      onClose={closeModal}
      footer={
        <>
          <button className={btn.secondary} onClick={closeModal}>
            Cancel
          </button>
          <button className={btn.primary} onClick={submit}>
            Save Asset
          </button>
        </>
      }
    >
      <div className={formGroup}>
        <label className={label}>EPC Tag ID</label>
        <div className={epcDisplay}>{assetId ? asset?.epc || "—" : "Manual entry — no tag"}</div>
      </div>

      <div className={formGroup}>
        <label className={label}>Photo</label>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element -- data URI from the device camera
          <img className="mb-3.5 max-h-50 w-full rounded-app object-cover" src={photo} alt="Asset photo" />
        )}
        <div
          className="mb-3.5 cursor-pointer rounded-app border-2 border-dashed border-edge p-5 text-center active:border-orange"
          onClick={() => photoInput.current?.click()}
        >
          <div className="text-[28px]">
            <Icon name="camera" />
          </div>
          <div className="mt-1.5 text-[13px] text-dim">Tap to take photo or choose from gallery</div>
        </div>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handlePhoto(e.target.files?.[0])}
        />
      </div>

      <div className={formGroup}>
        <label className={label}>Asset Name *</label>
        <input
          className={input}
          type="text"
          placeholder="Asset name or description"
          autoComplete="off"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className={formGroup}>
        <label className={label}>Serial Number</label>
        <input
          className={input}
          type="text"
          placeholder="Manufacturer serial number"
          autoComplete="off"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
        />
      </div>

      <div className={formRow}>
        <div className={formGroup}>
          <label className={label}>Location</label>
          <div className="flex gap-1.5">
            <select
              className={cx(formSelect, "flex-1")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">— Select location —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={cx(btn.secondary, "shrink-0 px-3 py-0")}
              onClick={addLocationPrompt}
              title="Add a new location"
            >
              <Icon name="plus" />
            </button>
          </div>
        </div>
        <div className={formGroup}>
          <label className={label}>Status</label>
          <select className={formSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Quarantine">Quarantine</option>
            <option value="Condemned">Condemned</option>
          </select>
        </div>
      </div>

      <div className={formGroup}>
        <label className={label}>Description</label>
        <textarea
          className={textarea}
          placeholder="Capacity, WLL, serial number, notes…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={formGroup}>
        <label className={label}>Inspection Schedules</label>
        <div>
          {schedules.length === 0 ? (
            <div className="py-1.5 text-[13px] text-muted">No schedules yet — add one below.</div>
          ) : (
            schedules.map((s, i) => (
              <div className="mb-2 rounded-app border border-edge bg-panel p-2.5" key={i}>
                <div className="mb-2 flex items-center gap-2">
                  <select
                    className={cx(formSelect, "h-auto flex-1 px-2.5 py-2 text-[15px] leading-[1.3]")}
                    value={s.type}
                    onChange={(e) => updateSchedule(i, "type", e.target.value)}
                  >
                    {Object.keys(SCHEDULE_TYPES).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="shrink-0 cursor-pointer p-1.5 text-base text-red"
                    onClick={() => setSchedules((prev) => prev.filter((_, idx) => idx !== i))}
                    title="Remove schedule"
                  >
                    <Icon name="trash" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={cx(label, "mb-1 text-[10px]")}>Inspection Date</label>
                    <input
                      className={input}
                      type="date"
                      value={s.lastInspected || ""}
                      onChange={(e) => updateSchedule(i, "lastInspected", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={cx(label, "mb-1 text-[10px]")}>
                      Next Due <span className="normal-case text-muted">(auto)</span>
                    </label>
                    <input
                      className={input}
                      type="date"
                      value={s.nextDue || ""}
                      onChange={(e) => updateSchedule(i, "nextDue", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          className={cx(btn.secondary, btnSm, "mt-2")}
          onClick={() =>
            setSchedules((prev) => [...prev, { type: "Quarterly", lastInspected: null, nextDue: null }])
          }
        >
          <Icon name="plus" /> Add Schedule
        </button>
      </div>

      <div className={formGroup}>
        <label className={label}>
          Retirement / Expiry Date{" "}
          <span className="font-normal normal-case text-muted">
            (optional — e.g. 10-year height safety expiry)
          </span>
        </label>
        <input
          className={input}
          type="date"
          value={retirementDate || ""}
          onChange={(e) => setRetirementDate(e.target.value)}
        />
      </div>

      <div className={formGroup}>
        <label className={label}>Inspected By</label>
        <select className={formSelect} value={inspector} onChange={(e) => setInspector(e.target.value)}>
          <option value="">— Select inspector —</option>
          {validInspectors.map((i) => (
            <option key={i.id} value={i.name}>
              {i.name}
              {i.ticketType ? ` (${i.ticketType})` : ""}
            </option>
          ))}
          {inspectorIsStale && <option value={inspector}>{inspector} — ticket expired or removed</option>}
        </select>
        <div className="mt-1.5 text-xs leading-normal text-muted">
          Manage inspectors in <strong>Settings</strong>. Inspectors with an expired ticket can&apos;t be
          selected.
        </div>
      </div>
    </Modal>
  );
}
