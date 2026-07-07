import { Link } from "react-router-dom";
import type { Company, Sector } from "@shared/types";
import { LogoMark } from "./LogoMark";
import { StatusBadge } from "./StatusBadge";
import { GeneratedArt } from "./GeneratedArt";
import { useTilt } from "@/lib/useTilt";

export function SectorCard({ sector, to }: { sector: Sector; to?: string }) {
  const tilt = useTilt(6);
  return (
    <Link to={to ?? `/sectors/${sector.slug}`} className="group block">
      <article {...tilt} className="fx-card flex h-full flex-col">
        <div className="relative h-28 overflow-hidden">
          <GeneratedArt seed={sector.slug} className="h-full w-full" />
          <div
            className="absolute left-4 top-4 grid h-12 w-12 place-items-center rounded-xl text-2xl backdrop-blur"
            style={{ background: "rgba(0,0,0,0.35)" }}
          >
            {sector.icon}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl font-semibold fx-text">{sector.name}</h3>
          <p className="mt-1 text-sm font-medium fx-accent">{sector.tagline}</p>
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed fx-muted">
            {sector.description}
          </p>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="font-mono fx-text">
              {sector.company_count ?? 0} {sector.company_count === 1 ? "company" : "companies"}
            </span>
            <span className="font-medium fx-accent transition-transform group-hover:translate-x-1">
              Explore →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function CompanyCard({ company, to }: { company: Company; to?: string }) {
  const tilt = useTilt(7);
  return (
    <Link to={to ?? `/companies/${company.slug}`} className="group block">
      <article {...tilt} className="fx-card flex h-full flex-col">
        <div className="relative h-24 overflow-hidden">
          <GeneratedArt seed={company.logo_seed || company.slug} className="h-full w-full" />
          <div className="absolute right-3 top-3">
            <StatusBadge status={company.status} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6 pt-0">
          <div className="-mt-7 mb-3">
            <LogoMark name={company.name} seed={company.logo_seed} logo={company.logo} size={52} />
          </div>
          <h3 className="font-display text-lg font-semibold fx-text">{company.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed fx-muted">{company.tagline}</p>
          <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs fx-muted">
            {company.headquarters && (
              <div className="flex items-center gap-1"><span aria-hidden>📍</span><dd>{company.headquarters}</dd></div>
            )}
            {company.founded_year && (
              <div className="flex items-center gap-1"><span aria-hidden>📅</span><dd>EST {company.founded_year}</dd></div>
            )}
          </dl>
          {company.sector_name && (
            <span className="fx-chip mt-4 w-fit">{company.sector_name}</span>
          )}
        </div>
      </article>
    </Link>
  );
}
