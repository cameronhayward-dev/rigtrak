"use client";

import { useMemo } from "react";
import { useStore } from "@/context/store";
import { daysUntil } from "@/lib/helpers";
import { cx } from "@/lib/styles";
import { Icon } from "./ui";

/**
 * Surfaces problems the moment the app opens, so nothing sits forgotten.
 * (An in-app version of "reminders" — genuine email/push notifications need the
 * paid backend and are on the post-sale roadmap.)
 */
export default function AlertsBanner() {
  const { assets, alertJumpTo } = useStore();

  const chips = useMemo(() => {
    const named = assets.filter((a) => a.name);
    const soon = (v: number | null) => v !== null && v >= 0 && v <= 30;

    const overdue = named.filter((a) => {
      const d = daysUntil(a.complianceDate);
      return d !== null && d < 0;
    });
    const expiring = named.filter(
      (a) => soon(daysUntil(a.complianceDate)) || soon(daysUntil(a.retirementDate))
    );
    const quarantined = named.filter((a) => a.status === "Quarantine");

    const list: { label: string; color: string; kind: "overdue" | "expiring" | "quarantine" }[] = [];
    if (overdue.length) list.push({ label: `${overdue.length} overdue`, color: "bg-red", kind: "overdue" });
    if (expiring.length)
      list.push({ label: `${expiring.length} expiring soon`, color: "bg-yellow", kind: "expiring" });
    if (quarantined.length)
      list.push({ label: `${quarantined.length} quarantined`, color: "bg-orange", kind: "quarantine" });
    return list;
  }, [assets]);

  if (!chips.length) return null;

  return (
    <div className="mb-3 rounded-app border border-red/30 bg-red/[0.08] px-[14px] py-3">
      <div className="mb-2 flex items-center gap-2.5">
        <Icon name="bell-ringing" className="text-xl text-red" />
        <div className="text-sm font-bold">Needs Attention</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.kind}
            onClick={() => alertJumpTo(c.kind)}
            className={cx(
              "cursor-pointer rounded-[20px] px-[14px] py-1.5 text-[13px] font-semibold text-white",
              c.color,
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
