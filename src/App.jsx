import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { getUser, getRol, logout } from "./services/auth.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import ContactanosPage from "./pages/ContactanosPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegistroPage from "./pages/RegistroPage.jsx";
import AgendaPage from "./pages/AgendaPage.jsx";
import MisNinosPage from "./pages/MisNinosPage.jsx";
import RegistrarNinoPage from "./pages/RegistrarNinoPage.jsx";
import AgendarCitaPage from "./pages/AgendarCitaPage.jsx";
import VerAvancePage from "./pages/VerAvancePage.jsx";
import RegistrarAvancePage from "./pages/RegistrarAvancePage.jsx";

export default function App() {
  const navigate = useNavigate();
  const usuario = getUser();
  const rol = getRol();

  function cerrarSesion() {
    logout();
    navigate("/", { replace: true });
  }

  const enlacesPorRol = {
    ADMIN: [{ to: "/agenda", label: "Agenda" }],
    RECEPCIONISTA: [{ to: "/agenda", label: "Agenda" }],
    TERAPEUTA: [{ to: "/agenda", label: "Mi agenda" }],
    APODERADO: [{ to: "/mis-ninos", label: "Mis hijos" }],
  };

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-title">
          <Link to={rol ? (rol === "APODERADO" ? "/mis-ninos" : "/agenda") : "/"} className="navbar-brand">
            Centro de Estimulación Integral
          </Link>
        </span>
        <div className="navbar-links">
          {!rol ? (
            <>
              <Link to="/contactanos">Contáctanos</Link>
              <Link to="/login" className="btn-login">Login</Link>
            </>
          ) : (
            <>
              {(enlacesPorRol[rol] || []).map((l) => (
                <Link key={l.to} to={l.to}>{l.label}</Link>
              ))}
              {rol === "APODERADO" && (
                <>
                  <Link to="/agendar">Agendar cita</Link>
                  <Link to="/registrar-nino">Registrar hijo</Link>
                </>
              )}
              <span className="navbar-user">{usuario?.nombre}</span>
              <button onClick={cerrarSesion} className="btn-logout">Cerrar sesión</button>
            </>
          )}
        </div>
      </nav>

      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contactanos" element={<ContactanosPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/agenda" element={<ProtectedRoute roles={["ADMIN", "RECEPCIONISTA", "TERAPEUTA"]}><AgendaPage /></ProtectedRoute>} />
          <Route path="/mis-ninos" element={<ProtectedRoute roles={["APODERADO"]}><MisNinosPage /></ProtectedRoute>} />
          <Route path="/registrar-nino" element={<ProtectedRoute roles={["APODERADO"]}><RegistrarNinoPage /></ProtectedRoute>} />
          <Route path="/agendar" element={<ProtectedRoute roles={["APODERADO"]}><AgendarCitaPage /></ProtectedRoute>} />
          <Route path="/registrar-avance" element={<ProtectedRoute roles={["TERAPEUTA", "ADMIN"]}><RegistrarAvancePage /></ProtectedRoute>} />
          <Route path="/ninos/:ninoId/avance" element={<ProtectedRoute roles={["APODERADO", "TERAPEUTA", "ADMIN", "RECEPCIONISTA"]}><VerAvancePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}