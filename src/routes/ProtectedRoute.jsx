import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
  const {
    user,
    loading,
    isCoach,
    isAdmin,
  } = useAuth();

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "coach" && !isCoach) {
    return <Navigate to="/" replace />;
  }

  if (role === "admin" && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;