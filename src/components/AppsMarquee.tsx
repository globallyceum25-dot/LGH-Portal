import { useEffect, useState } from "react";
import { seedColors } from "@/lib/format";
import { api } from "@/lib/api";

interface AppEntry {
  id: number;
  name: string;
  url: string;
  category: string;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

function Pill({ app }: { app: AppEntry }) {
  const host = hostOf(app.url);
  const [c1] = seedColors(host);
  const [ok, setOk] = useState(true);
  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="fx-glass flex shrink-0 items-center gap-2.5 !rounded-full px-3 py-2"
      title={`Open ${app.name}`}
    >
      <span
        className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-white shadow"
        style={{ outline: `1px solid color-mix(in srgb, ${c1} 55%, transparent)` }}
      >
        {ok ? (
          <img
            src={`https://${host}/favicon.ico`}
            alt=""
            width={18}
            height={18}
            className="h-[18px] w-[18px] object-contain"
            onError={() => setOk(false)}
          />
        ) : (
          <span className="font-display text-[10px] font-bold" style={{ color: c1 }}>
            {host.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>
      <span className="text-sm font-medium fx-text whitespace-nowrap">{app.name}</span>
      <span className="font-mono text-[10px] uppercase tracking-wide fx-muted whitespace-nowrap">{host}</span>
    </a>
  );
}

/**
 * Horizontal infinite-scroll marquee of every connected application across the
 * group. Pauses on hover. Disabled under prefers-reduced-motion (CSS).
 */
export function AppsMarquee() {
  const [items, setItems] = useState<AppEntry[]>([]);

  useEffect(() => {
    // Collect apps from every company. graph() gives us app nodes with id/url/name.
    api
      .graph()
      .then((g) => {
        const apps: AppEntry[] = g.nodes
          .filter((n) => n.type === "app" && n.url)
          .map((n, i) => ({
            id: i,
            name: n.name,
            url: n.url!,
            category: "",
          }));
        setItems(apps);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  // Duplicate the array so the loop wraps seamlessly.
  const doubled = [...items, ...items];

  return (
    <div className="fx-marquee">
      <div className="fx-marquee__track">
        {doubled.map((a, i) => (
          <Pill key={`${a.id}-${i}`} app={a} />
        ))}
      </div>
    </div>
  );
}
