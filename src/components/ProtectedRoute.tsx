import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication status and user role
    const checkAuth = () => {
      const userRole = localStorage.getItem("userRole");
      const isAuthenticated = localStorage.getItem("isAuthenticated");

      if (!isAuthenticated || isAuthenticated !== "true") {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      if (userRole && allowedRoles.includes(userRole)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-legal-bg">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg text-slate-600">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    const userRole = localStorage.getItem("userRole");
    
    // Redirect to appropriate login page based on attempted access
    if (!userRole) {
      // No role means not logged in - redirect to main page
      return <Navigate to="/" replace />;
    }
    
    // User is logged in but trying to access unauthorized route
    // Redirect to their appropriate dashboard
    switch (userRole) {
      case "admin":
        return <Navigate to="/admin-dashboard" replace />;
      case "employee":
        return <Navigate to="/employee-dashboard" replace />;
      case "bank-manager":
        return <Navigate to="/bank-manager-dashboard" replace />;
      case "bank-employee":
        return <Navigate to="/bank-employee-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;