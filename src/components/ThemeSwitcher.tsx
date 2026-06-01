import { useEffect, useRef, useState } from "react";
import { THEMES, useTheme } from "@/lib/theme";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const current = THEMES.find((t) => t.id === theme)!;

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-50">
      {open && (
        <div
          className="fx-glass mb-3 w-64 p-2 shadow-2xl animate-fade-up"
          role="listbox"
          aria-label="Choose a theme"
        >
          <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] fx-muted">
            Theme
          </p>
          {THEMES.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/5"
                style={active ? { background: "color-mix(in srgb, var(--accent) 14%, transparent)" } : undefined}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-lg ring-1 ring-white/15"
                  style={{ background: t.swatch }}
                />
                <span className="flex-1">
                  <span className="block text-sm font-semibold fx-text">{t.label}</span>
                  <span className="block text-xs fx-muted">{t.tagline}</span>
                </span>
                {active && <span className="fx-accent text-sm">●</span>}
              </button>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch theme"
        className="fx-glass flex items-center gap-2.5 px-4 py-3 shadow-xl transition hover:scale-[1.03]"
      >
        <span
          className="h-5 w-5 rounded-md ring-1 ring-white/20"
          style={{ background: current.swatch }}
        />
        <span className="font-mono text-xs font-semibold fx-text">{current.label}</span>
      </button>
    </div>
  );
}
