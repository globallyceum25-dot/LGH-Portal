import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ThemeBackground } from "@/components/ThemeBackground";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@lyceumglobal.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <ThemeBackground />
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="fx-glow grid h-11 w-11 place-items-center rounded-lg font-display text-xl font-bold fx-accent-bg">L</span>
          <span className="font-display text-xl font-semibold fx-text">Lyceum Portal</span>
        </Link>
        <form onSubmit={submit} className="fx-glass p-8 shadow-2xl">
          <h1 className="font-display text-2xl font-semibold fx-text">Admin sign in</h1>
          <p className="mt-1 text-sm fx-muted">Manage sectors and companies.</p>

          {error && (
            <div className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "color-mix(in srgb, #ef4444 14%, transparent)", color: "#fca5a5" }}>
              {error}
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium fx-text">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="fx-field mt-1" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium fx-text">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="ChangeMe!2026" className="fx-field mt-1" />
            </div>
          </div>

          <button type="submit" disabled={busy} className="fx-btn mt-6 w-full disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-4 text-center font-mono text-xs fx-muted">
            Demo: admin@lyceumglobal.com / ChangeMe!2026
          </p>
        </form>
      </div>
    </div>
  );
}
