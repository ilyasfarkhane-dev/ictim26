import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashButton from "../../components/dashboard/DashButton";
import { DashInput } from "../../components/dashboard/DashInput";

export default function Login() {
  const { user, loading, signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-dash-bg flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-dash-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dash-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-dash-primary text-white font-bold text-lg mb-4">
            IC
          </div>
          <h1 className="text-2xl font-bold text-dash-text">ICTIM Dashboard</h1>
          <p className="mt-2 text-sm text-dash-muted">Sign in to manage your conference website</p>
        </div>

        <div className="dash-card p-8">
          {!isConfigured ? (
            <p className="text-sm text-dash-muted text-center">
              Configure <code className="text-dash-primary">VITE_SUPABASE_URL</code> and{" "}
              <code className="text-dash-primary">VITE_SUPABASE_ANON_KEY</code> in your{" "}
              <code className="text-dash-primary">.env</code> file.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <DashInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <DashInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <DashButton type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </DashButton>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-dash-muted">
          <a href="/" className="text-dash-primary font-medium hover:underline cursor-pointer">
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  );
}
