"use client";

import { useStore } from "@/context/store";

export default function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
        >
          <span>{t.msg}</span>
          {t.action && (
            <button
              style={{
                background: "none",
                color: "var(--orange)",
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
              onClick={async () => {
                dismissToast(t.id);
                await t.action!.onClick();
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
