import { Navigate } from "react-router-dom";
import { useAdminRole } from "../hooks/use-admin-role";
import { Loader2 } from "lucide-react";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isAdmin } = useAdminRole();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
