"use client";

import { useRef, useState } from "react";
import { useStore } from "@/context/store";
import { downloadTemplate } from "@/lib/exports";
import { NotARegisterError, parseRegisterFile } from "@/lib/importFile";
import type { RegisterRow } from "@/lib/types";
import { Icon } from "../ui";
import Modal from "./Modal";

export default function ImportModal() {
  const { closeModal, importRegisterRows, toast } = useStore();
  const [rows, setRows] = useState<RegisterRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      setRows(await parseRegisterFile(file));
    } catch (e) {
      setRows([]);
      toast(
        e instanceof NotARegisterError ? e.message : "Failed to read file: " + (e as Error).message,
        "error"
      );
    }
  };

  const dupCount = rows.filter((r) => r.needsReview).length;
  const noLocCount = rows.filter((r) => !r.location).length;
  const noSerialCount = rows.filter((r) => !r.serialNumber).length;

  return (
    <Modal
      title="Import Register"
      onClose={closeModal}
      footer={
        <>
          <button className="btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          {rows.length > 0 && (
            <button
              className="btn-primary"
              disabled={importing}
              onClick={async () => {
                setImporting(true);
                await importRegisterRows(rows);
                setImporting(false);
              }}
            >
              {importing ? "Importing…" : `Import ${rows.length} Items`}
            </button>
          )}
        </>
      }
    >
      <p style={{ color: "var(--dim)", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
        Upload a <strong>RigTrak register</strong> (CSV/XLSX with a Description column) to bulk-import assets.
        Tags are linked later by scanning on site.
      </p>

      <div className="import-zone" onClick={() => fileInput.current?.click()}>
        <div style={{ fontSize: 40 }}>
          <Icon name="folder-open" />
        </div>
        <strong style={{ fontSize: 17 }}>Tap to select file</strong>
        <p>Select a .csv or .xlsx file</p>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <p style={{ marginTop: 10 }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            downloadTemplate();
          }}
          style={{ color: "var(--orange)", fontSize: 13, textDecoration: "underline" }}
        >
          Download RigTrak register template (CSV)
        </a>
      </p>

      {rows.length > 0 && (
        <div className="import-result">
          <div>
            <Icon name="file-text" /> <strong>{rows.length}</strong> register items found
          </div>
          <div style={{ color: "var(--green)" }}>
            <Icon name="circle-check" /> Will import as <strong>untagged</strong> assets — link tags on site
          </div>
          {dupCount > 0 && (
            <div style={{ color: "var(--yellow)" }}>
              ⚠ {dupCount} possible duplicate row(s) flagged for review
            </div>
          )}
          {noLocCount > 0 && (
            <div style={{ color: "var(--dim)" }}>
              <Icon name="map-pin" /> {noLocCount} row(s) have no location set
            </div>
          )}
          {noSerialCount > 0 && (
            <div style={{ color: "var(--dim)" }}>
              <Icon name="hash" /> {noSerialCount} row(s) have no serial number
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
