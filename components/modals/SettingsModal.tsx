"use client";

import { useRef, useState } from "react";
import { useStore } from "@/context/store";
import { formatDateAU, isTicketExpired, shrinkImage } from "@/lib/helpers";
import {
  assetBody,
  assetCard,
  assetName,
  assetSub,
  badge,
  badgeTone,
  btn,
  btnFull,
  btnSm,
  cx,
  formGroup,
  formRow,
  formSelect,
  input,
  label,
  sectionLabel,
} from "@/lib/styles";
import { Icon } from "../ui";
import Modal from "./Modal";

const TICKET_TYPES = [
  { value: "Dogman", label: "Dogman" },
  { value: "Rigging - Basic", label: "Rigging — Basic" },
  { value: "Rigging - Intermediate", label: "Rigging — Intermediate" },
  { value: "Rigging - Advanced", label: "Rigging — Advanced" },
  { value: "Height Safety", label: "Height Safety" },
  { value: "Other", label: "Other" },
];

const uploadZone =
  "mb-3.5 cursor-pointer rounded-app border-2 border-dashed border-edge p-5 text-center active:border-orange";
const blurb = "mb-3 text-[13px] leading-normal text-dim";

export default function SettingsModal() {
  const { company, inspectors, closeModal, saveCompanyProfile, addInspector, deleteInspector, toast } =
    useStore();

  const [name, setName] = useState(company.name ?? "");
  const [abn, setAbn] = useState(company.abn ?? "");
  const [phone, setPhone] = useState(company.phone ?? "");
  const [address, setAddress] = useState(company.address ?? "");
  const [logo, setLogo] = useState<string | undefined>(company.logo);
  const [logoTouched, setLogoTouched] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);

  const [inspName, setInspName] = useState("");
  const [ticketType, setTicketType] = useState("Dogman");
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticketExpiry, setTicketExpiry] = useState("");

  const handleLogo = async (file?: File) => {
    if (!file) return;
    try {
      setLogo(await shrinkImage(file, 400));
      setLogoTouched(true);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const submitInspector = async () => {
    await addInspector({
      name: inspName,
      ticketType,
      ticketNumber: ticketNumber.trim(),
      ticketExpiry: ticketExpiry || null,
    });
    setInspName("");
    setTicketNumber("");
    setTicketExpiry("");
  };

  return (
    <Modal
      title={
        <>
          <Icon name="settings" /> Settings
        </>
      }
      onClose={closeModal}
    >
      <div className={cx(sectionLabel, "pt-0")}>Company Profile</div>
      <p className={blurb}>
        Appears on exported reports and registers, so documents you hand to clients carry your branding.
      </p>

      <div className={formGroup}>
        <label className={label}>Company Logo</label>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element -- data URI from an upload
          <img
            className="mb-3.5 max-h-20 w-full rounded-app bg-white object-contain p-2"
            src={logo}
            alt="Company logo"
          />
        )}
        <div className={uploadZone} onClick={() => logoInput.current?.click()}>
          <div className="text-2xl">
            <Icon name="photo" />
          </div>
          <div className="mt-1.5 text-[13px] text-dim">Tap to upload your logo</div>
        </div>
        <input
          ref={logoInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleLogo(e.target.files?.[0])}
        />
      </div>

      <div className={formGroup}>
        <label className={label}>Company Name</label>
        <input
          className={input}
          type="text"
          placeholder="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className={formRow}>
        <div className={formGroup}>
          <label className={label}>ABN</label>
          <input
            className={input}
            type="text"
            placeholder="ABN"
            value={abn}
            onChange={(e) => setAbn(e.target.value)}
          />
        </div>
        <div className={formGroup}>
          <label className={label}>Phone</label>
          <input
            className={input}
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div className={formGroup}>
        <label className={label}>Address</label>
        <input
          className={input}
          type="text"
          placeholder="Street address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <button
        className={cx(btn.primary, btnFull, "mb-5")}
        onClick={() =>
          saveCompanyProfile({
            name: name.trim(),
            abn: abn.trim(),
            phone: phone.trim(),
            address: address.trim(),
            ...(logoTouched && logo ? { logo } : {}),
          })
        }
      >
        <Icon name="device-floppy" /> Save Company Profile
      </button>

      <div className={sectionLabel}>Inspectors</div>
      <p className={blurb}>
        Anyone who inspects equipment. Only inspectors with a current (unexpired) ticket can be selected when
        inspecting gear.
      </p>

      <div className="mb-3.5">
        {inspectors.length === 0 ? (
          <div className="py-2 text-[13px] text-muted">No inspectors yet — add one below.</div>
        ) : (
          inspectors.map((i) => {
            const expired = isTicketExpired(i);
            return (
              <div
                className={cx(assetCard, "mb-2 cursor-default", expired && "border-l-[3px] border-l-red")}
                key={i.id}
              >
                <div className={assetBody}>
                  <div className={assetName}>{i.name}</div>
                  <div className={assetSub}>
                    {i.ticketType || "—"}
                    {i.ticketNumber ? ` · #${i.ticketNumber}` : ""}
                  </div>
                  <div className={cx(assetSub, expired && "font-semibold text-red")}>
                    {i.ticketExpiry
                      ? expired
                        ? "Ticket EXPIRED " + formatDateAU(i.ticketExpiry)
                        : "Ticket valid to " + formatDateAU(i.ticketExpiry)
                      : "No expiry recorded"}
                  </div>
                </div>
                <span className={cx(badge, expired ? badgeTone.condemned : badgeTone.active)}>
                  {expired ? "Expired" : "Current"}
                </span>
                <button
                  className={cx(btn.icon, btnSm, "min-h-auto min-w-auto px-2 py-1.5 text-red")}
                  onClick={() => deleteInspector(i.id, i.name)}
                >
                  <Icon name="trash" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="rounded-app border border-edge bg-panel p-3">
        <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.5px] text-dim">Add Inspector</div>
        <div className={cx(formGroup, "mb-2.5")}>
          <label className={label}>Name</label>
          <input
            className={input}
            type="text"
            placeholder="Inspector name"
            value={inspName}
            onChange={(e) => setInspName(e.target.value)}
          />
        </div>
        <div className={cx(formRow, "mb-2.5")}>
          <div className={cx(formGroup, "mb-0")}>
            <label className={label}>Ticket Type</label>
            <select className={formSelect} value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
              {TICKET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className={cx(formGroup, "mb-0")}>
            <label className={label}>Ticket Number</label>
            <input
              className={input}
              type="text"
              placeholder="Ticket number"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
            />
          </div>
        </div>
        <div className={cx(formGroup, "mb-2.5")}>
          <label className={label}>Ticket Expiry Date</label>
          <input
            className={input}
            type="date"
            value={ticketExpiry}
            onChange={(e) => setTicketExpiry(e.target.value)}
          />
        </div>
        <div className="mb-2.5 rounded-app border border-dashed border-edge bg-steel p-2.5">
          <div className="text-xs leading-normal text-muted">
            <Icon name="file-certificate" /> Ticket document upload — coming soon
          </div>
        </div>
        <button className={cx(btn.primary, btnFull)} onClick={submitInspector}>
          <Icon name="plus" /> Add Inspector
        </button>
      </div>
    </Modal>
  );
}
