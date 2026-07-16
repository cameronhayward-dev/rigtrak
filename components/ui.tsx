import { daysUntil, statusBadgeClass } from "@/lib/helpers";
import type { Asset } from "@/lib/types";

/** A Tabler webfont icon. */
export function Icon({ name, style }: { name: string; style?: React.CSSProperties }) {
  return <i className={`ti ti-${name}`} style={style} />;
}

export function StatusBadge({ status }: { status?: string }) {
  return <span className={`badge ${statusBadgeClass(status)}`}>{status || "Unregistered"}</span>;
}

export function ComplianceDisplay({ dateStr }: { dateStr?: string | null }) {
  const diff = daysUntil(dateStr);
  if (diff === null) return <span style={{ color: "var(--muted)" }}>—</span>;
  if (diff < 0) return <span className="compliance-overdue">⚠ Overdue</span>;
  if (diff <= 30) return <span className="compliance-due">⏳ {diff}d</span>;
  return <span className="compliance-ok">✓ {new Date(dateStr!).toLocaleDateString("en-AU")}</span>;
}

/** Flags an asset's compliance inside the live check lists. */
export function ComplianceFlagBadge({ asset }: { asset: Asset }) {
  const diff = daysUntil(asset.complianceDate);
  if (diff === null) return null;
  if (diff < 0) return <span className="badge badge-missing">⚠ Overdue</span>;
  if (diff <= 30) return <span className="badge badge-quarantine">⏳ Due Soon</span>;
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
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} />
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
