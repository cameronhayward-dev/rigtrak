"use client";

import { useRef, useState } from "react";
import { useStore } from "@/context/store";
import { downloadTemplate } from "@/lib/exports";
import { NotARegisterError, parseRegisterFile } from "@/lib/importFile";
import { btn } from "@/lib/styles";
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
          <button className={btn.secondary} onClick={closeModal}>
            Cancel
          </button>
          {rows.length > 0 && (
            <button
              className={btn.primary}
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
      <p className="mb-4 text-sm leading-normal text-dim">
        Upload a <strong>RigTrak register</strong> (CSV/XLSX with a Description column) to bulk-import assets.
        Tags are linked later by scanning on site.
      </p>

      <div
        className="cursor-pointer rounded-app border-2 border-dashed border-edge px-4 py-8 text-center active:border-orange"
        onClick={() => fileInput.current?.click()}
      >
        <div className="text-[40px]">
          <Icon name="folder-open" />
        </div>
        <strong className="text-[17px]">Tap to select file</strong>
        <p className="mt-2 text-[13px] text-dim">Select a .csv or .xlsx file</p>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <p className="mt-2.5">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            downloadTemplate();
          }}
          className="text-[13px] text-orange underline"
        >
          Download RigTrak register template (CSV)
        </a>
      </p>

      {rows.length > 0 && (
        <div className="mt-3.5 flex flex-col gap-2 rounded-app border border-edge bg-panel p-3.5 text-sm">
          <div>
            <Icon name="file-text" /> <strong>{rows.length}</strong> register items found
          </div>
          <div className="text-green">
            <Icon name="circle-check" /> Will import as <strong>untagged</strong> assets — link tags on site
          </div>
          {dupCount > 0 && (
            <div className="text-yellow">⚠ {dupCount} possible duplicate row(s) flagged for review</div>
          )}
          {noLocCount > 0 && (
            <div className="text-dim">
              <Icon name="map-pin" /> {noLocCount} row(s) have no location set
            </div>
          )}
          {noSerialCount > 0 && (
            <div className="text-dim">
              <Icon name="hash" /> {noSerialCount} row(s) have no serial number
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
