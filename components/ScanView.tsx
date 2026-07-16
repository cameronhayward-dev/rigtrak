"use client";

import { useStore } from "@/context/store";
import NeedsActionView from "./scan/NeedsActionView";
import LiveCheckView from "./scan/LiveCheckView";
import InoutView from "./scan/InoutView";
import { Icon } from "./ui";

function ScanMenuItem({
  icon,
  iconColor,
  title,
  sub,
  badge,
  onClick,
}: {
  icon: string;
  iconColor?: string;
  title: string;
  sub: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button className="scan-menu-item" onClick={onClick}>
      <Icon name={icon} style={iconColor ? { color: iconColor } : undefined} />
      <div className="scan-menu-item-body">
        <div className="scan-menu-item-title">{title}</div>
        <div className="scan-menu-item-sub">{sub}</div>
      </div>
      {badge !== undefined && badge > 0 ? (
        <span className="tab-badge">{badge}</span>
      ) : (
        <Icon name="chevron-right" style={{ color: "var(--dim)" }} />
      )}
    </button>
  );
}

/**
 * The Scan hub — everything that uses the reader lives here: Needs Action,
 * Verify a Location, Check Out, Check In, and Find an Item.
 */
export default function ScanView() {
  const { scanHubState, switchScanView, goToInoutState, openLocationPick, assets } = useStore();
  const needsActionCount = assets.filter((a) => !a.name && a.epc).length;

  if (scanHubState === "needsaction") return <NeedsActionView />;
  if (scanHubState === "check") return <LiveCheckView />;
  if (scanHubState === "inout") return <InoutView />;

  return (
    <div>
      <p style={{ color: "var(--dim)", fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
        Everything that uses the reader lives here — pick what you&apos;re doing.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ScanMenuItem
          icon="alert-triangle"
          iconColor="var(--orange)"
          title="Needs Action"
          sub="Unmatched scans waiting to be sorted"
          badge={needsActionCount}
          onClick={() => switchScanView("needsaction")}
        />
        <ScanMenuItem
          icon="map-pin-check"
          title="Verify a Location"
          sub="Scan a location, see what's there vs missing"
          onClick={() => {
            switchScanView("check");
            openLocationPick();
          }}
        />
        <ScanMenuItem
          icon="logout"
          title="Check Out Gear"
          sub="Send items to a job, truck, or site"
          onClick={() => {
            switchScanView("inout");
            goToInoutState("checkoutPicker");
          }}
        />
        <ScanMenuItem
          icon="login"
          title="Check In Gear"
          sub="Return items to a home location"
          onClick={() => {
            switchScanView("inout");
            goToInoutState("checkinPicker");
          }}
        />
        <ScanMenuItem
          icon="search"
          title="Find an Item"
          sub="Hunt down one specific piece of gear"
          onClick={() => {
            switchScanView("inout");
            goToInoutState("huntPicker");
          }}
        />
      </div>
    </div>
  );
}
