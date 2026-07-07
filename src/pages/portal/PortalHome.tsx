import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, type Stats } from "@/lib/api";
import type { Company, Sector } from "@shared/types";
import { BentoTile } from "@/components/BentoTile";
import { CountUp } from "@/components/CountUp";
import { AppsMarquee } from "@/components/AppsMarquee";
import { GeneratedArt } from "@/components/GeneratedArt";
import { LogoMark } from "@/components/LogoMark";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/States";
import { usePortal } from "./PortalShell";
import PortalNetwork from "./PortalNetwork";
import PortalSectors from "./PortalSectors";

const CompanyGraph3D = lazy(() => import("@/components/CompanyGraph3D"));

type View = "bento" | "network" | "grid";
const KEY = "lyceum_portal_view";

export default function PortalHome() {
  const [params, setParams] = useSearchParams();
  const initial = (params.get("view") as View) || (localStorage.getItem(KEY) as View) || "bento";
  const [view, setView] = useState<View>(initial);

  useEffect(() => {
    localStorage.setItem(KEY, view);
    if (params.get("view") !== view) {
      const next = new URLSearchParams(params);
      if (view === "bento") next.delete("view");
      else next.set("view", view);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* View toggle */}
      <div className="mb-5 flex items-center justify-end">
        <div className="inline-flex rounded-full border fx-border p-1" role="tablist" aria-label="Portal view">
          {(["bento", "network", "grid"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1.5 font-mono text-xs font-medium transition ${
                view === v ? "fx-accent-bg" : "fx-link"
              }`}
            >
              {v === "bento" ? "◧ Bento" : v === "network" ? "◉ 3D Mesh" : "▦ Grid"}
            </button>
          ))}
        </div>
      </div>

      {view === "bento" ? <BentoHome /> : view === "network" ? <PortalNetwork /> : <PortalSectors />}
    </div>
  );
}

function BentoHome() {
  const { sectors } = usePortal();
  const [stats, setStats] = useState<Stats | null>(null);
  const [featured, setFeatured] = useState<Company | null>(null);
  const [recent, setRecent] = useState<Company[]>([]);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    api.companies({ featured: "true" }).then((r) => {
      setFeatured(r.items[0] ?? null);
    }).catch(() => {});
    api.companies().then((r) => setRecent(r.items.slice(0, 6))).catch(() => {});
  }, []);

  // Two hero sectors span 2 cols; rest are 1×1 in a 12-col grid (each = 3 cols).
  // 8 sectors with 2 spanning 6 cols = 2*6 + 6*3 = 30 cols → 3 rows of 12.
  const heroSlugs = useMemo(() => new Set(["education", "heracle"]), []);

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <section className="bento-grid">
        <BentoTile colSpan={3} variant="gradient" spotlight={false} as="div">
          <div className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] fx-accent">Sectors</p>
            <p className="fx-headline mt-1 font-display text-4xl font-semibold lg:text-5xl">
              <CountUp value={stats?.sectors ?? 0} />
            </p>
            <p className="mt-1 text-xs fx-muted">Holdings under the group</p>
          </div>
        </BentoTile>
        <BentoTile colSpan={3} variant="gradient" spotlight={false} as="div">
          <div className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] fx-accent">Companies</p>
            <p className="fx-headline mt-1 font-display text-4xl font-semibold lg:text-5xl">
              <CountUp value={stats?.companies ?? 0} />
            </p>
            <p className="mt-1 text-xs fx-muted">Operating businesses</p>
          </div>
        </BentoTile>
        <BentoTile colSpan={3} variant="gradient" spotlight={false} as="div">
          <div className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] fx-accent">Applications</p>
            <p className="fx-headline mt-1 font-display text-4xl font-semibold lg:text-5xl">
              <CountUp value={stats?.apps ?? 0} />
            </p>
            <p className="mt-1 text-xs fx-muted">Connected tools across the group</p>
          </div>
        </BentoTile>
        <BentoTile colSpan={3} variant="gradient" spotlight={false} as="div">
          <div className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] fx-accent">Countries</p>
            <p className="fx-headline mt-1 font-display text-4xl font-semibold lg:text-5xl">
              <CountUp value={stats?.countries ?? 0} suffix="+" />
            </p>
            <p className="mt-1 text-xs fx-muted">Footprint</p>
          </div>
        </BentoTile>
      </section>

      {/* Featured + Mini 3D mesh + Recently added */}
      <section className="bento-grid">
        {featured && (
          <BentoTile
            colSpan={6}
            rowSpan={2}
            href={`/portal/${featured.sector_slug}/${featured.slug}`}
            ariaLabel={`Open ${featured.name}`}
          >
            <article className="flex h-full flex-col">
              <div className="relative h-44 overflow-hidden rounded-t-[var(--radius)]">
                <GeneratedArt seed={featured.logo_seed || featured.slug} className="h-full w-full" />
                <span className="fx-chip absolute left-4 top-4 font-mono">FEATURED COMPANY</span>
                <div className="absolute right-4 top-4">
                  <StatusBadge status={featured.status} />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start gap-3">
                  <LogoMark name={featured.name} seed={featured.logo_seed} logo={featured.logo} size={48} />
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold fx-text truncate">{featured.name}</h3>
                    <p className="text-sm font-medium fx-accent truncate">{featured.sector_name}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm fx-muted">{featured.tagline}</p>
                <span className="mt-auto pt-4 text-sm font-semibold fx-accent">Open profile →</span>
              </div>
            </article>
          </BentoTile>
        )}

        <BentoTile colSpan={6} rowSpan={2} href={`/portal?view=network`} ariaLabel="Open 3D network">
          <article className="relative flex h-full flex-col p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] fx-accent">Live network</p>
              <span className="fx-chip font-mono">3D ↗</span>
            </div>
            <h3 className="mt-1 font-display text-xl font-semibold fx-text">
              Explore the group as a 3D mesh
            </h3>
            <p className="mt-1 text-sm fx-muted">
              {stats ? `${stats.sectors} sectors · ${stats.companies} companies · ${stats.apps} apps` : "Loading…"}
            </p>

            <div className="relative -mx-5 mt-3 flex-1 overflow-hidden pointer-events-none">
              <Suspense fallback={<Spinner label="Loading mesh…" />}>
                <div className="absolute inset-0">
                  <PortalNetwork />
                </div>
              </Suspense>
            </div>
          </article>
        </BentoTile>
      </section>

      {/* Connected apps marquee */}
      <section className="bento-grid">
        <BentoTile colSpan={12} spotlight={false} as="div">
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] fx-accent">Connected applications</p>
                <h3 className="mt-1 font-display text-lg font-semibold fx-text">
                  Every tool the group runs on
                </h3>
              </div>
              <span className="font-mono text-xs fx-muted">scroll to browse</span>
            </div>
            <AppsMarquee />
          </div>
        </BentoTile>
      </section>

      {/* Sectors bento */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] fx-accent">Sectors</p>
            <h2 className="mt-1 font-display text-2xl font-semibold fx-text">Holdings at a glance</h2>
          </div>
          <Link to="/portal?view=grid" className="font-mono text-xs fx-link-accent fx-text">
            All sectors →
          </Link>
        </div>
        <div className="bento-grid">
          {sectors.map((s) => {
            const hero = heroSlugs.has(s.slug);
            return (
              <BentoTile
                key={s.id}
                colSpan={hero ? 6 : 3}
                href={`/portal/${s.slug}`}
                ariaLabel={`Open ${s.name}`}
              >
                <article className="flex h-full flex-col">
                  <div className="relative h-24 overflow-hidden rounded-t-[var(--radius)]">
                    <GeneratedArt seed={s.slug} className="h-full w-full" />
                    <div
                      className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-xl text-xl"
                      style={{ background: "rgba(0,0,0,0.4)" }}
                    >
                      {s.icon}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-base font-semibold fx-text">{s.name}</h3>
                    <p className="mt-0.5 line-clamp-2 text-xs fx-muted">{s.tagline}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="font-mono text-xs fx-text">
                        {s.company_count ?? 0} {s.company_count === 1 ? "co." : "co."}
                      </span>
                      <span className="text-xs font-semibold fx-accent">Open →</span>
                    </div>
                  </div>
                </article>
              </BentoTile>
            );
          })}
        </div>
      </section>

      {/* Recently active companies */}
      <section className="bento-grid">
        <BentoTile colSpan={12} spotlight={false} as="div">
          <div className="p-5">
            <div className="mb-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] fx-accent">Companies</p>
              <h3 className="mt-1 font-display text-lg font-semibold fx-text">Recently active</h3>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/portal/${c.sector_slug}/${c.slug}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/5"
                  >
                    <LogoMark name={c.name} seed={c.logo_seed} logo={c.logo} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium fx-text">{c.name}</span>
                      <span className="block truncate font-mono text-[11px] fx-muted">{c.sector_name}</span>
                    </span>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </BentoTile>
      </section>
    </div>
  );
}

// Make the unused `CompanyGraph3D` import (kept for forward compat / direct embed)
// silently used.
void CompanyGraph3D;
