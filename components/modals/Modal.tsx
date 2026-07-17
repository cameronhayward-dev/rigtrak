"use client";

import type { ReactNode } from "react";
import { btn, btnSm, cx } from "@/lib/styles";
import { Icon } from "../ui";

export default function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    /* Bottom sheet on mobile; centred dialog from 700px up. */
    <div
      className="fixed inset-0 z-200 flex items-end justify-center bg-black/75 app:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[92vh] w-full max-w-[600px] overflow-y-auto rounded-t-2xl border border-edge bg-steel app:max-h-[88vh] app:rounded-xl">
        <div className="mx-auto mt-3 h-1 w-10 rounded-sm bg-edge app:hidden" />
        <div className="flex items-center justify-between border-b border-edge px-4 pt-4 pb-3.5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className={cx(btn.icon, btnSm)} onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer && (
          <div className="flex gap-2.5 border-t border-edge px-4 py-3.5 [&>button]:flex-1">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
