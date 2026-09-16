import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { getRol } from "../services/auth.js";

export default function AgendaPage() {
  const navigate = useNavigate();
  const rol = getRol();

  const [citas, setCitas] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .listarCitas()
      .then(setCitas)
      .catch(() => setError("No se pudo cargar la agenda. Verifica que el backend esté corriendo."))
      .finally(() => setCargando(false));
  }, []);

  async function accion(id, tipo) {
    setError("");
    try {
      const actualizada =
        tipo === "confirmar" ? await api.confirmarCita(id) : await api.cancelarCita(id);
      setCitas((prev) => prev.map((c) => (c.id === id ? actualizada : c)));
    } catch {
      setError("No se pudo actualizar la cita.");
    }
  }

  const esAdmin = rol === "ADMIN" || rol === "RECEPCIONISTA";
  const esTerapeuta = rol === "TERAPEUTA";

  if (cargando) return <p className="page-msg">Cargando agenda...</p>;

  return (
    <div className="card">
      <div className="page-header">
        <h1 className="page-title">Agenda de citas</h1>
        <span className="badge badge-role">{rol}</span>
      </div>
      {error && <p className="error-text">{error}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>Niño</th>
            <th>Terapeuta</th>
            <th>Especialidad</th>
            <th>Fecha y hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {citas.map((c) => (
            <tr key={c.id}>
              <td>{c.nino}</td>
              <td>{c.terapeuta}</td>
              <td>{c.especialidad}</td>
              <td>{new Date(c.fechaHora).toLocaleString("es-PE")}</td>
              <td>
                <span className={`badge badge-${c.estado.toLowerCase()}`}>{c.estado}</span>
              </td>
              <td>
                {esAdmin && (
                  <>
                    <button onClick={() => accion(c.id, "confirmar")} disabled={c.estado === "CONFIRMADA" || c.estado === "ATENDIDA" || c.estado === "CANCELADA"}>
                      Confirmar
                    </button>
                    <button onClick={() => accion(c.id, "cancelar")} disabled={c.estado === "CANCELADA" || c.estado === "ATENDIDA"}>
                      Cancelar
                    </button>
                  </>
                )}
                {esTerapeuta && (c.estado === "CONFIRMADA" || c.estado === "ATENDIDA") && (
                  <button
                    onClick={() =>
                      navigate("/registrar-avance", {
                        state: { citaId: c.id, citaLabel: `${c.nino} — ${c.especialidad} (${new Date(c.fechaHora).toLocaleString("es-PE")})` },
                      })
                    }
                  >
                    Registrar avance
                  </button>
                )}
              </td>
            </tr>
          ))}
          {citas.length === 0 && (
            <tr>
              <td colSpan={6}>No hay citas registradas todavía.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}