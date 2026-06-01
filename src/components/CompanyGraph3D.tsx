import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
// three has no bundled .d.ts in this install; import as any rather than add @types/three
// @ts-ignore
import * as THREE from "three";
import type { GraphData, GraphNode } from "@shared/types";
import { STATUS_META } from "@/lib/format";
import { useTheme } from "@/lib/theme";

// Bloom is OFF — even tuned, it blew out the focused-node ring + link into
// pure white. The focus ring + scene-dimming give plenty of "pop" without it.
const ENABLE_BLOOM = false;

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export interface CompanyGraph3DProps {
  data: GraphData;
  /** Graph-node id of the currently selected node (e.g. `company:<slug>`). */
  selectedId?: string | null;
  onSelectCompany: (slug: string) => void;
  onLaunchApp: (url: string) => void;
}

export default function CompanyGraph3D({
  data,
  selectedId,
  onSelectCompany,
  onLaunchApp,
}: CompanyGraph3DProps) {
  const { theme } = useTheme();
  const fgRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  // Hover state. Selection comes from props.
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const focusId = selectedId ?? hoveredId;
  // Refs that callbacks (closed over by the lib) read on each redraw.
  const focusIdRef = useRef<string | null>(null);
  focusIdRef.current = focusId;

  // Theme-derived colours
  const palette = useMemo(
    () => ({
      bg: cssVar("--bg", "#05070e"),
      accent: cssVar("--accent", "#22d3ee"),
      accent2: cssVar("--accent-2", "#e879f9"),
      muted: cssVar("--fg-muted", "#93a0c4"),
      fg: cssVar("--fg", "#e7ecfb"),
    }),
    [theme],
  );

  // Neighbour map: node id → ids it is linked to (both directions).
  const neighbours = useMemo(() => {
    const m = new Map<string, Set<string>>();
    const ensure = (id: string) => {
      let s = m.get(id);
      if (!s) m.set(id, (s = new Set()));
      return s;
    };
    for (const l of data.links) {
      const src = typeof l.source === "string" ? l.source : (l.source as any).id;
      const tgt = typeof l.target === "string" ? l.target : (l.target as any).id;
      ensure(src).add(tgt);
      ensure(tgt).add(src);
    }
    return m;
  }, [data.links]);

  // Quick map of id → node (for label-resolution e.g. "parent of focused company")
  const byId = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of data.nodes) m.set(n.id, n);
    return m;
  }, [data.nodes]);

  // ----- Visibility predicates -----------------------------------------------

  /** Should this node's persistent label be rendered? */
  const shouldShowLabel = useCallback(
    (n: GraphNode): boolean => {
      const fid = focusIdRef.current;
      if (!fid) {
        // Ambient: only the holding label, to avoid clutter.
        return n.type === "holding";
      }
      if (n.id === fid) return true;
      const focused = byId.get(fid);
      if (!focused) return false;
      // Holding focused → show all 8 sector labels too.
      if (focused.type === "holding") return n.type === "sector";
      // Sector focused → just the sector label (already returned above).
      // Company focused → also show its parent sector's label.
      if (focused.type === "company") {
        if (n.type !== "sector") return false;
        return n.slug === focused.sectorSlug;
      }
      // App focused → show parent company's label too.
      if (focused.type === "app") {
        const ns = neighbours.get(fid);
        return n.type === "company" && !!ns && ns.has(n.id);
      }
      return false;
    },
    [byId, neighbours],
  );

  /** Is this node the focus or a direct neighbour of the focus? */
  const isFocusOrNeighbour = (id: string): boolean => {
    const fid = focusIdRef.current;
    if (!fid) return true; // ambient: nothing is dimmed
    if (id === fid) return true;
    return neighbours.get(fid)?.has(id) ?? false;
  };

  // ----- Colour helpers ------------------------------------------------------

  // Reusable colour scratch (avoid per-frame allocations)
  const bgColor = useMemo(() => new THREE.Color(palette.bg), [palette.bg]);
  const dimColor = (hex: string): string => {
    const c = new THREE.Color(hex);
    c.lerp(bgColor, 0.8);
    return `#${c.getHexString()}`;
  };

  const baseNodeColor = useCallback(
    (n: GraphNode): string => {
      switch (n.type) {
        case "holding":
          return palette.accent;
        case "sector":
          return n.accent || palette.accent;
        case "company":
          return n.status ? STATUS_META[n.status].color : palette.accent2;
        default:
          return palette.muted;
      }
    },
    [palette],
  );

  const nodeColor = useCallback(
    (n: GraphNode): string => {
      const base = baseNodeColor(n);
      return isFocusOrNeighbour(n.id) ? base : dimColor(base);
    },
    // intentionally omit dimColor/isFocusOrNeighbour: they read focusIdRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseNodeColor, palette.bg],
  );

  // Per-link visual "opacity" is baked into the colour via lerping toward the
  // background — the lib doesn't accept a per-link opacity callback.
  const dimLinkColor = useMemo(() => {
    const c = new THREE.Color(palette.muted);
    c.lerp(bgColor, 0.92);
    return `#${c.getHexString()}`;
  }, [palette.muted, bgColor]);

  const ambientLinkColor = useMemo(() => {
    const c = new THREE.Color(palette.muted);
    c.lerp(bgColor, 0.55);
    return `#${c.getHexString()}`;
  }, [palette.muted, bgColor]);

  const linkColor = useCallback(
    (l: any): string => {
      const fid = focusIdRef.current;
      if (!fid) return ambientLinkColor;
      const src = typeof l.source === "string" ? l.source : l.source?.id;
      const tgt = typeof l.target === "string" ? l.target : l.target?.id;
      const touches = src === fid || tgt === fid;
      return touches ? palette.accent : dimLinkColor;
    },
    [palette.accent, ambientLinkColor, dimLinkColor],
  );

  const linkParticles = useCallback((l: any): number => {
    if (prefersReducedMotion) return 0;
    const fid = focusIdRef.current;
    if (!fid) return 1;
    const src = typeof l.source === "string" ? l.source : l.source?.id;
    const tgt = typeof l.target === "string" ? l.target : l.target?.id;
    return src === fid || tgt === fid ? 2 : 0;
  }, []);

  // ----- Three.js node objects (label + focus ring + scale) -------------------

  const makeRing = (color: string, radius: number, opacity: number) => {
    const geom = new THREE.RingGeometry(radius, radius * 1.08, 48);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const m = new THREE.Mesh(geom, mat);
    // Face the camera each frame
    (m as any).userData.billboard = true;
    return m;
  };

  const makeNodeObject = useCallback(
    (n: GraphNode): any => {
      const fid = focusIdRef.current;
      const isFocus = n.id === fid;
      const group = new THREE.Group();

      // App nodes: unlit sphere (so they're visible regardless of lighting).
      if (n.type === "app") {
        const r = Math.cbrt(n.val ?? 3) * 4 * 0.9;
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(r, 16, 12),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(nodeColor(n)) }),
        );
        group.add(sphere);
        if (isFocus) {
          group.add(makeRing(palette.accent, r * 1.8, 0.95));
          group.add(makeRing(palette.accent, r * 2.5, 0.25));
          (sphere as any).scale.set(1.35, 1.35, 1.35);
        }
      }

      // Persistent label (rules in shouldShowLabel)
      if (shouldShowLabel(n)) {
        const s = new SpriteText(n.name);
        s.color =
          n.type === "holding" || isFocus ? palette.fg : n.accent || palette.fg;
        s.textHeight =
          n.type === "holding" ? 7 : n.type === "sector" ? 4.8 : isFocus ? 4.2 : 3.6;
        s.fontWeight = "600";
        s.backgroundColor = false as any;
        (s as any).position.set(0, (n.val ?? 6) * 0.5 + (isFocus ? 9 : 6), 0);
        group.add(s);
      }

      // Focus ring for non-app nodes (the lib's default sphere handles geometry)
      if (isFocus && n.type !== "app") {
        const r = Math.cbrt(n.val ?? 6) * 4 * 0.95;
        group.add(makeRing(palette.accent, r * 1.7, 0.95));
        group.add(makeRing(palette.accent, r * 2.4, 0.25));
      }

      return group;
    },
    // focusId in deps so the lib sees a NEW callback ref → rebuilds node objects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [palette.accent, palette.fg, nodeColor, shouldShowLabel, focusId],
  );

  // Extend with our Group for all node types; for non-app types this adds our
  // ring/label on top of the lib's default sphere. For app, our group provides
  // the sphere itself (no default).
  const extendNodeObject = useCallback((n: GraphNode) => n.type !== "app", []);

  // Size to container
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: Math.max(320, r.width), h: Math.max(360, r.height) });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Refresh the lib's render whenever focus changes (so callbacks above are
  // re-invoked for colours / opacities / objects).
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    try {
      // Re-evaluate per-node three objects for ring/label changes.
      fg.refresh();
    } catch {}
  }, [focusId, theme]);

  // Keep the renderer clear color synchronized with theme background updates
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    try {
      const renderer = fg.renderer();
      if (renderer) {
        renderer.setClearColor(new THREE.Color(palette.bg), 1);
      }
    } catch {}
  }, [palette.bg]);

  // Renderer + forces + bloom (after mount). Wait one frame for the lib to
  // attach forces and create the renderer.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    // Force the renderer's clear colour to the theme bg explicitly.
    try {
      const renderer = fg.renderer();
      renderer.setClearColor(new THREE.Color(palette.bg), 1);
      renderer.preserveDrawingBuffer = true;
    } catch {}

    requestAnimationFrame(() => {
      try {
        const charge = fg.d3Force("charge");
        if (charge) charge.strength(-140);
        const link = fg.d3Force("link");
        if (link) link.distance(60);
        fg.refresh();
      } catch {}
    });

    if (ENABLE_BLOOM && !prefersReducedMotion) {
      // @ts-ignore - three example modules have no .d.ts
      import("three/examples/jsm/postprocessing/UnrealBloomPass.js").then((m: any) => {
        try {
          const bloom = new m.UnrealBloomPass();
          bloom.strength = 0.65;
          bloom.radius = 0.55;
          bloom.threshold = 0.78;
          fg.postProcessingComposer().addPass(bloom);
        } catch {}
      });
    }

    fg.cameraPosition({ z: 320 });

    try {
      fg.onEngineStop(() => {
        try { fg.zoomToFit(700, 60); } catch {}
      });
    } catch {}

    if (!prefersReducedMotion) {
      try {
        const controls = fg.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Event handlers ------------------------------------------------------

  const handleHover = useCallback((n: GraphNode | null) => {
    setHoveredId(n?.id ?? null);
    if (wrapRef.current) wrapRef.current.style.cursor = n ? "pointer" : "default";
  }, []);

  const handleClick = useCallback(
    (n: GraphNode) => {
      const fg = fgRef.current;
      if (fg && (n as any).x !== undefined) {
        const { x, y, z } = n as any;
        const dist = 90 + (n.val ?? 6) * 4;
        const r = Math.hypot(x, y, z) || 1;
        const k = 1 + dist / r;
        fg.cameraPosition({ x: x * k, y: y * k, z: z * k }, { x, y, z }, 900);
      }
      if (n.type === "company" && n.slug) onSelectCompany(n.slug);
      else if (n.type === "app" && n.url) onLaunchApp(n.url);
    },
    [onSelectCompany, onLaunchApp],
  );

  return (
    <div ref={wrapRef} className="absolute inset-0" style={{ background: palette.bg }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={data as any}
        width={size.w}
        height={size.h}
        backgroundColor={palette.bg}
        showNavInfo={false}
        nodeRelSize={4}
        nodeVal={(n: any) => n.val}
        nodeColor={nodeColor as any}
        nodeOpacity={1}
        nodeLabel={(n: any) =>
          `<div style="font:600 12px ui-sans-serif;padding:4px 8px;border-radius:8px;background:rgba(10,12,24,.85);color:#fff;border:1px solid rgba(255,255,255,.15)">${n.name}<br/><span style="opacity:.6;font-weight:400;text-transform:uppercase;font-size:10px;letter-spacing:.08em">${n.type}</span></div>`
        }
        nodeThreeObjectExtend={extendNodeObject as any}
        nodeThreeObject={makeNodeObject as any}
        linkColor={linkColor as any}
        linkOpacity={1}
        linkWidth={(l: any) => {
          const fid = focusIdRef.current;
          if (!fid) return 0.6;
          const src = typeof l.source === "string" ? l.source : l.source?.id;
          const tgt = typeof l.target === "string" ? l.target : l.target?.id;
          return src === fid || tgt === fid ? 1.6 : 0.35;
        }}
        linkDirectionalParticles={linkParticles as any}
        linkDirectionalParticleWidth={1.1}
        linkDirectionalParticleSpeed={0.005}
        warmupTicks={prefersReducedMotion ? 0 : 100}
        cooldownTime={prefersReducedMotion ? 0 : 5000}
        onNodeClick={handleClick as any}
        onNodeHover={handleHover as any}
        enableNodeDrag={false}
      />
    </div>
  );
}
