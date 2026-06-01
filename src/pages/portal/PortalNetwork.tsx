import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { GraphData } from "@shared/types";
import { useTheme } from "@/lib/theme";
import { CompanyPanel } from "@/components/CompanyPanel";
import { Spinner } from "@/components/States";

const CompanyGraph3D = lazy(() => import("@/components/CompanyGraph3D"));

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function PortalNetwork() {
  const { theme } = useTheme();
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const hasWebgl = useMemo(() => webglAvailable(), []);

  useEffect(() => {
    api.graph().then(setGraph).catch((e) => setError(e.message));
  }, []);

  const launch = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  if (!hasWebgl) {
    return (
      <div className="fx-glass mx-auto max-w-lg p-8 text-center">
        <p className="font-display text-lg font-semibold fx-text">3D view unavailable</p>
        <p className="mt-2 text-sm fx-muted">
          Your browser doesn’t support WebGL. Switch to the grid view to explore the portal.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8.5rem)] w-full overflow-hidden rounded-2xl border fx-border">
      {error ? (
        <div className="grid h-full place-items-center">
          <p className="text-sm" style={{ color: "#fca5a5" }}>{error}</p>
        </div>
      ) : !graph ? (
        <Spinner label="Assembling network…" />
      ) : (
        <Suspense fallback={<Spinner label="Loading 3D engine…" />}>
          {/* key on theme so colours/background recompute on switch */}
          <CompanyGraph3D
            key={theme}
            data={graph}
            selectedId={selected ? `company:${selected}` : null}
            onSelectCompany={setSelected}
            onLaunchApp={launch}
          />
        </Suspense>
      )}

      {/* Hint */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 font-mono text-[11px] fx-muted" style={{ background: "color-mix(in srgb, var(--bg) 70%, transparent)" }}>
        drag to rotate · scroll to zoom · click a company to inspect · click an app to launch
      </div>

      {selected && <CompanyPanel slug={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
