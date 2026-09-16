import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

export default function RegistrarNinoPage() {
  const navigate = useNavigate();
  const [nombres, setNombres] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await api.registrarNino({ nombres, fechaNacimiento });
      navigate("/mis-ninos");
    } catch {
      setError("No se pudo registrar al niño. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card login-card">
      <h1 className="page-title">Registrar hijo</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nombres del niño/a
          <input type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} required autoFocus />
        </label>
        <label>
          Fecha de nacimiento
          <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} required />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Guardar niño/a"}
        </button>
      </form>
    </div>
  );
}