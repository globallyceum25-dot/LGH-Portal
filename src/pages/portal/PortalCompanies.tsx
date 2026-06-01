import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { Application, Company, Sector } from "@shared/types";
import { Spinner, ErrorState, EmptyState } from "@/components/States";
import { GeneratedArt } from "@/components/GeneratedArt";
import { LogoMark } from "@/components/LogoMark";
import { StatusBadge } from "@/components/StatusBadge";
import { Spotlight } from "@/components/Spotlight";

// Tiny inline app preview shown on hover
function AppPreview({ url, name }: { url: string; name: string }) {
  const host = (() => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
  })();
  return (
    <span className="flex items-center gap-2">
      <img
        src={`https://${host}/favicon.ico`}
        alt=""
        width={16}
        height={16}
        className="h-4 w-4 rounded bg-white"
        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
      />
      <span className="truncate font-mono text-[11px] fx-text">{name}</span>
    </span>
  );
}

function CompanyTile({ company, sector }: { company: Company; sector: Sector }) {
  const [hovering, setHovering] = useState(false);
  const [apps, setApps] = useState<Application[] | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lazy-fetch apps on first hover
  useEffect(() => {
    if (hovering && apps === null) {
      api.company(company.slug).then((c) => setApps(c.applications ?? [])).catch(() => setApps([]));
    }
  }, [hovering, apps, company.slug]);

  const accentBorder = `inset 0 0 0 1px color-mix(in srgb, ${sector.accent} 35%, transparent)`;

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Spotlight as="div" className="fx-glass flex flex-col" style={{ boxShadow: accentBorder }}>
        <Link to={`/portal/${sector.slug}/${company.slug}`} className="flex flex-col">
          <div className="relative h-20 overflow-hidden rounded-t-[var(--radius)]">
            <GeneratedArt seed={company.logo_seed || company.slug} className="h-full w-full" />
            <div className="absolute right-2 top-2">
              <StatusBadge status={company.status} />
            </div>
          </div>
          <div className="flex flex-col p-4 pt-0">
            <div className="-mt-6 mb-2">
              <LogoMark name={company.name} seed={company.logo_seed} size={44} />
            </div>
            <h3 className="font-display text-base font-semibold fx-text">{company.name}</h3>
            <p className="mt-0.5 line-clamp-2 text-xs fx-muted">{company.tagline}</p>
          </div>
        </Link>
      </Spotlight>

      {/* Hover popover with connected apps */}
      {hovering && apps && apps.length > 0 && (
        <div
          className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 fx-glass p-3 shadow-2xl animate-fade-up"
          role="tooltip"
        >
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] fx-accent">
            Connected apps · {apps.length}
          </p>
          <ul className="space-y-1.5">
            {apps.slice(0, 3).map((a) => (
              <li key={a.id}>
                <AppPreview name={a.name} url={a.url} />
              </li>
            ))}
            {apps.length > 3 && (
              <li className="font-mono text-[10px] fx-muted">+ {apps.length - 3} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PortalCompanies() {
  const { sectorSlug } = useParams();
  const [sector, setSector] = useState<Sector | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .sector(sectorSlug!)
      .then((d) => {
        setSector(d.sector);
        setCompanies(d.companies);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sectorSlug]);

  if (loading) return <Spinner />;
  if (error || !sector) return <ErrorState message={error || "Sector not found"} />;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="fx-glass relative mb-6 overflow-hidden p-6">
        <div className="absolute inset-0 opacity-30">
          <GeneratedArt seed={sector.slug} className="h-full w-full" />
        </div>
        <div className="relative flex items-start gap-4">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            {sector.icon}
          </div>
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] fx-accent">
              Sector · {companies.length} companies
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold fx-text lg:text-3xl">
              {sector.name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm fx-muted">{sector.description}</p>
          </div>
        </div>
      </header>

      {companies.length === 0 ? (
        <EmptyState title="No companies in this sector yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {companies.map((c) => (
            <CompanyTile key={c.id} company={c} sector={sector} />
          ))}
        </div>
      )}
    </div>
  );
}
