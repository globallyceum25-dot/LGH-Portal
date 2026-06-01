import { useRef, type MouseEvent } from "react";

/**
 * Pointer-driven 3D tilt for cards. Returns props to spread on the element.
 * No-ops when the user prefers reduced motion.
 */
export function useTilt(max = 8) {
  const ref = useRef<HTMLElement | null>(null);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const onMouseMove = (e: MouseEvent) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
  };

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return {
    ref: ref as React.RefObject<any>,
    onMouseMove,
    onMouseLeave,
    className: "fx-tilt",
  };
}
