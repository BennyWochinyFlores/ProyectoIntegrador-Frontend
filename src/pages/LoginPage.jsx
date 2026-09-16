import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { saveSession } from "../services/auth.js";

const destinoPorRol = {
  ADMIN: "/agenda",
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
      const sesion = await api.login({ email, password });
      saveSession(sesion);
      navigate(destinoPorRol[sesion.usuario.rol] || "/", { replace: true });
    } catch {
      setError("Credenciales inválidas. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card login-card">
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