import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { saveSession } from "../services/auth.js";
import PasswordStrength from "../components/PasswordStrength.jsx";

export default function RegistroPage() {
  const navigate = useNavigate();
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [nombres, setNombres] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const soloDigitos = (valor, max) =>
    valor.replace(/\D/g, "").slice(0, max);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const esValida = password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
    if (!esValida) {
      setError("La contraseña debe tener al menos 6 caracteres e incluir letras y números.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setCargando(true);
    try {
      const sesion = await api.registro({
        apellidoPaterno,
        apellidoMaterno,
        nombres,
        dni,
        email,
        password,
        telefono: telefono || null,
        fechaNacimiento,
        genero,
      });
      saveSession(sesion);
      navigate("/mis-ninos", { replace: true });
    } catch (err) {
      if (String(err.message).includes("409") || String(err.message).includes("ya está registrado")) {
        setError("Ese correo ya está registrado.");
      } else if (err.message?.includes("contraseña")) {
        setError(err.message);
      } else {
        setError("No se pudo crear la cuenta. Verifica tus datos.");
      }
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
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit}>
        <div className="two-col">
          <label>
            Apellido paterno
            <input type="text" value={apellidoPaterno} onChange={(e) => setApellidoPaterno(e.target.value)} required />
          </label>
          <label>
            Apellido materno
            <input type="text" value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value)} required />
          </label>
        </div>
        <label>
          Nombres
          <input type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} required autoFocus />
        </label>
        <div className="two-col">
          <label>
            Fecha de nacimiento
            <input
              type="date"
              value={fechaNacimiento}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />
          </label>
          <label>
            Género
            <select value={genero} onChange={(e) => setGenero(e.target.value)} required>
              <option value="">Seleccionar...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </label>
        </div>
        <div className="two-col">
          <label>
            DNI (7 dígitos)
            <input
              type="text"
              inputMode="numeric"
              value={dni}
              maxLength={7}
              pattern="[0-9]{7}"
              title="El DNI debe tener exactamente 7 dígitos"
              placeholder="1234567"
              onChange={(e) => setDni(soloDigitos(e.target.value, 7))}
              required
            />
          </label>
          <label>
            Celular (9 dígitos)
            <input
              type="text"
              inputMode="numeric"
              value={telefono}
              maxLength={9}
              pattern="[0-9]{9}"
              title="El celular debe tener exactamente 9 dígitos"
              placeholder="987654321"
              onChange={(e) => setTelefono(soloDigitos(e.target.value, 9))}
            />
          </label>
        </div>
        <label>
          Correo electrónico
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña (mínimo 6 caracteres, con letras y números)
          <input type="password" value={password} minLength={6} onChange={(e) => setPassword(e.target.value)} required />
          <PasswordStrength password={password} />
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