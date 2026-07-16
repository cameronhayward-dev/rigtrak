"use client";

import { useStore } from "@/context/store";
import { Icon } from "./ui";

export default function Header() {
  const { scanContext, toggleScanMode, openImport, openSettings, openAdd } = useStore();
  const scanning = scanContext === "scanMode";

  return (
    <header>
      <div className="logo">
        Rig<span>Trak</span>
      </div>
      <div className="header-actions">
        <button
          className="btn-secondary btn-sm"
          onClick={toggleScanMode}
          style={scanning ? { background: "var(--red)", color: "#fff", border: "none" } : undefined}
        >
          {scanning ? (
            <>
              <Icon name="circle-filled" style={{ fontSize: 10, color: "#fff" }} /> Scanning…
            </>
          ) : (
            <>
              <Icon name="radar-2" /> Scan Mode
            </>
          )}
        </button>
        <button className="btn-secondary btn-sm" onClick={openImport}>
          <Icon name="upload" /> Import
        </button>
        <button className="btn-icon btn-sm" onClick={openSettings} title="Settings">
          <Icon name="settings" />
        </button>
        <button className="btn-primary btn-sm desktop-only" onClick={openAdd}>
          <Icon name="plus" /> Add
        </button>
      </div>
    </header>
  );
}
