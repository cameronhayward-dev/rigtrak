"use client";

import { useStore } from "@/context/store";
import { btn, btnSm, cx } from "@/lib/styles";
import { Icon } from "./ui";

export default function Header() {
  const { scanContext, toggleScanMode, openImport, openSettings, openAdd } = useStore();
  const scanning = scanContext === "scanMode";

  return (
    <header className="sticky top-0 z-100 flex h-14 items-center justify-between border-b-2 border-orange bg-steel px-4">
      <div className="text-[22px] font-extrabold tracking-[-0.5px]">
        Rig<span className="text-orange">Trak</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className={cx(btn.secondary, btnSm, scanning && "border-transparent bg-red text-white")}
          onClick={toggleScanMode}
        >
          {scanning ? (
            <>
              <Icon name="circle-filled" className="text-[10px] text-white" /> Scanning…
            </>
          ) : (
            <>
              <Icon name="radar-2" /> Scan Mode
            </>
          )}
        </button>
        <button className={cx(btn.secondary, btnSm)} onClick={openImport}>
          <Icon name="upload" /> Import
        </button>
        <button className={cx(btn.icon, btnSm)} onClick={openSettings} title="Settings">
          <Icon name="settings" />
        </button>
        {/* Mobile uses the floating action button instead. */}
        <button className={cx(btn.primary, btnSm, "hidden app:inline-block")} onClick={openAdd}>
          <Icon name="plus" /> Add
        </button>
      </div>
    </header>
  );
}
