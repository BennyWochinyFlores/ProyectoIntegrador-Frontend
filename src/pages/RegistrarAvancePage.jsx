import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

export default function RegistrarAvancePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const citaId = state?.citaId;
  const citaLabel = state?.citaLabel || "";

  const [observaciones, setObservaciones] = useState("");
  const [nivelAvance, setNivelAvance] = useState("EN_PROGRESO");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);
    try {
      await api.registrarSesion({ citaId, observaciones, nivelAvance });
      setMensaje("Avance registrado correctamente.");
      setObservaciones("");
      setTimeout(() => navigate("/agenda"), 1200);
    } catch (err) {
      setError(err.message || "No se pudo registrar el avance.");
    } finally {
      setCargando(false);
    }
  }

  if (!citaId) {
    return (
      <div className="card">
        <p>No se seleccionó ninguna cita. <Link to="/agenda">Volver a la agenda</Link></p>
      </div>
    );
  }

  return (
    <div className="card section-card">
      <h1 className="page-title">Registrar avance de terapia</h1>
      <p><strong>Cita:</strong> {citaLabel}</p>
      {error && <p className="error-text">{error}</p>}
      {mensaje && <p className="success-text">{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Nivel de avance
          <select value={nivelAvance} onChange={(e) => setNivelAvance(e.target.value)} required>
            <option value="INICIAL">Inicial</option>
            <option value="EN_PROGRESO">En progreso</option>
            <option value="LOGRADO">Logrado</option>
          </select>
        </label>
        <label>
          Observaciones de la sesión
          <textarea
            rows="4"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Describe el avance del niño en esta sesión..."
          />
        </label>
        <div className="card-actions">
          <button type="submit" className="btn btn-primary" disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar avance"}
          </button>
          <Link className="btn btn-outline" to="/agenda">Volver</Link>
        </div>
      </form>
    </div>
  );
}