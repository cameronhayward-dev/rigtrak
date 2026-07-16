"use client";

import { useRef, useState } from "react";
import { useStore } from "@/context/store";
import { formatDateAU, isTicketExpired, shrinkImage } from "@/lib/helpers";
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
      <div className="section-label" style={{ paddingTop: 0 }}>
        Company Profile
      </div>
      <p style={{ color: "var(--dim)", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
        Appears on exported reports and registers, so documents you hand to clients carry your branding.
      </p>

      <div className="form-group">
        <label>Company Logo</label>
        {logo && (
          <img
            className="photo-preview"
            src={logo}
            alt="Company logo"
            style={{ maxHeight: 80, objectFit: "contain", background: "#fff", padding: 8 }}
          />
        )}
        <div className="photo-upload" onClick={() => logoInput.current?.click()}>
          <div style={{ fontSize: 24 }}>
            <Icon name="photo" />
          </div>
          <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 6 }}>Tap to upload your logo</div>
        </div>
        <input
          ref={logoInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleLogo(e.target.files?.[0])}
        />
      </div>

      <div className="form-group">
        <label>Company Name</label>
        <input type="text" placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>ABN</label>
          <input type="text" placeholder="ABN" value={abn} onChange={(e) => setAbn(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Address</label>
        <input
          type="text"
          placeholder="Street address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <button
        className="btn-primary btn-full"
        style={{ marginBottom: 20 }}
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

      <div className="section-label">Inspectors</div>
      <p style={{ color: "var(--dim)", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
        Anyone who inspects equipment. Only inspectors with a current (unexpired) ticket can be selected when
        inspecting gear.
      </p>

      <div style={{ marginBottom: 14 }}>
        {inspectors.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>
            No inspectors yet — add one below.
          </div>
        ) : (
          inspectors.map((i) => {
            const expired = isTicketExpired(i);
            return (
              <div
                className="asset-card"
                key={i.id}
                style={{ cursor: "default", ...(expired ? { borderLeft: "3px solid var(--red)" } : {}) }}
              >
                <div className="asset-card-body">
                  <div className="asset-card-name">{i.name}</div>
                  <div className="asset-card-sub">
                    {i.ticketType || "—"}
                    {i.ticketNumber ? ` · #${i.ticketNumber}` : ""}
                  </div>
                  <div
                    className="asset-card-sub"
                    style={expired ? { color: "var(--red)", fontWeight: 600 } : undefined}
                  >
                    {i.ticketExpiry
                      ? expired
                        ? "Ticket EXPIRED " + formatDateAU(i.ticketExpiry)
                        : "Ticket valid to " + formatDateAU(i.ticketExpiry)
                      : "No expiry recorded"}
                  </div>
                </div>
                {expired ? (
                  <span className="badge badge-condemned">Expired</span>
                ) : (
                  <span className="badge badge-active">Current</span>
                )}
                <button
                  className="btn-icon btn-sm"
                  style={{ color: "var(--red)", minWidth: "auto", minHeight: "auto", padding: "6px 8px" }}
                  onClick={() => deleteInspector(i.id, i.name)}
                >
                  <Icon name="trash" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 12,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--dim)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 10,
          }}
        >
          Add Inspector
        </div>
        <div className="form-group" style={{ marginBottom: 10 }}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Inspector name"
            value={inspName}
            onChange={(e) => setInspName(e.target.value)}
          />
        </div>
        <div className="form-row" style={{ marginBottom: 10 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Ticket Type</label>
            <select className="form-select" value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
              {TICKET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Ticket Number</label>
            <input
              type="text"
              placeholder="Ticket number"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 10 }}>
          <label>Ticket Expiry Date</label>
          <input type="date" value={ticketExpiry} onChange={(e) => setTicketExpiry(e.target.value)} />
        </div>
        <div
          style={{
            background: "var(--steel)",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius)",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            <Icon name="file-certificate" /> Ticket document upload — coming soon
          </div>
        </div>
        <button className="btn-primary btn-full" onClick={submitInspector}>
          <Icon name="plus" /> Add Inspector
        </button>
      </div>
    </Modal>
  );
}
