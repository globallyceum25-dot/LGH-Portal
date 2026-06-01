import type { CompanyStatus } from "@shared/types";

export const STATUS_META: Record<
  CompanyStatus,
  { label: string; color: string }
> = {
  active: { label: "Active", color: "#10b981" },
  growth: { label: "Growth", color: "#3b82f6" },
  incubating: { label: "Incubating", color: "#f59e0b" },
  divested: { label: "Divested", color: "#94a3b8" },
};

export const STATUS_OPTIONS: CompanyStatus[] = [
  "active",
  "growth",
  "incubating",
  "divested",
];

// Deterministic colour pair from a seed string, for generated logo marks.
export function seedColors(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return [`hsl(${h} 55% 32%)`, `hsl(${(h + 40) % 360} 60% 45%)`];
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
