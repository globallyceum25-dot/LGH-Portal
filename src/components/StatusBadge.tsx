import type { CompanyStatus } from "@shared/types";
import { STATUS_META } from "@/lib/format";

export function StatusBadge({ status }: { status: CompanyStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.active;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium ring-1 ring-inset backdrop-blur"
      style={{
        color: meta.color,
        background: `color-mix(in srgb, ${meta.color} 16%, transparent)`,
        // @ts-expect-error css var for ring color
        "--tw-ring-color": `color-mix(in srgb, ${meta.color} 40%, transparent)`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
      {meta.label}
    </span>
  );
}
