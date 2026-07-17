"use client";

import { useStore } from "@/context/store";
import { Icon } from "../ui";

export default function ScanBackButton() {
  const { backToScanMenu } = useStore();
  return (
    <button
      className="flex cursor-pointer items-center gap-1 pt-1 pb-3.5 text-[13px] font-semibold text-dim"
      onClick={backToScanMenu}
    >
      <Icon name="chevron-left" className="text-base" /> Back to Scan
    </button>
  );
}
