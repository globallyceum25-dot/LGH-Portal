import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { Company, Sector } from "@shared/types";

type Item =
  | { kind: "sector"; id: string; name: string; tagline: string; icon: string; accent: string; slug: string }
  | { kind: "company"; id: string; name: string; tagline: string; sectorName: string; sectorSlug: string; slug: string }
  | { kind: "app"; id: string; name: string; companyName: string; url: string; host: string };

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

/** Tiny fuzzy match: returns score (lower=better) or -1 if no match. */
function score(query: string, text: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct === 0) return -1000;
  if (direct > 0) return -500 + direct;
  // subsequence
  let qi = 0;
  let last = -1;
  let gaps = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      if (last >= 0) gaps += i - last - 1;
      last = i;
      qi++;
    }
  }
  return qi === q.length ? gaps : Infinity;
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [apps, setApps] = useState<{ name: string; url: string; companyName: string }[]>([]);

  // Fetch the full index once (cheap; everything is already in memory server-side).
  useEffect(() => {
    api.sectors().then(setSectors).catch(() => {});
    api.companies().then((r) => setCompanies(r.items)).catch(() => {});
    api
      .graph()
      .then((g) => {
        // Apps: nodes of type 'app' linked to a company id "company:<slug>"
        const slugToName = new Map<string, string>();
        for (const n of g.nodes) {
          if (n.type === "company" && n.slug) slugToName.set(`company:${n.slug}`, n.name);
        }
        const parentOf = new Map<string, string>();
        for (const l of g.links) {
          const s = typeof l.source === "string" ? l.source : (l.source as any).id;
          const t = typeof l.target === "string" ? l.target : (l.target as any).id;
          if (t.startsWith("app:")) parentOf.set(t, s);
        }
        const collected: { name: string; url: string; companyName: string }[] = [];
        for (const n of g.nodes) {
          if (n.type === "app" && n.url) {
            const parent = parentOf.get(n.id) ?? "";
            const companyName = slugToName.get(parent) ?? "—";
            collected.push({ name: n.name, url: n.url, companyName });
          }
        }
        setApps(collected);
      })
      .catch(() => {});
  }, []);

  // Index → flat items
  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    for (const s of sectors) {
      out.push({
        kind: "sector",
        id: `sector:${s.slug}`,
        name: s.name,
        tagline: s.tagline,
        icon: s.icon,
        accent: s.accent,
        slug: s.slug,
      });
    }
    for (const c of companies) {
      out.push({
        kind: "company",
        id: `company:${c.slug}`,
        name: c.name,
        tagline: c.tagline,
        sectorName: c.sector_name ?? "",
        sectorSlug: c.sector_slug ?? "",
        slug: c.slug,
      });
    }
    for (const a of apps) {
      out.push({
        kind: "app",
        id: `app:${a.url}`,
        name: a.name,
        companyName: a.companyName,
        url: a.url,
        host: hostOf(a.url),
      });
    }
    return out;
  }, [sectors, companies, apps]);

  // Filter + rank
  const results = useMemo(() => {
    const query = q.trim();
    if (!query) {
      // empty: show a curated default — first 8 sectors then 6 companies
      return [...items.filter((i) => i.kind === "sector"), ...items.filter((i) => i.kind === "company").slice(0, 6)].slice(0, 14);
    }
    const ranked: { item: Item; s: number }[] = [];
    for (const it of items) {
      const hay = (it.name + " " + (it.kind === "company" ? it.sectorName : it.kind === "app" ? it.companyName + " " + it.host : it.tagline)).toLowerCase();
      const s = score(query, hay);
      if (s !== Infinity) ranked.push({ item: it, s });
    }
    ranked.sort((a, b) => a.s - b.s);
    return ranked.slice(0, 14).map((r) => r.item);
  }, [items, q]);

  // reset active row on results change
  useEffect(() => {
    setActive(0);
  }, [q, open]);

  // Focus the input on open
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
    else setQ("");
  }, [open]);

  // Global ⌘K / Ctrl+K toggle
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Keep the active row in view
  useEffect(() => {
    if (!open) return;
    const ul = listRef.current;
    if (!ul) return;
    const el = ul.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open, results]);

  if (!open) return null;

  const choose = (it: Item) => {
    onOpenChange(false);
    if (it.kind === "sector") navigate(`/portal/${it.slug}`);
    else if (it.kind === "company") navigate(`/portal/${it.sectorSlug}/${it.slug}`);
    else if (it.kind === "app") window.open(it.url, "_blank", "noopener,noreferrer");
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) choose(hit);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-start px-4 pt-[12vh]"
      style={{ background: "color-mix(in srgb, #000 55%, transparent)", backdropFilter: "blur(4px)" }}
      onClick={() => onOpenChange(false)}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="fx-glass w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b fx-border px-4 py-3">
          <span className="fx-muted">🔎</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search sectors, companies, applications…"
            className="flex-1 bg-transparent text-sm fx-text placeholder:fx-muted focus:outline-none"
            autoComplete="off"
            aria-label="Search"
          />
          <kbd className="fx-kbd">esc</kbd>
        </div>

        <ul ref={listRef} className="max-h-[55vh] overflow-y-auto p-2" role="listbox">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm fx-muted">No matches</li>
          ) : (
            results.map((it, i) => (
              <li
                key={it.id}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(it)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${
                  i === active ? "bg-white/8" : ""
                }`}
                style={
                  i === active
                    ? { background: "color-mix(in srgb, var(--accent) 14%, transparent)" }
                    : undefined
                }
              >
                {it.kind === "sector" && (
                  <>
                    <span
                      className="grid h-9 w-9 place-items-center rounded-lg text-lg"
                      style={{ background: `${it.accent}26` }}
                    >
                      {it.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold fx-text truncate">{it.name}</span>
                      <span className="block text-xs fx-muted truncate">{it.tagline}</span>
                    </span>
                    <span className="fx-chip !text-[10px] !py-0">SECTOR</span>
                  </>
                )}
                {it.kind === "company" && (
                  <>
                    <span className="grid h-9 w-9 place-items-center rounded-lg fx-accent-bg font-display text-sm font-bold">
                      {it.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold fx-text truncate">{it.name}</span>
                      <span className="block text-xs fx-muted truncate">{it.sectorName}</span>
                    </span>
                    <span className="fx-chip !text-[10px] !py-0">COMPANY</span>
                  </>
                )}
                {it.kind === "app" && (
                  <>
                    <img
                      src={`https://${it.host}/favicon.ico`}
                      alt=""
                      width={20}
                      height={20}
                      className="h-7 w-7 rounded bg-white p-1 object-contain"
                      onError={(e) => ((e.currentTarget.style.visibility = "hidden"))}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold fx-text truncate">{it.name}</span>
                      <span className="block text-xs fx-muted truncate">{it.host} · {it.companyName}</span>
                    </span>
                    <span className="fx-chip !text-[10px] !py-0">APP ↗</span>
                  </>
                )}
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between border-t fx-border px-4 py-2 font-mono text-[11px] fx-muted">
          <span><kbd className="fx-kbd">↑↓</kbd> navigate · <kbd className="fx-kbd">↵</kbd> open</span>
          <span><kbd className="fx-kbd">⌘K</kbd> toggle</span>
        </div>
      </div>
    </div>
  );
}
