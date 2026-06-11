import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-dash-bg flex items-center justify-center p-6">
        <div className="dash-card max-w-md p-8 text-center">
          <h1 className="text-xl font-bold text-dash-text">Supabase not configured</h1>
          <p className="mt-3 text-sm text-dash-muted">
            Copy <code className="text-dash-primary">.env.example</code> to{" "}
            <code className="text-dash-primary">.env</code> and add your Supabase URL and anon key.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dash-bg flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-dash-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/dashboard/login" replace />;

  return children;
}
