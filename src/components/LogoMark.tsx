import { initials, seedColors } from "@/lib/format";

export function LogoMark({
  name,
  seed,
  size = 48,
  rounded = "rounded-xl",
}: {
  name: string;
  seed: string;
  size?: number;
  rounded?: string;
}) {
  const [c1, c2] = seedColors(seed || name);
  const id = `g-${(seed || name).replace(/[^a-z0-9]/gi, "")}`;
  return (
    <span
      className={`fx-glow relative inline-flex items-center justify-center font-display font-semibold text-white ${rounded}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      <svg width={size} height={size} className={`absolute inset-0 ${rounded}`}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <rect width={size} height={size} rx={size * 0.22} fill={`url(#${id})`} />
      </svg>
      <span className="relative">{initials(name)}</span>
    </span>
  );
}
