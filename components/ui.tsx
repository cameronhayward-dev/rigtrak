import { daysUntil, statusBadgeClass } from "@/lib/helpers";
import { badge, badgeTone, compliance, cx } from "@/lib/styles";
import type { Asset } from "@/lib/types";

/** A Tabler webfont icon. */
export function Icon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <i className={cx(`ti ti-${name}`, className)} style={style} />;
}

export function StatusBadge({ status }: { status?: string }) {
  return <span className={cx(badge, statusBadgeClass(status))}>{status || "Unregistered"}</span>;
}

export function ComplianceDisplay({ dateStr }: { dateStr?: string | null }) {
  const diff = daysUntil(dateStr);
  if (diff === null) return <span className="text-muted">—</span>;
  if (diff < 0) return <span className={compliance.overdue}>⚠ Overdue</span>;
  if (diff <= 30) return <span className={compliance.due}>⏳ {diff}d</span>;
  return <span className={compliance.ok}>✓ {new Date(dateStr!).toLocaleDateString("en-AU")}</span>;
}

/** Flags an asset's compliance inside the live check lists. */
export function ComplianceFlagBadge({ asset }: { asset: Asset }) {
  const diff = daysUntil(asset.complianceDate);
  if (diff === null) return null;
  if (diff < 0) return <span className={cx(badge, badgeTone.missing)}>⚠ Overdue</span>;
  if (diff <= 30) return <span className={cx(badge, badgeTone.quarantine)}>⏳ Due Soon</span>;
  return null;
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: string;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center px-4 py-12 text-dim">
      {/* Size sits on the wrapper, matching the old .empty-icon rule: the .ti
          base rule wins on the <i> itself, so the glyph stays 18px. */}
      <div className="text-[52px] mb-[14px]">
        <Icon name={icon} />
      </div>
      <h3 className="text-lg text-fg mb-2 font-bold">{title}</h3>
      {children && <p className="mb-5 text-sm leading-normal">{children}</p>}
      {action}
    </div>
  );
}
