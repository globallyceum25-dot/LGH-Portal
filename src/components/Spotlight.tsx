import { useRef, type MouseEvent, type ReactNode } from "react";

/**
 * Cursor-follow spotlight glow. Writes --mx/--my CSS vars on the element so
 * the `.fx-spot::before` radial gradient tracks the cursor. No-ops under
 * prefers-reduced-motion (handled by the CSS layer).
 */
export function Spotlight({
  children,
  className = "",
  as: As = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: any;
  [key: string]: any;
}) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <As ref={ref as any} onMouseMove={onMove} className={`fx-spot ${className}`} {...rest}>
      {children}
    </As>
  );
}
