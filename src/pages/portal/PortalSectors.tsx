import { usePortal } from "./PortalShell";
import { GeneratedArt } from "@/components/GeneratedArt";
import { BentoTile } from "@/components/BentoTile";
import { Spinner } from "@/components/States";

export default function PortalSectors() {
  const { sectors } = usePortal();

  // First sector spans 2x2, next 1 spans 2x1, rest 1x1 — a classic bento mix.
  const layout = (i: number): { colSpan: 3 | 6; rowSpan: 1 | 2 } => {
    if (i === 0) return { colSpan: 6, rowSpan: 2 };
    if (i === 1 || i === 4) return { colSpan: 6, rowSpan: 1 };
    return { colSpan: 3, rowSpan: 1 };
  };

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] fx-accent">
          Sectors
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold fx-text lg:text-4xl">
          Holdings under the group
        </h1>
        <p className="mt-2 max-w-2xl fx-muted">
          Choose a sector to browse its companies and connected applications.
        </p>
      </header>

      {sectors.length === 0 ? (
        <Spinner />
      ) : (
        <div className="bento-grid">
          {sectors.map((s, i) => {
            const { colSpan, rowSpan } = layout(i);
            const big = colSpan === 6 && rowSpan === 2;
            return (
              <BentoTile
                key={s.id}
                colSpan={colSpan}
                rowSpan={rowSpan}
                href={`/portal/${s.slug}`}
                ariaLabel={`Open ${s.name}`}
              >
                <article className="flex h-full flex-col">
                  <div
                    className={`relative overflow-hidden rounded-t-[var(--radius)] ${
                      big ? "h-44" : "h-24"
                    }`}
                  >
                    <GeneratedArt seed={s.slug} className="h-full w-full" />
                    <div
                      className="absolute left-4 top-4 grid place-items-center rounded-xl backdrop-blur"
                      style={{
                        width: big ? 56 : 44,
                        height: big ? 56 : 44,
                        fontSize: big ? 28 : 22,
                        background: "rgba(0,0,0,0.4)",
                      }}
                    >
                      {s.icon}
                    </div>
                    <span className="fx-chip absolute right-3 top-3 font-mono">
                      {s.company_count ?? 0} CO.
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className={`font-display font-semibold fx-text ${big ? "text-2xl" : "text-lg"}`}>
                      {s.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium" style={{ color: s.accent }}>
                      {s.tagline}
                    </p>
                    {big && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed fx-muted">
                        {s.description}
                      </p>
                    )}
                    <span className="mt-auto pt-4 text-sm font-semibold fx-accent">
                      Open sector →
                    </span>
                  </div>
                </article>
              </BentoTile>
            );
          })}
        </div>
      )}
    </div>
  );
}
