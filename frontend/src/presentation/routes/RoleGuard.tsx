import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import type { Role } from "../../domain/auth/role.enum";
import type { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
}

function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Si no está autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado pero no tiene permiso
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default RoleGuard;
