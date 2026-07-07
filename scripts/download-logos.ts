/**
 * Mirror sector/company logos from lyceumglobal.co into public/logos/<slug>.png.
 * Run once: `bun run scripts/download-logos.ts`. The portal then renders these
 * via /logos/<slug>.png (Vite/Bun serve `public/` at the root).
 */
import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const B = "https://lyceumglobal.co/wp-content/uploads";

const MAP: Record<string, string> = {
  "holding-lyceum": `${B}/2024/04/cropped-LGH-2-1.png`,

  // Lyceum Education Holdings
  "lyceum-international-school": `${B}/2024/03/lyc.png`,
  "lyceum-leaf-school": `${B}/2024/03/leaf-300x111.png`,
  "lyceum-day-care": `${B}/2024/04/LDW-Logo-02-300x300.png`,
  "lyceum-campus": `${B}/2024/04/Lyceum-Campus-Full-White-Logo-1024x313.png`,
  "lyceum-placements": `${B}/2024/04/Lyceum-Placements-Logo-White-Logo-1024x234.png`,
  "lyceum-assessments": `${B}/2024/03/asses.png`,
  "lyceum-academy": `${B}/2024/04/LYA-Logo-White-1024x298.png`,
  "nextgen-publications": `${B}/2024/04/nextgen-logo-1-01.png`,

  // NCG Speed Holdings
  "ncg-automotive-solutions": `${B}/2024/04/NCG-Automotive-Logo-White-300x207.png`,
  "ncg-express": `${B}/2024/04/NCG-Express-Logo-300x71.png`,
  "ncg-fleet-management": `${B}/2024/04/ncgfm-logo-white-300x150.png`,
  "ncg-spare-parts": `${B}/2024/04/NCG-Spare-Parts-Logo-White-300x214.png`,

  // NCG Read Holdings
  "the-book-studio": `${B}/2024/03/book-removebg-preview-1024x233.png`,
  "nextgen-library-solutions": `${B}/2024/04/LAC-LOGO-White-1024x243.png`,

  // NCG Build Holdings
  "vebuild-innovations": `${B}/2024/04/Vebuild.png`,
  "ncg-green-energy": `${B}/2024/04/Logo-ncg-green-02-1-1.png`,
  "nextgen-shield": `${B}/2024/05/SHIELD-white-246x300.png`,
  "nextgen-facility-management": `${B}/2024/05/Nextgen-Facility-Management-white-Logo-300x296.png`,
  "ncg-warehouse-solutions": `${B}/2024/04/WH-Logo-white-1024x724.png`,
  "serengetti-property-management": `${B}/2024/03/serengeti-1.png`,

  // NCG Kit Holdings
  "lyceum-collection": `${B}/2024/03/col.png`,
  "the-uniform-hub": `${B}/2024/03/Uniform-Hub.png`,

  // Heracle Holdings
  "lyfe-kitchen": `${B}/2024/04/Lyfe-Kitchen-Logo-White-1024x573.png`,
  "zeus-gymnasium": `${B}/2024/05/Gym_Logo-pvtNWW-300x139.png`,
  "heracle-sports": `${B}/2024/04/HERACLE-SPORTS-LOGO-White-1024x484.png`,
  "ncg-earth": `${B}/2024/03/NCG-Earth-300x143.png`,
  "heracle-care-wellness": `${B}/2024/03/care-and-wellness-1-1.png`,
};

const OUT_DIR = join(import.meta.dir, "..", "public", "logos");
mkdirSync(OUT_DIR, { recursive: true });

const headers = { "User-Agent": "Mozilla/5.0 LyceumPortal/1.0" };

const results = await Promise.all(
  Object.entries(MAP).map(async ([slug, url]) => {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) return { slug, ok: false, status: res.status, url };
      const ab = await res.arrayBuffer();
      if (ab.byteLength === 0) return { slug, ok: false, status: 204, url };
      const path = join(OUT_DIR, `${slug}.png`);
      await Bun.write(path, ab);
      const size = statSync(path).size;
      return { slug, ok: true, size };
    } catch (e: any) {
      return { slug, ok: false, err: e?.message, url };
    }
  }),
);

let okCount = 0;
let failCount = 0;
for (const r of results) {
  if (r.ok) {
    okCount++;
    console.log(`  ✓ ${r.slug}.png  (${(r.size! / 1024).toFixed(1)} KB)`);
  } else {
    failCount++;
    console.log(`  ✗ ${r.slug}  ${"status" in r ? "HTTP " + r.status : r.err}`);
  }
}
console.log(`\n${okCount} downloaded, ${failCount} failed.`);
