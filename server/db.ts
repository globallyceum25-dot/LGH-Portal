import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.DB_PATH ?? "data/portal.sqlite";
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH, { create: true });
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sectors (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT NOT NULL UNIQUE,
      name        TEXT NOT NULL,
      tagline     TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      icon        TEXT NOT NULL DEFAULT '🏛️',
      accent      TEXT NOT NULL DEFAULT '#2563eb',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS companies (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      slug         TEXT NOT NULL UNIQUE,
      name         TEXT NOT NULL,
      sector_id    INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
      legal_name   TEXT NOT NULL DEFAULT '',
      tagline      TEXT NOT NULL DEFAULT '',
      overview     TEXT NOT NULL DEFAULT '',
      mission      TEXT NOT NULL DEFAULT '',
      products     TEXT NOT NULL DEFAULT '[]',
      founded_year INTEGER,
      headquarters TEXT NOT NULL DEFAULT '',
      country      TEXT NOT NULL DEFAULT '',
      employees    TEXT NOT NULL DEFAULT '',
      revenue      TEXT NOT NULL DEFAULT '',
      website      TEXT NOT NULL DEFAULT '',
      email        TEXT NOT NULL DEFAULT '',
      phone        TEXT NOT NULL DEFAULT '',
      ceo          TEXT NOT NULL DEFAULT '',
      status       TEXT NOT NULL DEFAULT 'active',
      featured     INTEGER NOT NULL DEFAULT 0,
      logo_seed    TEXT NOT NULL DEFAULT '',
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS applications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id  INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      url         TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category    TEXT NOT NULL DEFAULT '',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      name          TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'admin',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector_id);
    CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
    CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_id);
  `);
}

migrate();
