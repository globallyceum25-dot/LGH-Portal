import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { api } from "@/lib/api";
import type { Sector } from "@shared/types";
import { ThemeBackground } from "@/components/ThemeBackground";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { CommandPalette } from "@/components/CommandPalette";

interface PortalCtx {
  sectors: Sector[];
}
export function usePortal() {
  return useOutletContext<PortalCtx>();
}

function titleCase(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function PortalShell() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    api.sectors().then(setSectors).catch(() => {});
  }, []);

  // Breadcrumb from /portal/:sector/:company
  const parts = pathname.split("/").filter(Boolean);
  const sectorSlug = parts[1];
  const companySlug = parts[2];
  const sectorName =
    sectors.find((s) => s.slug === sectorSlug)?.name ?? (sectorSlug && titleCase(sectorSlug));

  const crumbs: { label: string; to: string }[] = [{ label: "Portal", to: "/portal" }];
  if (sectorSlug) crumbs.push({ label: sectorName as string, to: `/portal/${sectorSlug}` });
  if (companySlug) crumbs.push({ label: titleCase(companySlug), to: pathname });

  return (
    <div className="relative min-h-screen">
      <ThemeBackground />

      {/* Floating glass rail (icon-only sector chips) */}
      <aside
        className="fx-glass fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1 p-2 md:flex"
        aria-label="Sectors"
        style={{ minWidth: 56 }}
      >
        <NavLink
          to="/portal"
          end
          title="Portal home"
          className={({ isActive }) =>
            `grid h-10 w-10 place-items-center rounded-xl transition ${
              isActive ? "fx-accent-bg" : "fx-link hover:bg-white/5"
            }`
          }
        >
          <span aria-hidden>◎</span>
        </NavLink>
        <div className="my-1 h-px" style={{ background: "var(--surface-border)" }} />
        {sectors.map((s) => (
          <NavLink
            key={s.id}
            to={`/portal/${s.slug}`}
            title={s.name}
            className={({ isActive }) =>
              `relative grid h-10 w-10 place-items-center rounded-xl text-lg transition ${
                isActive ? "fx-accent-bg" : "fx-link hover:bg-white/5"
              }`
            }
            style={({ isActive }: any) =>
              !isActive
                ? {
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${s.accent} 35%, transparent)`,
                  }
                : undefined
            }
          >
            <span aria-hidden>{s.icon}</span>
            <span
              className="absolute -right-1 -top-1 h-2 w-2 rounded-full ring-1 ring-black/30"
              style={{ background: s.accent }}
              aria-hidden
            />
          </NavLink>
        ))}
      </aside>

      {/* Top glass capsule: brand + ⌘K + breadcrumb + admin */}
      <header
        className="fixed left-1/2 top-3 z-30 flex w-[min(1100px,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-3 fx-glass px-3 py-2"
        style={{ borderRadius: "9999px" }}
      >
        <Link to="/" className="flex items-center gap-2.5 pl-1 pr-2" aria-label="Home">
          <span className="fx-glow grid h-8 w-8 place-items-center rounded-lg font-display text-base font-bold fx-accent-bg">
            L
          </span>
          <span className="hidden font-display text-sm font-semibold fx-text sm:block">
            Lyceum Portal
          </span>
        </Link>

        <div className="mx-1 hidden h-6 w-px sm:block" style={{ background: "var(--surface-border)" }} />

        {/* ⌘K trigger — looks like a search field */}
        <button
          onClick={() => setPaletteOpen(true)}
          className="group flex flex-1 items-center justify-between gap-3 rounded-full px-3 py-1.5 text-left text-sm fx-link transition hover:bg-white/5"
          style={{ border: "1px solid var(--surface-border)" }}
          aria-label="Open command palette"
        >
          <span className="flex items-center gap-2 truncate">
            <span aria-hidden>🔎</span>
            <span className="truncate">Search sectors, companies, applications…</span>
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <kbd className="fx-kbd">⌘</kbd>
            <kbd className="fx-kbd">K</kbd>
          </span>
        </button>

        <Link to="/admin" className="fx-btn-ghost !px-3 !py-1.5 text-xs">
          Admin
        </Link>
      </header>

      {/* Optional breadcrumb bar (only on deep pages) */}
      {crumbs.length > 1 && (
        <nav
          className="fixed left-1/2 top-[3.7rem] z-20 -translate-x-1/2 rounded-full fx-glass px-3 py-1 font-mono text-[11px] fx-muted"
          aria-label="Breadcrumb"
        >
          {crumbs.map((c, i) => (
            <span key={c.to} className="inline-flex items-center gap-2">
              {i > 0 && <span>/</span>}
              {i < crumbs.length - 1 ? (
                <Link to={c.to} className="fx-link uppercase tracking-wide">{c.label}</Link>
              ) : (
                <span className="fx-accent uppercase tracking-wide">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Main column */}
      <main
        key={pathname}
        className="animate-fade-up px-4 pb-12 pt-20 sm:px-6 md:pl-24 lg:px-8 lg:pl-24"
      >
        <Outlet context={{ sectors } satisfies PortalCtx} />
      </main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ThemeSwitcher />
    </div>
  );
}
