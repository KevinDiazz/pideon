import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * Protege una ruta. Si se pasa `allowedRoles`, además valida el rol.
 *
 * <ProtectedRoute allowedRoles={["admin"]}>
 *   <AdminPage />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuthStore();
  const location = useLocation();

  // Esperando a que /auth/me termine al refrescar
  if (token && !user && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-amber-900">
        Cargando...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
