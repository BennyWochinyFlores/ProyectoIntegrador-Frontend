import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getToken, getRol, getUser, logout } from "./services/auth.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
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
import PerfilPage from "./pages/PerfilPage.jsx";
import AvancePagosPage from "./pages/AvancePagosPage.jsx";
import PagarPagoPage from "./pages/PagarPagoPage.jsx";
import PagosPage from "./pages/PagosPage.jsx";
import TrabajadoresPage from "./pages/TrabajadoresPage.jsx";
import RegistrarTrabajadorPage from "./pages/RegistrarTrabajadorPage.jsx";
import ContratoTrabajadorPage from "./pages/ContratoTrabajadorPage.jsx";
import ApoderadosPage from "./pages/ApoderadosPage.jsx";
import AgendarApoderadoPage from "./pages/AgendarApoderadoPage.jsx";

const TODOS = ["ADMIN", "RECEPCIONISTA", "TERAPEUTA", "APODERADO"];

export default function App() {
  useLocation();
  const navigate = useNavigate();
  const rol = getRol();

  const irSeccion = (id) => {
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  const sesionValida = Boolean(getToken()) && Boolean(getUser()?.rol);
  const sesionRota = Boolean(getToken()) && !sesionValida;
  if (sesionRota) {
    logout();
  }

  if (!rol) {
    return (
      <div className="app">
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            <img className="navbar-logo" src="/logo-wichay-transparente.png" alt="Logo Wichay" />
            <span className="navbar-brand-texto">
              <strong>Wichay</strong>
              <small>Centro de Estimulación Temprana</small>
            </span>
          </Link>
          <div className="navbar-menu">
            <button type="button" onClick={() => irSeccion("inicio")}>Inicio</button>
            <button type="button" onClick={() => irSeccion("nosotros")}>Nosotros</button>
            <button type="button" onClick={() => irSeccion("servicios")}>Servicios</button>
            <div className="dropdown">
              <button type="button">Terapias ▾</button>
              <div className="dropdown-menu">
                <a href="#terapia-estimulacion" onClick={(e) => { e.preventDefault(); irSeccion("terapia-estimulacion"); }}>
                  Estimulación temprana
                </a>
                <a href="#terapia-lenguaje" onClick={(e) => { e.preventDefault(); irSeccion("terapia-lenguaje"); }}>
                  Terapia de lenguaje
                </a>
                <a href="#terapia-ocupacional" onClick={(e) => { e.preventDefault(); irSeccion("terapia-ocupacional"); }}>
                  Terapia ocupacional
                </a>
              </div>
            </div>
            <button type="button" onClick={() => irSeccion("contacto")}>Contacto</button>
          </div>
          <div className="navbar-cta">
            <a
              className="btn-whatsapp"
              href="https://wa.me/51999888777?text=Hola%2C%20Wichay.%20Requiero%20informaci%C3%B3n%20sobre%20las%20terapias."
              target="_blank"
              rel="noreferrer"
            >
              📲 Solicita orientación
            </a>
            <Link to="/login" className="btn-login">Iniciar sesión</Link>
          </div>
        </nav>
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contactanos" element={<ContactanosPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<ProtectedRoute roles={TODOS}><Layout /></ProtectedRoute>}>
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/mis-ninos" element={<ProtectedRoute roles={["APODERADO"]}><MisNinosPage /></ProtectedRoute>} />
        <Route path="/avance-pagos" element={<ProtectedRoute roles={["APODERADO"]}><AvancePagosPage /></ProtectedRoute>} />
        <Route path="/pagar/:pagoId" element={<ProtectedRoute roles={["APODERADO"]}><PagarPagoPage /></ProtectedRoute>} />
        <Route path="/registrar-nino" element={<ProtectedRoute roles={["APODERADO"]}><RegistrarNinoPage /></ProtectedRoute>} />
        <Route path="/agendar" element={<ProtectedRoute roles={["APODERADO"]}><AgendarCitaPage /></ProtectedRoute>} />
        <Route path="/agenda" element={<ProtectedRoute roles={["RECEPCIONISTA", "TERAPEUTA"]}><AgendaPage /></ProtectedRoute>} />
        <Route path="/trabajadores" element={<ProtectedRoute roles={["ADMIN"]}><TrabajadoresPage /></ProtectedRoute>} />
        <Route path="/nuevo-trabajador" element={<ProtectedRoute roles={["ADMIN"]}><RegistrarTrabajadorPage /></ProtectedRoute>} />
        <Route path="/trabajadores/:id/contrato" element={<ProtectedRoute roles={["ADMIN"]}><ContratoTrabajadorPage /></ProtectedRoute>} />
        <Route path="/ingresos" element={<ProtectedRoute roles={["ADMIN"]}><PagosPage /></ProtectedRoute>} />
        <Route path="/apoderados" element={<ProtectedRoute roles={["ADMIN", "RECEPCIONISTA"]}><ApoderadosPage /></ProtectedRoute>} />
        <Route path="/apoderados/:id/agendar" element={<ProtectedRoute roles={["ADMIN", "RECEPCIONISTA"]}><AgendarApoderadoPage /></ProtectedRoute>} />
        <Route path="/registrar-avance" element={<ProtectedRoute roles={["TERAPEUTA", "ADMIN"]}><RegistrarAvancePage /></ProtectedRoute>} />
        <Route path="/ninos/:ninoId/avance" element={<ProtectedRoute roles={["APODERADO", "TERAPEUTA", "ADMIN", "RECEPCIONISTA"]}><VerAvancePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/perfil" replace />} />
      </Route>
    </Routes>
  );
}