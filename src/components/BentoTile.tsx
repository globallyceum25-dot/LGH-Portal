import type { ReactNode } from "react";
import { Spotlight } from "./Spotlight";

/**
 * Bento grid primitive: a glass tile with optional cursor-spotlight, animated
 * gradient border (variant="gradient"), and a configurable column/row span.
 */
export interface BentoTileProps {
  children: ReactNode;
  className?: string;
  colSpan?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
  rowSpan?: 1 | 2;
  variant?: "glass" | "gradient";
  spotlight?: boolean;
  as?: any;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export function BentoTile({
  children,
  className = "",
  colSpan = 6,
  rowSpan = 1,
  variant = "glass",
  spotlight = true,
  as,
  href,
  onClick,
  ariaLabel,
}: BentoTileProps) {
  const span = `col-span-${colSpan} ${rowSpan === 2 ? "row-span-2" : ""}`;
  const surface = variant === "gradient" ? "fx-card-grad" : "fx-glass";
  const base = `${surface} ${span} ${className}`;
  const interactive = href || onClick;
  const As: any = as ?? (href ? "a" : interactive ? "button" : "div");

  const props: any = { className: base, "aria-label": ariaLabel };
  if (href) {
    props.href = href;
  }
  if (onClick) {
    props.onClick = onClick;
    if (As === "button") props.type = "button";
  }

  if (spotlight && interactive) {
    return (
      <Spotlight as={As} {...props}>
        {children}
      </Spotlight>
    );
  }
  return <As {...props}>{children}</As>;
}
