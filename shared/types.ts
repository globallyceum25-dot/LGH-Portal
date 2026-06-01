// Shared domain types used by both the Bun API and the React client.

export interface Sector {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string; // emoji or short glyph used in the UI
  accent: string; // tailwind-friendly hex accent colour
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** Populated on some endpoints. */
  company_count?: number;
}

export type CompanyStatus = "active" | "growth" | "incubating" | "divested";

export interface Company {
  id: number;
  slug: string;
  name: string;
  sector_id: number;
  legal_name: string;
  tagline: string;
  /** Long-form business profile, stored as Markdown-ish plain text. */
  overview: string;
  mission: string;
  /** JSON-encoded string[] in the DB; parsed to array by the API. */
  products: string[];
  founded_year: number | null;
  headquarters: string;
  country: string;
  employees: string; // human range, e.g. "500–1,000"
  revenue: string; // human range, e.g. "$250M+"
  website: string;
  email: string;
  phone: string;
  ceo: string;
  status: CompanyStatus;
  featured: boolean;
  logo_seed: string; // deterministic seed for the generated logo mark
  created_at: string;
  updated_at: string;
  /** Populated on detail/list endpoints via JOIN. */
  sector_name?: string;
  sector_slug?: string;
  sector_accent?: string;
  /** Populated on the company detail endpoint. */
  applications?: Application[];
}

export interface Application {
  id: number;
  company_id: number;
  name: string;
  url: string;
  description: string;
  category: string; // e.g. "CRM", "Analytics", "Internal"
  sort_order: number;
  created_at: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "admin";
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
}

export type GraphNodeType = "holding" | "sector" | "company" | "app";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  name: string;
  val: number; // relative node size
  /** company/sector slug; app url */
  slug?: string;
  sectorSlug?: string;
  companySlug?: string;
  accent?: string;
  status?: CompanyStatus;
  url?: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface ApiError {
  error: string;
}
