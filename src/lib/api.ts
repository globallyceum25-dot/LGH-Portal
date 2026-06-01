import type { Application, Company, GraphData, Sector } from "@shared/types";

const TOKEN_KEY = "lyceum_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("content-type"))
    headers.set("content-type", "application/json");
  const token = getToken();
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export interface Stats {
  sectors: number;
  companies: number;
  apps: number;
  countries: number;
}

export const api = {
  // public
  stats: () => request<Stats>("/api/stats"),
  sectors: () => request<{ items: Sector[] }>("/api/sectors").then((r) => r.items),
  sector: (slug: string) =>
    request<{ sector: Sector; companies: Company[] }>(`/api/sectors/${slug}`),
  companies: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ items: Company[]; total: number }>(
      `/api/companies${qs ? `?${qs}` : ""}`,
    );
  },
  company: (slug: string) => request<Company>(`/api/companies/${slug}`),
  graph: () => request<GraphData>("/api/graph"),

  // auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<any>("/api/auth/me"),

  // admin
  createSector: (data: Partial<Sector>) =>
    request<Sector>("/api/admin/sectors", { method: "POST", body: JSON.stringify(data) }),
  updateSector: (id: number, data: Partial<Sector>) =>
    request<Sector>(`/api/admin/sectors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSector: (id: number) =>
    request<{ ok: true }>(`/api/admin/sectors/${id}`, { method: "DELETE" }),

  // applications
  createApplication: (data: Partial<Application>) =>
    request<Application>("/api/admin/applications", { method: "POST", body: JSON.stringify(data) }),
  updateApplication: (id: number, data: Partial<Application>) =>
    request<Application>(`/api/admin/applications/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteApplication: (id: number) =>
    request<{ ok: true }>(`/api/admin/applications/${id}`, { method: "DELETE" }),

  createCompany: (data: Partial<Company>) =>
    request<Company>("/api/admin/companies", { method: "POST", body: JSON.stringify(data) }),
  updateCompany: (id: number, data: Partial<Company>) =>
    request<Company>(`/api/admin/companies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCompany: (id: number) =>
    request<{ ok: true }>(`/api/admin/companies/${id}`, { method: "DELETE" }),
};
