"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/styles";

/**
 * Fades + lifts its children in as they enter the viewport. Uses
 * IntersectionObserver rather than a scroll listener so there is no reflow on
 * every frame, and unobserves once shown — the reveal only ever plays once.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cx(
        // blur-[0px], not blur-0: v4 reworked the blur scale and blur-0 emits
        // nothing, which silently leaves the element blurred forever.
        "opacity-0 translate-y-16 blur-md transition-[opacity,transform,filter] duration-[900ms] ease-fluid will-change-transform",
        "data-[shown=true]:opacity-100 data-[shown=true]:translate-y-0 data-[shown=true]:blur-[0px] data-[shown=true]:will-change-auto",
        "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:blur-[0px] motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
