import { useState } from "react";
import type { Application } from "@shared/types";
import { seedColors } from "@/lib/format";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

/**
 * Thumbnail for a connected application. A deterministic gradient tile (always
 * renders, offline-safe) with the site's favicon overlaid when reachable.
 * No third-party screenshot service is used.
 */
export function AppThumbnail({ app }: { app: Application }) {
  const host = hostOf(app.url);
  const [c1, c2] = seedColors(host);
  const [faviconOk, setFaviconOk] = useState(true);
  const favicon = `https://${host}/favicon.ico`;
  const initials = host.replace(/\..*$/, "").slice(0, 2).toUpperCase();

  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="fx-card group flex flex-col"
      title={`Open ${app.name} (${host})`}
    >
      <div
        className="relative grid h-28 place-items-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      >
        {/* subtle grid texture */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white/90 shadow-lg ring-1 ring-black/10">
          {faviconOk ? (
            <img
              src={favicon}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              onError={() => setFaviconOk(false)}
            />
          ) : (
            <span className="font-display text-lg font-bold" style={{ color: c1 }}>
              {initials}
            </span>
          )}
        </div>
        {/* launch affordance */}
        <span className="absolute right-2.5 top-2.5 rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
          OPEN ↗
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate font-display text-sm font-semibold fx-text">{app.name}</h4>
          {app.category && <span className="fx-chip shrink-0 !px-2 !py-0.5 !text-[10px]">{app.category}</span>}
        </div>
        <p className="mt-1 truncate font-mono text-xs fx-muted">{host}</p>
        {app.description && (
          <p className="mt-1 line-clamp-2 text-xs fx-muted">{app.description}</p>
        )}
      </div>
    </a>
  );
}
