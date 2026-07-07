import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import type { Company } from "@shared/types";
import { LogoMark } from "./LogoMark";
import { StatusBadge } from "./StatusBadge";
import { AppThumbnail } from "./AppThumbnail";

/**
 * In-scene floating glass panel shown when a company node is selected in the
 * 3D mesh. Fetches full detail + connected applications without leaving the scene.
 */
export function CompanyPanel({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCompany(null);
    api.company(slug).then(setCompany).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const apps = company?.applications ?? [];

  return (
    <aside
      className="pointer-events-auto absolute right-4 top-4 bottom-4 z-20 flex w-full max-w-md flex-col overflow-hidden fx-glass shadow-2xl animate-fade-up"
      role="dialog"
      aria-label="Company details"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 fx-text backdrop-blur transition hover:bg-black/70"
      >
        ✕
      </button>

      {loading || !company ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: "var(--surface-border)", borderTopColor: "var(--accent)" }} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start gap-4">
            <LogoMark name={company.name} seed={company.logo_seed} logo={company.logo} size={64} rounded="rounded-2xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-semibold">
                  <span className="fx-headline">{company.name}</span>
                </h2>
                <StatusBadge status={company.status} />
              </div>
              <p className="mt-1 text-sm fx-muted">{company.tagline}</p>
              <p className="mt-1 font-mono text-xs fx-accent">{company.sector_name}</p>
            </div>
          </div>

          {/* Connected applications */}
          <div className="mt-6">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] fx-muted">
              Connected applications · {apps.length}
            </h3>
            {apps.length === 0 ? (
              <p className="mt-2 text-sm fx-muted">No applications connected.</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {apps.map((a) => (
                  <AppThumbnail key={a.id} app={a} />
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="mt-6">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] fx-muted">Business profile</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed fx-muted">{company.overview}</p>
          </div>

          {company.mission && (
            <p className="mt-4 border-l-2 pl-3 font-display text-base italic fx-text" style={{ borderColor: "var(--accent)" }}>
              “{company.mission}”
            </p>
          )}

          {/* Facts */}
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              ["CEO", company.ceo],
              ["Founded", company.founded_year],
              ["HQ", company.headquarters],
              ["Employees", company.employees],
              ["Revenue", company.revenue],
              ["Country", company.country],
            ].map(([label, value]) =>
              value ? (
                <div key={label as string}>
                  <dt className="font-mono text-[10px] uppercase tracking-wide fx-muted">{label}</dt>
                  <dd className="text-sm font-medium fx-text">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>

          <Link
            to={`/portal/${company.sector_slug}/${company.slug}`}
            className="fx-btn-ghost mt-6 w-full text-sm"
          >
            Open full page →
          </Link>
        </div>
      )}
    </aside>
  );
}
