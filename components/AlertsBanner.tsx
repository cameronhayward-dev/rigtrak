"use client";

import { useMemo } from "react";
import { useStore } from "@/context/store";
import { daysUntil } from "@/lib/helpers";
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
    if (overdue.length) list.push({ label: `${overdue.length} overdue`, color: "var(--red)", kind: "overdue" });
    if (expiring.length)
      list.push({ label: `${expiring.length} expiring soon`, color: "var(--yellow)", kind: "expiring" });
    if (quarantined.length)
      list.push({ label: `${quarantined.length} quarantined`, color: "var(--orange)", kind: "quarantine" });
    return list;
  }, [assets]);

  if (!chips.length) return null;

  return (
    <div
      style={{
        background: "rgba(231,76,60,0.08)",
        border: "1px solid rgba(231,76,60,0.3)",
        borderRadius: "var(--radius)",
        padding: "12px 14px",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Icon name="bell-ringing" style={{ color: "var(--red)", fontSize: 20 }} />
        <div style={{ fontWeight: 700, fontSize: 14 }}>Needs Attention</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {chips.map((c) => (
          <button
            key={c.kind}
            onClick={() => alertJumpTo(c.kind)}
            style={{
              background: c.color,
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
