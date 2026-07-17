"use client";

import { useStore } from "@/context/store";
import { btn, btnSm, card, cx } from "@/lib/styles";
import { EmptyState, Icon } from "../ui";
import ScanBackButton from "./ScanBackButton";

/** Unmatched scans, collected without a blocking popup so scanning stays fast. */
export default function NeedsActionView() {
  const { assets, openMatch, openEdit, deleteAsset } = useStore();
  const items = assets.filter((a) => !a.name && a.epc);

  return (
    <div>
      <ScanBackButton />

      {items.length === 0 ? (
        <EmptyState icon="mood-check" title="All caught up">
          Scanned tags that don&apos;t match anything in RigTrak yet will show up here — no popups,
          scan freely and sort them out whenever&apos;s convenient.
        </EmptyState>
      ) : (
        items.map((a) => (
          <div className={cx(card, "mb-2 flex items-center gap-3 p-4")} key={a.id}>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-bold text-muted">Unmatched tag</div>
              <div className="mt-1 truncate font-mono text-[11px] text-dim">{a.epc}</div>
              <div className="mt-1 truncate text-xs text-dim">
                {a.rigtrakId || ""}
                {a.createdAt
                  ? " · scanned " +
                    new Date(a.createdAt).toLocaleString("en-AU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5 [&>button]:whitespace-nowrap">
              <button className={cx(btn.secondary, btnSm)} onClick={() => openMatch(a.id)}>
                <Icon name="link" /> Match to Register
              </button>
              <button className={cx(btn.primary, btnSm)} onClick={() => openEdit(a.id)}>
                <Icon name="plus" /> New Asset
              </button>
              <button className={cx(btn.danger, btnSm)} onClick={() => deleteAsset(a.id)}>
                <Icon name="trash" /> Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
