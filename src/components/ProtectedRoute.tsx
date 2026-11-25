
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-ink-900">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // TODO: Add role check here later if needed (fetching from 'users' table)

    return <>{children}</>;
}
