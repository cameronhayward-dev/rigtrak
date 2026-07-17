"use client";

import { useStore } from "@/context/store";
import { card, cx } from "@/lib/styles";
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
    <button
      className={cx(card, "flex min-h-15 w-full cursor-pointer items-center gap-3.5 p-4 text-left active:bg-panel")}
      onClick={onClick}
    >
      <Icon name={icon} className={cx("shrink-0 text-[22px]", iconColor ?? "text-dim")} />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-bold">{title}</div>
        <div className="mt-0.5 text-xs text-dim">{sub}</div>
      </div>
      {badge !== undefined && badge > 0 ? (
        <span className="ml-1 inline-block rounded-[10px] bg-red px-1.5 py-px align-middle text-[10px] text-white">
          {badge}
        </span>
      ) : (
        <Icon name="chevron-right" className="text-dim" />
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
      <p className="mb-3.5 text-[13px] leading-normal text-dim">
        Everything that uses the reader lives here — pick what you&apos;re doing.
      </p>
      <div className="flex flex-col gap-2">
        <ScanMenuItem
          icon="alert-triangle"
          iconColor="text-orange"
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
