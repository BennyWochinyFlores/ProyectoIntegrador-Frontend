import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { saveSession } from "../services/auth.js";

export default function RegistroPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setCargando(true);
    try {
      const sesion = await api.registro({ nombre, email, password });
      saveSession(sesion);
      navigate("/mis-ninos", { replace: true });
    } catch {
      setError("No se pudo crear la cuenta. Verifica que el correo no esté registrado.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card login-card">
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre y apellido
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required autoFocus />
        </label>
        <label>
          Correo electrónico
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña (mínimo 6 caracteres)
          <input type="password" value={password} minLength={6} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          Confirmar contraseña
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={cargando}>
          {cargando ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>
      <p className="login-hint">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}