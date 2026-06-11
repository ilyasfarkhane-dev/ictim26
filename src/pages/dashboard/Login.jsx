import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
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
    <div className="min-h-screen bg-dash-bg flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-dash-primary via-dash-accent to-blue-400 p-12 text-white">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 font-bold text-lg backdrop-blur-sm">
            IC
          </div>
          <h1 className="mt-8 text-3xl font-bold leading-tight">ICTIM Conference CMS</h1>
          <p className="mt-4 text-white/80 max-w-md leading-relaxed">
            Manage speakers, content, media, and site settings for your conference website — all in one place.
          </p>
        </div>
        <p className="text-sm text-white/60">Secure admin access · Supabase powered</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:text-left">
            <div className="inline-flex lg:hidden h-12 w-12 items-center justify-center rounded-2xl bg-dash-primary text-white font-bold text-lg mb-4">
              IC
            </div>
            <h2 className="text-2xl font-bold text-dash-text">Sign in</h2>
            <p className="mt-2 text-sm text-dash-muted">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <div className="dash-card p-8">
            {!isConfigured ? (
              <p className="text-sm text-dash-muted text-center leading-relaxed">
                Configure <code className="text-dash-primary font-medium">VITE_SUPABASE_URL</code> and{" "}
                <code className="text-dash-primary font-medium">VITE_SUPABASE_ANON_KEY</code> in your{" "}
                <code className="text-dash-primary font-medium">.env</code> file.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
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
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3" role="alert">
                    {error}
                  </p>
                )}
                <DashButton type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Signing in…" : "Sign in"}
                </DashButton>
              </form>
            )}
          </div>

          <p className="mt-6 text-center lg:text-left text-sm text-dash-muted">
            <Link to="/" className="text-dash-primary font-medium hover:underline cursor-pointer dash-focus-ring rounded">
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
