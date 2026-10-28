import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getUser, getRol, logout } from "../services/auth.js";

const NAV_POR_ROL = {
  APODERADO: [
    { to: "/perfil", label: "Mi perfil", icon: "👤" },
    { to: "/mis-ninos", label: "Mis hijos", icon: "🧒" },
    { to: "/avance-pagos", label: "Avance y pagos", icon: "📈" },
  ],
  TERAPEUTA: [
    { to: "/perfil", label: "Mi perfil", icon: "👤" },
    { to: "/agenda", label: "Mi agenda", icon: "📅" },
  ],
  RECEPCIONISTA: [
    { to: "/perfil", label: "Mi perfil", icon: "👤" },
    { to: "/agenda", label: "Agenda", icon: "📅" },
    { to: "/apoderados", label: "Apoderados", icon: "📋" },
  ],
  ADMIN: [
    { to: "/perfil", label: "Mi perfil", icon: "👤" },
    { to: "/trabajadores", label: "Trabajadores", icon: "🧑" },
    { to: "/apoderados", label: "Apoderados", icon: "📋" },
    { to: "/ingresos", label: "Ingresos y pagos", icon: "💰" },
  ],
};

export default function Layout() {
  const navigate = useNavigate();
  const usuario = getUser();
  const rol = getRol();
  const enlaces = NAV_POR_ROL[rol] || [];

  function cerrarSesion() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Link to="/perfil">
            <img className="sidebar-logo" src="/logo-wichay-transparente.png" alt="Logo Wichay" />
            <span>
              <strong>Wichay</strong>
              <small>Centro de Estimulación</small>
            </span>
          </Link>
        </div>
        <nav className="sidebar-nav">
          {enlaces.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
              <span className="sidebar-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{usuario?.nombre}</strong>
            <span>{rol}</span>
          </div>
          <button onClick={cerrarSesion} className="sidebar-logout">Cerrar sesión</button>
        </div>
      </aside>
      <main className="content sidebar-content">
        <Outlet />
      </main>
    </div>
  );
}