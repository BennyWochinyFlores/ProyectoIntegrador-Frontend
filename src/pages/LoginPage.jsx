import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { saveSession } from "../services/auth.js";

const destinoPorRol = {
  ADMIN: "/trabajadores",
  RECEPCIONISTA: "/agenda",
  TERAPEUTA: "/agenda",
  APODERADO: "/mis-ninos",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const sesion = await api.login({ email: email.trim().toLowerCase(), password });
      saveSession(sesion);
      navigate(destinoPorRol[sesion.usuario.rol] || "/", { replace: true });
    } catch (err) {
      const esRed = err instanceof TypeError || String(err.message).includes("Failed to fetch");
      setError(esRed
        ? "No se pudo conectar al servidor. Verifica que el backend esté corriendo en el puerto 8080."
        : err.message?.includes("intento") || err.message?.includes("bloqueada")
          ? err.message
          : "Credenciales inválidas. Revisa tu correo y contraseña.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card login-card">
      <div className="auth-brand">
        <img src="/logo-paleta-wichay.jpeg" alt="Logo Wichay" />
        <strong>Wichay · Centro de Estimulación Integral</strong>
      </div>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <p className="login-hint">
        ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
      </p>
    </div>
  );
}