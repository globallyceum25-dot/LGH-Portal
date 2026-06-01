import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type Stats } from "@/lib/api";
import { ThemeBackground } from "@/components/ThemeBackground";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function Landing() {
  const [stats, setStats] = useState<Stats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <ThemeBackground />

      <Link to="/admin" className="fx-btn-ghost absolute right-5 top-5 !px-3 !py-2 text-xs">
        Admin
      </Link>

      <div className="relative w-full max-w-3xl text-center">
        <div className="mx-auto mb-8 flex items-center justify-center gap-3">
          <span className="fx-glow grid h-14 w-14 place-items-center rounded-2xl font-display text-2xl font-bold fx-accent-bg">
            L
          </span>
        </div>

        <p className="fx-chip mx-auto mb-6 w-fit font-mono">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)", boxShadow: "var(--glow)" }} />
          LYCEUM GLOBAL HOLDINGS · PORTAL
        </p>

        <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
          <span className="fx-headline">Enter the holdings portal</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed fx-muted">
          Explore every sector and company across the group — and launch the
          applications each business runs, all from one futuristic command centre.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate("/portal")} className="fx-btn text-base">
            Enter portal →
          </button>
        </div>

        {stats && (
          <dl className="mx-auto mt-16 grid max-w-xl grid-cols-3 gap-8 border-t fx-border pt-8">
            {[
              { label: "Sectors", value: stats.sectors },
              { label: "Companies", value: stats.companies },
              { label: "Countries", value: `${stats.countries}+` },
            ].map((s) => (
              <div key={s.label}>
                <dt className="fx-headline fx-glow-text font-display text-4xl font-semibold">{s.value}</dt>
                <dd className="mt-1 font-mono text-xs uppercase tracking-wide fx-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <ThemeSwitcher />
    </div>
  );
}
