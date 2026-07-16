"use client";

import { useMemo, useRef, useState } from "react";
import { useStore } from "@/context/store";
import { deriveComplianceFields, getSchedules, getSerial, isTicketExpired, nextDueFrom, shrinkImage } from "@/lib/helpers";
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
          <button className="btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          <button className="btn-primary" onClick={submit}>
            Save Asset
          </button>
        </>
      }
    >
      <div className="form-group">
        <label>EPC Tag ID</label>
        <div className="epc-display">{assetId ? asset?.epc || "—" : "Manual entry — no tag"}</div>
      </div>

      <div className="form-group">
        <label>Photo</label>
        {photo && <img className="photo-preview" src={photo} alt="Asset photo" />}
        <div className="photo-upload" onClick={() => photoInput.current?.click()}>
          <div style={{ fontSize: 28 }}>
            <Icon name="camera" />
          </div>
          <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 6 }}>
            Tap to take photo or choose from gallery
          </div>
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

      <div className="form-group">
        <label>Asset Name *</label>
        <input
          type="text"
          placeholder="Asset name or description"
          autoComplete="off"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Serial Number</label>
        <input
          type="text"
          placeholder="Manufacturer serial number"
          autoComplete="off"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Location</label>
          <div style={{ display: "flex", gap: 6 }}>
            <select
              className="form-select"
              style={{ flex: 1 }}
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
              className="btn-secondary"
              style={{ flexShrink: 0, padding: "0 12px" }}
              onClick={addLocationPrompt}
              title="Add a new location"
            >
              <Icon name="plus" />
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Quarantine">Quarantine</option>
            <option value="Condemned">Condemned</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          placeholder="Capacity, WLL, serial number, notes…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Inspection Schedules</label>
        <div>
          {schedules.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--muted)", padding: "6px 0" }}>
              No schedules yet — add one below.
            </div>
          ) : (
            schedules.map((s, i) => (
              <div className="schedule-row" key={i}>
                <div className="schedule-row-head">
                  <select
                    className="form-select"
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
                    className="schedule-remove-btn"
                    onClick={() => setSchedules((prev) => prev.filter((_, idx) => idx !== i))}
                    title="Remove schedule"
                  >
                    <Icon name="trash" />
                  </button>
                </div>
                <div className="schedule-row-dates">
                  <div>
                    <label>Inspection Date</label>
                    <input
                      type="date"
                      value={s.lastInspected || ""}
                      onChange={(e) => updateSchedule(i, "lastInspected", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>
                      Next Due <span style={{ textTransform: "none", color: "var(--muted)" }}>(auto)</span>
                    </label>
                    <input
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
          className="btn-secondary btn-sm"
          style={{ marginTop: 8 }}
          onClick={() =>
            setSchedules((prev) => [...prev, { type: "Quarterly", lastInspected: null, nextDue: null }])
          }
        >
          <Icon name="plus" /> Add Schedule
        </button>
      </div>

      <div className="form-group">
        <label>
          Retirement / Expiry Date{" "}
          <span style={{ fontWeight: 400, textTransform: "none", color: "var(--muted)" }}>
            (optional — e.g. 10-year height safety expiry)
          </span>
        </label>
        <input type="date" value={retirementDate || ""} onChange={(e) => setRetirementDate(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Inspected By</label>
        <select className="form-select" value={inspector} onChange={(e) => setInspector(e.target.value)}>
          <option value="">— Select inspector —</option>
          {validInspectors.map((i) => (
            <option key={i.id} value={i.name}>
              {i.name}
              {i.ticketType ? ` (${i.ticketType})` : ""}
            </option>
          ))}
          {inspectorIsStale && <option value={inspector}>{inspector} — ticket expired or removed</option>}
        </select>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
          Manage inspectors in <strong>Settings</strong>. Inspectors with an expired ticket can&apos;t be
          selected.
        </div>
      </div>
    </Modal>
  );
}
