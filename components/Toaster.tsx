"use client";

import { useStore } from "@/context/store";
import { cx } from "@/lib/styles";

const TONE: Record<string, string> = {
  success: "border-l-4 border-l-green",
  error: "border-l-4 border-l-red",
  info: "border-l-4 border-l-orange",
};

export default function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    /* pointer-events-none on the stack so it never blocks the page; each toast
       re-enables them for itself. */
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[400] flex w-[calc(100%-32px)] max-w-[400px] -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "pointer-events-auto flex animate-slide-up items-center justify-between gap-3 rounded-app border border-edge bg-panel px-4 py-[14px] text-center text-sm font-semibold",
            TONE[t.type],
          )}
        >
          <span>{t.msg}</span>
          {t.action && (
            <button
              className="shrink-0 cursor-pointer bg-none text-[13px] font-bold text-orange"
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
