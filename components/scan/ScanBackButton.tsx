"use client";

import { useStore } from "@/context/store";
import { Icon } from "../ui";

export default function ScanBackButton() {
  const { backToScanMenu } = useStore();
  return (
    <button className="scan-back-btn" onClick={backToScanMenu}>
      <Icon name="chevron-left" /> Back to Scan
    </button>
  );
}
