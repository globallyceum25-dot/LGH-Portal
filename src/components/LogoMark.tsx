import { useState } from "react";
import { initials, seedColors } from "@/lib/format";

/**
 * Renders the company's real logo (when `logo` is provided) on a seeded
 * gradient tile, or falls back to a seeded gradient + initials when no logo
 * is available or the image fails to load.
 */
export function LogoMark({
  name,
  seed,
  size = 48,
  rounded = "rounded-xl",
  logo,
}: {
  name: string;
  seed: string;
  size?: number;
  rounded?: string;
  logo?: string;
}) {
  const [c1, c2] = seedColors(seed || name);
  const id = `g-${(seed || name).replace(/[^a-z0-9]/gi, "")}`;
  const [imgOk, setImgOk] = useState(true);
  const hasLogo = !!logo && imgOk;

  return (
    <span
      className={`fx-glow relative inline-flex shrink-0 items-center justify-center font-display font-semibold text-white ${rounded}`}
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
      {hasLogo ? (
        <img
          src={logo}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className={`relative ${rounded} object-contain`}
          style={{
            width: size * 0.78,
            height: size * 0.78,
            // Inverts dark-on-white logos onto our gradient for legibility.
            filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.18))",
          }}
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="relative">{initials(name)}</span>
      )}
    </span>
  );
}
