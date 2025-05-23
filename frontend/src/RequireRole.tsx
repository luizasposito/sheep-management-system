
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface RequireRoleProps {
  allowedRoles: string[]; 
  children: React.ReactNode;
}

function getUserRole(): string | null {
  return localStorage.getItem("userRole");
}

function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem("token"));
}

export const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children }) => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = getUserRole();

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
