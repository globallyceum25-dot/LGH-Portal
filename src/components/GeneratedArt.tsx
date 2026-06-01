import { seedColors } from "@/lib/format";

/**
 * Deterministic abstract artwork seeded by a slug/string. Renders a layered
 * gradient plus a geometric "circuit/orbital" pattern so cards are visual,
 * not text-only. Colours derive from the shared seedColors() helper.
 */
export function GeneratedArt({
  seed,
  className = "",
  variant = "auto",
}: {
  seed: string;
  className?: string;
  variant?: "auto" | "orbital" | "grid" | "wave";
}) {
  const [c1, c2] = seedColors(seed);
  const id = `art-${seed.replace(/[^a-z0-9]/gi, "")}`;
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const kind =
    variant === "auto" ? (["orbital", "grid", "wave"] as const)[hash % 3] : variant;

  return (
    <svg
      className={className}
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`${id}-r`} cx="30%" cy="25%" r="80%">
          <stop offset="0%" stopColor={c2} stopOpacity="0.9" />
          <stop offset="100%" stopColor={c1} stopOpacity="0.7" />
        </radialGradient>
      </defs>

      <rect width="400" height="240" fill={`url(#${id}-r)`} />

      {kind === "orbital" && (
        <g fill="none" stroke="#fff" strokeOpacity="0.28">
          {[40, 80, 120, 165].map((r, i) => (
            <ellipse key={r} cx="300" cy="60" rx={r} ry={r * 0.62} strokeWidth={i === 1 ? 1.6 : 0.8} />
          ))}
          <circle cx="300" cy="60" r="10" fill="#fff" fillOpacity="0.85" stroke="none" />
          <circle cx="180" cy="98" r="4" fill="#fff" fillOpacity="0.9" stroke="none" />
          <circle cx="392" cy="150" r="5" fill="#fff" fillOpacity="0.7" stroke="none" />
        </g>
      )}

      {kind === "grid" && (
        <g stroke="#fff" strokeOpacity="0.22">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="240" strokeWidth="0.7" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 48} x2="400" y2={i * 48} strokeWidth="0.7" />
          ))}
          {[[100, 96], [250, 144], [350, 48]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill="#fff" fillOpacity="0.85" stroke="none" />
          ))}
        </g>
      )}

      {kind === "wave" && (
        <g fill="none" stroke="#fff" strokeOpacity="0.32">
          {[0, 26, 52, 78].map((off, i) => (
            <path
              key={off}
              d={`M0 ${120 + off} C 100 ${60 + off}, 300 ${180 + off}, 400 ${100 + off}`}
              strokeWidth={i === 0 ? 1.6 : 0.9}
            />
          ))}
        </g>
      )}

      <rect width="400" height="240" fill={`url(#${id})`} opacity="0.18" />
    </svg>
  );
}
