"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";

/**
 * Demo sign-in. There is no auth behind this yet — any input (or none) is
 * accepted and the user is sent straight to /dashboard.
 */
export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => emailRef.current?.focus(), 120);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  // Warm the route so the fake sign-in lands instantly.
  useEffect(() => {
    if (open) router.prefetch("/dashboard");
  }, [open, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div
      className="lp-modal-scrim"
      data-open={open}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        className="lp-modal lp-shell"
        role="dialog"
        aria-modal="true"
        aria-label="Sign in to RigTrak"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lp-core">
          <button className="lp-modal-x" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>

          <span className="lp-eyebrow">
            <span className="lp-dot" />
            Demo access
          </span>
          <h3>Sign in</h3>
          <p className="lp-modal-sub">Pick up where your yard left off.</p>

          <form onSubmit={submit}>
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-email">
                Email
              </label>
              <input
                ref={emailRef}
                id="lp-email"
                type="email"
                className="lp-input"
                placeholder="you@company.com.au"
                autoComplete="email"
              />
            </div>
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-pw">
                Password
              </label>
              <input
                id="lp-pw"
                type="password"
                className="lp-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="lp-btn lp-btn-primary lp-btn-submit">
              Enter dashboard
              <span className="lp-btn-icon">
                <Icon name="arrow-up-right" />
              </span>
            </button>
          </form>

          <p className="lp-modal-note">
            Demo build — credentials aren&apos;t checked and nothing is sent anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
