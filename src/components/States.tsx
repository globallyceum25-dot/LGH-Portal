export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 fx-muted">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2"
        style={{ borderColor: "var(--surface-border)", borderTopColor: "var(--accent)" }}
      />
      <span className="font-mono text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="fx-glass py-16 text-center" style={{ borderStyle: "dashed" }}>
      <p className="font-display text-lg font-semibold fx-text">{title}</p>
      {hint && <p className="mt-2 text-sm fx-muted">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl py-12 text-center"
      style={{
        background: "color-mix(in srgb, #ef4444 12%, transparent)",
        border: "1px solid color-mix(in srgb, #ef4444 35%, transparent)",
        color: "#fca5a5",
      }}
    >
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}

export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}
