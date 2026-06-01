import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/States";
import { ThemeBackground } from "@/components/ThemeBackground";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "@/lib/theme";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true, icon: "▦" },
  { to: "/admin/sectors", label: "Sectors", icon: "🏛" },
  { to: "/admin/companies", label: "Companies", icon: "🏢" },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { mode, toggleMode } = useTheme();

  if (loading) return <Spinner label="Authenticating…" />;
  if (!user) {
    navigate("/admin/login", { replace: true });
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <ThemeBackground />
      <aside className="flex w-60 shrink-0 flex-col border-r fx-border" style={{ background: "color-mix(in srgb, var(--bg-2) 80%, transparent)", backdropFilter: "blur(12px)" }}>
        <Link to="/admin" className="flex items-center gap-2.5 border-b fx-border px-5 py-4">
          <span className="fx-glow grid h-9 w-9 place-items-center rounded-lg font-display font-bold fx-accent-bg">L</span>
          <span className="font-display font-semibold fx-text">Admin</span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "fx-accent-bg" : "fx-link"}`
              }
            >
              <span aria-hidden>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t fx-border p-3">
          <div className="flex items-center justify-between mb-1">
            <Link to="/" className="rounded-lg px-3 py-2 text-sm fx-link flex-1">← View site</Link>
            <button
              onClick={toggleMode}
              aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className="fx-btn-ghost !h-8 !w-8 !p-0 rounded-full flex items-center justify-center text-sm transition hover:scale-[1.05]"
            >
              {mode === "light" ? "🌙" : "☀️"}
            </button>
          </div>
          <button
            onClick={() => { logout(); navigate("/admin/login"); }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm"
            style={{ color: "#f87171" }}
          >
            Sign out
          </button>
          <p className="mt-3 px-3 font-mono text-xs fx-muted">{user.email}</p>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <ThemeSwitcher />
    </div>
  );
}
