import { db } from "./db";
import {
  requireAuth,
  signToken,
  verifyPassword,
} from "./auth";
import type { Company, Sector } from "@shared/types";
import { existsSync } from "node:fs";
import { join } from "node:path";

const PORT = Number(process.env.PORT ?? 3001);
const IS_PROD = process.env.NODE_ENV === "production";
const DIST = join(import.meta.dir, "..", "dist");

// ---------- helpers ----------
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
function err(message: string, status = 400): Response {
  return json({ error: message }, status);
}

function rowToCompany(row: any): Company {
  return {
    ...row,
    featured: !!row.featured,
    products: safeParse(row.products),
  } as Company;
}
function safeParse(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------- query helpers ----------
function listSectors(): Sector[] {
  return db
    .query(
      `SELECT s.*, (SELECT COUNT(*) FROM companies c WHERE c.sector_id = s.id) AS company_count
       FROM sectors s ORDER BY s.sort_order, s.name`,
    )
    .all() as Sector[];
}
function getSectorBySlug(slug: string): Sector | undefined {
  return db
    .query(
      `SELECT s.*, (SELECT COUNT(*) FROM companies c WHERE c.sector_id = s.id) AS company_count
       FROM sectors s WHERE s.slug = ?`,
    )
    .get(slug) as Sector | undefined;
}
const COMPANY_SELECT = `
  SELECT c.*, s.name AS sector_name, s.slug AS sector_slug, s.accent AS sector_accent
  FROM companies c JOIN sectors s ON s.id = c.sector_id`;

function listCompanies(opts: {
  sector?: string;
  status?: string;
  q?: string;
  featured?: boolean;
}): Company[] {
  const where: string[] = [];
  const params: Record<string, unknown> = {};
  if (opts.sector) {
    where.push("s.slug = $sector");
    params.$sector = opts.sector;
  }
  if (opts.status) {
    where.push("c.status = $status");
    params.$status = opts.status;
  }
  if (opts.featured) where.push("c.featured = 1");
  if (opts.q) {
    where.push("(c.name LIKE $q OR c.tagline LIKE $q OR c.overview LIKE $q)");
    params.$q = `%${opts.q}%`;
  }
  const sql =
    COMPANY_SELECT +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    " ORDER BY c.featured DESC, c.name";
  return (db.query(sql).all(params as any) as any[]).map(rowToCompany);
}

// ---------- route handling ----------
type Handler = (
  req: Request,
  params: Record<string, string>,
) => Response | Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
  auth?: boolean;
}
const routes: Route[] = [];
function add(method: string, path: string, handler: Handler, auth = false) {
  const keys: string[] = [];
  const pattern = new RegExp(
    "^" +
      path.replace(/:([A-Za-z]+)/g, (_, k) => {
        keys.push(k);
        return "([^/]+)";
      }) +
      "$",
  );
  routes.push({ method, pattern, keys, handler, auth });
}

// ===== Public API =====
add("GET", "/api/health", () => json({ ok: true, time: new Date().toISOString() }));

add("GET", "/api/sectors", () => json({ items: listSectors() }));

add("GET", "/api/sectors/:slug", (_req, p) => {
  const sector = getSectorBySlug(p.slug);
  if (!sector) return err("Sector not found", 404);
  const companies = listCompanies({ sector: p.slug });
  return json({ sector, companies });
});

add("GET", "/api/companies", (req) => {
  const url = new URL(req.url);
  const items = listCompanies({
    sector: url.searchParams.get("sector") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    featured: url.searchParams.get("featured") === "true",
  });
  return json({ items, total: items.length });
});

function listApplications(companyId: number) {
  return db
    .query("SELECT * FROM applications WHERE company_id = ? ORDER BY sort_order, name")
    .all(companyId);
}

add("GET", "/api/companies/:slug", (_req, p) => {
  const row = db.query(COMPANY_SELECT + " WHERE c.slug = ?").get(p.slug) as any;
  if (!row) return err("Company not found", 404);
  const company = rowToCompany(row);
  company.applications = listApplications(company.id) as any;
  return json(company);
});

add("GET", "/api/stats", () => {
  const sectors = (db.query("SELECT COUNT(*) c FROM sectors").get() as any).c;
  const companies = (db.query("SELECT COUNT(*) c FROM companies").get() as any).c;
  const apps = (db.query("SELECT COUNT(*) c FROM applications").get() as any).c;
  const countries = (
    db.query("SELECT COUNT(DISTINCT country) c FROM companies").get() as any
  ).c;
  return json({ sectors, companies, apps, countries });
});

add("GET", "/api/graph", () => {
  const sectors = listSectors();
  const companies = listCompanies({});
  const apps = db
    .query("SELECT id, company_id, name, url, category FROM applications")
    .all() as any[];

  const nodes: any[] = [
    { id: "holding", type: "holding", name: "Lyceum Global Holdings", val: 28 },
  ];
  const links: any[] = [];

  for (const s of sectors) {
    const sid = `sector:${s.slug}`;
    nodes.push({ id: sid, type: "sector", name: s.name, slug: s.slug, accent: s.accent, val: 14 });
    links.push({ source: "holding", target: sid });
  }
  const companyNode = new Map<number, string>();
  for (const c of companies) {
    const cid = `company:${c.slug}`;
    companyNode.set(c.id, cid);
    nodes.push({
      id: cid,
      type: "company",
      name: c.name,
      slug: c.slug,
      sectorSlug: c.sector_slug,
      accent: c.sector_accent,
      status: c.status,
      val: 7,
    });
    links.push({ source: `sector:${c.sector_slug}`, target: cid });
  }
  for (const a of apps) {
    const parent = companyNode.get(a.company_id);
    if (!parent) continue;
    const aid = `app:${a.id}`;
    nodes.push({ id: aid, type: "app", name: a.name, url: a.url, val: 3 });
    links.push({ source: parent, target: aid });
  }

  return json({ nodes, links });
});

// ===== Auth =====
add("POST", "/api/auth/login", async (req) => {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  if (!body?.email || !body?.password) return err("Email and password required");
  const user = db
    .query("SELECT * FROM users WHERE email = ?")
    .get(body.email.toLowerCase().trim()) as any;
  if (!user || !(await verifyPassword(body.password, user.password_hash)))
    return err("Invalid credentials", 401);
  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  return json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
    },
  });
});

add(
  "GET",
  "/api/auth/me",
  async (req) => {
    const user = await requireAuth(req);
    if (!user) return err("Unauthorized", 401);
    return json(user);
  },
  true,
);

// ===== Admin: Sectors =====
add(
  "POST",
  "/api/admin/sectors",
  async (req) => {
    const b = (await req.json().catch(() => ({}))) as Partial<Sector>;
    if (!b.name) return err("Name is required");
    const slug = b.slug ? slugify(b.slug) : slugify(b.name);
    try {
      const res = db
        .prepare(
          `INSERT INTO sectors (slug, name, tagline, description, icon, accent, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          slug,
          b.name,
          b.tagline ?? "",
          b.description ?? "",
          b.icon ?? "🏛️",
          b.accent ?? "#2563eb",
          b.sort_order ?? 0,
        );
      const created = db
        .query("SELECT * FROM sectors WHERE id = ?")
        .get(Number(res.lastInsertRowid));
      return json(created, 201);
    } catch (e: any) {
      return err(e?.message?.includes("UNIQUE") ? "Slug already exists" : "Could not create sector", 409);
    }
  },
  true,
);

add(
  "PUT",
  "/api/admin/sectors/:id",
  async (req, p) => {
    const b = (await req.json().catch(() => ({}))) as Partial<Sector>;
    const existing = db.query("SELECT * FROM sectors WHERE id = ?").get(p.id) as any;
    if (!existing) return err("Sector not found", 404);
    db.prepare(
      `UPDATE sectors SET name=?, slug=?, tagline=?, description=?, icon=?, accent=?, sort_order=?, updated_at=datetime('now')
       WHERE id=?`,
    ).run(
      b.name ?? existing.name,
      b.slug ? slugify(b.slug) : existing.slug,
      b.tagline ?? existing.tagline,
      b.description ?? existing.description,
      b.icon ?? existing.icon,
      b.accent ?? existing.accent,
      b.sort_order ?? existing.sort_order,
      p.id,
    );
    return json(db.query("SELECT * FROM sectors WHERE id = ?").get(p.id));
  },
  true,
);

add(
  "DELETE",
  "/api/admin/sectors/:id",
  (_req, p) => {
    const count = (
      db.query("SELECT COUNT(*) c FROM companies WHERE sector_id = ?").get(p.id) as any
    ).c;
    if (count > 0)
      return err(`Cannot delete: ${count} companies still belong to this sector`, 409);
    db.prepare("DELETE FROM sectors WHERE id = ?").run(p.id);
    return json({ ok: true });
  },
  true,
);

// ===== Admin: Companies =====
function upsertCompanyBody(b: any, existing?: any) {
  return {
    name: b.name ?? existing?.name,
    slug: b.slug ? slugify(b.slug) : existing?.slug ?? slugify(b.name ?? ""),
    sector_id: b.sector_id ?? existing?.sector_id,
    legal_name: b.legal_name ?? existing?.legal_name ?? "",
    tagline: b.tagline ?? existing?.tagline ?? "",
    overview: b.overview ?? existing?.overview ?? "",
    mission: b.mission ?? existing?.mission ?? "",
    products: JSON.stringify(
      Array.isArray(b.products) ? b.products : safeParse(existing?.products ?? "[]"),
    ),
    founded_year: b.founded_year ?? existing?.founded_year ?? null,
    headquarters: b.headquarters ?? existing?.headquarters ?? "",
    country: b.country ?? existing?.country ?? "",
    employees: b.employees ?? existing?.employees ?? "",
    revenue: b.revenue ?? existing?.revenue ?? "",
    website: b.website ?? existing?.website ?? "",
    email: b.email ?? existing?.email ?? "",
    phone: b.phone ?? existing?.phone ?? "",
    ceo: b.ceo ?? existing?.ceo ?? "",
    status: b.status ?? existing?.status ?? "active",
    featured: (b.featured ?? existing?.featured) ? 1 : 0,
    logo: b.logo ?? existing?.logo ?? "",
  };
}

add(
  "POST",
  "/api/admin/companies",
  async (req) => {
    const b = (await req.json().catch(() => ({}))) as any;
    if (!b.name) return err("Name is required");
    if (!b.sector_id) return err("Sector is required");
    const v = upsertCompanyBody(b);
    try {
      const res = db
        .prepare(
          `INSERT INTO companies
            (slug,name,sector_id,legal_name,tagline,overview,mission,products,founded_year,
             headquarters,country,employees,revenue,website,email,phone,ceo,status,featured,logo_seed,logo)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          v.slug, v.name, v.sector_id, v.legal_name, v.tagline, v.overview, v.mission,
          v.products, v.founded_year, v.headquarters, v.country, v.employees, v.revenue,
          v.website, v.email, v.phone, v.ceo, v.status, v.featured, v.slug, v.logo,
        );
      const row = db
        .query(COMPANY_SELECT + " WHERE c.id = ?")
        .get(Number(res.lastInsertRowid));
      return json(rowToCompany(row), 201);
    } catch (e: any) {
      return err(e?.message?.includes("UNIQUE") ? "Slug already exists" : "Could not create company", 409);
    }
  },
  true,
);

add(
  "PUT",
  "/api/admin/companies/:id",
  async (req, p) => {
    const existing = db.query("SELECT * FROM companies WHERE id = ?").get(p.id) as any;
    if (!existing) return err("Company not found", 404);
    const b = (await req.json().catch(() => ({}))) as any;
    const v = upsertCompanyBody(b, existing);
    db.prepare(
      `UPDATE companies SET
        slug=?,name=?,sector_id=?,legal_name=?,tagline=?,overview=?,mission=?,products=?,
        founded_year=?,headquarters=?,country=?,employees=?,revenue=?,website=?,email=?,
        phone=?,ceo=?,status=?,featured=?,logo=?,updated_at=datetime('now')
       WHERE id=?`,
    ).run(
      v.slug, v.name, v.sector_id, v.legal_name, v.tagline, v.overview, v.mission,
      v.products, v.founded_year, v.headquarters, v.country, v.employees, v.revenue,
      v.website, v.email, v.phone, v.ceo, v.status, v.featured, v.logo, p.id,
    );
    const row = db.query(COMPANY_SELECT + " WHERE c.id = ?").get(p.id);
    return json(rowToCompany(row));
  },
  true,
);

add(
  "DELETE",
  "/api/admin/companies/:id",
  (_req, p) => {
    db.prepare("DELETE FROM companies WHERE id = ?").run(p.id);
    return json({ ok: true });
  },
  true,
);

// ===== Admin: Applications (connected apps per company) =====
function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

add(
  "GET",
  "/api/admin/companies/:id/applications",
  (_req, p) => json({ items: listApplications(Number(p.id)) }),
  true,
);

add(
  "POST",
  "/api/admin/applications",
  async (req) => {
    const b = (await req.json().catch(() => ({}))) as any;
    if (!b.company_id) return err("company_id is required");
    if (!b.url) return err("url is required");
    const url = normalizeUrl(b.url);
    let host = "";
    try {
      host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return err("Invalid URL");
    }
    const res = db
      .prepare(
        `INSERT INTO applications (company_id, name, url, description, category, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        b.company_id,
        (b.name && b.name.trim()) || host,
        url,
        b.description ?? "",
        b.category ?? "",
        b.sort_order ?? 0,
      );
    return json(
      db.query("SELECT * FROM applications WHERE id = ?").get(Number(res.lastInsertRowid)),
      201,
    );
  },
  true,
);

add(
  "PUT",
  "/api/admin/applications/:id",
  async (req, p) => {
    const existing = db.query("SELECT * FROM applications WHERE id = ?").get(p.id) as any;
    if (!existing) return err("Application not found", 404);
    const b = (await req.json().catch(() => ({}))) as any;
    db.prepare(
      `UPDATE applications SET name=?, url=?, description=?, category=?, sort_order=? WHERE id=?`,
    ).run(
      b.name ?? existing.name,
      b.url ? normalizeUrl(b.url) : existing.url,
      b.description ?? existing.description,
      b.category ?? existing.category,
      b.sort_order ?? existing.sort_order,
      p.id,
    );
    return json(db.query("SELECT * FROM applications WHERE id = ?").get(p.id));
  },
  true,
);

add(
  "DELETE",
  "/api/admin/applications/:id",
  (_req, p) => {
    db.prepare("DELETE FROM applications WHERE id = ?").run(p.id);
    return json({ ok: true });
  },
  true,
);

// ---------- static file serving (production) ----------
async function serveStatic(req: Request): Promise<Response | null> {
  if (!IS_PROD) return null;
  const url = new URL(req.url);
  let path = decodeURIComponent(url.pathname);
  if (path === "/") path = "/index.html";
  const filePath = join(DIST, path);
  if (existsSync(filePath) && !filePath.includes("..")) {
    const f = Bun.file(filePath);
    if (await f.exists()) return new Response(f);
  }
  // SPA fallback
  const index = Bun.file(join(DIST, "index.html"));
  if (await index.exists()) return new Response(index);
  return null;
}

// ---------- server ----------
Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api/")) {
      for (const r of routes) {
        if (r.method !== req.method) continue;
        const m = r.pattern.exec(url.pathname);
        if (!m) continue;
        if (r.auth) {
          const user = await requireAuth(req);
          if (!user) return err("Unauthorized", 401);
        }
        const params: Record<string, string> = {};
        r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        try {
          return await r.handler(req, params);
        } catch (e) {
          console.error(e);
          return err("Internal server error", 500);
        }
      }
      return err("Not found", 404);
    }

    const stat = await serveStatic(req);
    if (stat) return stat;
    return new Response("Lyceum Global Holdings API. Run the Vite dev server for the UI.", {
      headers: { "content-type": "text/plain" },
    });
  },
});

console.log(`🌐 Lyceum portal API running on http://localhost:${PORT}`);
if (IS_PROD) console.log(`📦 Serving built frontend from ${DIST}`);
