import { Navigate } from "react-router-dom";
import { getToken, getRol } from "../services/auth.js";

export default function ProtectedRoute({ roles, children }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(getRol())) {
    return <Navigate to="/" replace />;
  }
  return children;
}