import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { getRol } from "../services/auth.js";

function iniciales(nombre = "") {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

const ESTADOS = ["PENDIENTE", "CONFIRMADA", "CANCELADA", "ATENDIDA", "REPROGRAMADA"];

const HORAS = Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

function normalizar(texto = "") {
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function AgendaPage() {
  const navigate = useNavigate();
  const rol = getRol();

  const [atenciones, setAtenciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [reprogramando, setReprogramando] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [ocupadosRepro, setOcupadosRepro] = useState([]);

  const hoy = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    api
      .listarAtenciones()
      .then(setAtenciones)
      .catch(() => setError("No se pudo cargar la agenda. Verifica que el backend esté corriendo."))
      .finally(() => setCargando(false));
  }, []);

  // Horarios ocupados del terapeuta de la cita que se está reprogramando, para la nueva fecha
  useEffect(() => {
    if (!reprogramando || !nuevaFecha || !reprogramando.terapeutaId) {
      setOcupadosRepro([]);
      return;
    }
    api.horariosOcupados(reprogramando.terapeutaId, nuevaFecha)
      .then((lista) => setOcupadosRepro(lista.filter((o) => String(o.fechaHora) !== String(reprogramando.fechaHora))))
      .catch(() => setOcupadosRepro([]));
  }, [reprogramando, nuevaFecha]);

  function abrirReprogramar(atencion) {
    setError("");
    setReprogramando(atencion);
    const d = new Date(atencion.fechaHora);
    setNuevaFecha(d.toISOString().slice(0, 10));
    setNuevaHora(`${String(d.getHours()).padStart(2, "0")}:00`);
  }

  function cerrarReprogramar() {
    setReprogramando(null);
    setNuevaFecha("");
    setNuevaHora("");
    setOcupadosRepro([]);
  }

  // Una hora está ocupada si se solapa con otra cita del terapeuta (excluyendo la propia)
  function horaReprogramarOcupada(h) {
    if (!reprogramando || !nuevaFecha || ocupadosRepro.length === 0) return false;
    const duracion = reprogramando.duracionMinutos || 60;
    const ini = Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
    const fin = ini + duracion;
    return ocupadosRepro.some((o) => {
      if (!String(o.fechaHora).startsWith(nuevaFecha)) return false;
      const d = new Date(o.fechaHora);
      const s = d.getHours() * 60 + d.getMinutes();
      const e = s + (o.duracionMinutos || 60);
      return ini < e && s < fin;
    });
  }

  // Si la hora seleccionada quedó ocupada, limpiarla
  useEffect(() => {
    if (nuevaHora && reprogramando && nuevaHora !== `${String(new Date(reprogramando.fechaHora).getHours()).padStart(2, "0")}:00` && horaReprogramarOcupada(nuevaHora)) {
      setNuevaHora("");
    }
  }, [ocupadosRepro, nuevaFecha, reprogramando]);

  async function confirmarReprogramar(e) {
    e.preventDefault();
    if (!reprogramando || !nuevaFecha || !nuevaHora) return;
    setGuardando(true);
    setError("");
    try {
      const actualizada = await api.reprogramarAtencion(reprogramando.id, {
        fechaHora: `${nuevaFecha}T${nuevaHora}:00`,
      });
      setAtenciones((prev) => prev.map((c) => (c.id === actualizada.id ? actualizada : c)));
      cerrarReprogramar();
    } catch (err) {
      setError(err.message || "No se pudo reprogramar la atención.");
    } finally {
      setGuardando(false);
    }
  }

  const filtradas = atenciones.filter((c) => {
    const nombre = normalizar(c.nino?.nombreCompleto || c.nino?.nombres || "");
    const coincideNombre = !busqueda || nombre.includes(normalizar(busqueda));
    const coincideEstado = !estado || c.estado === estado;
    return coincideNombre && coincideEstado;
  });

  async function accion(id, tipo) {
    setError("");
    try {
      const actualizada =
        tipo === "confirmar" ? await api.confirmarAtencion(id) : await api.cancelarAtencion(id);
      setAtenciones((prev) => prev.map((c) => (c.id === id ? actualizada : c)));
    } catch {
      setError("No se pudo actualizar la atención.");
    }
  }

  const esAdmin = rol === "ADMIN" || rol === "RECEPCIONISTA";
  const esTerapeuta = rol === "TERAPEUTA";

  if (cargando) return <p className="page-msg">Cargando agenda...</p>;

  return (
    <div className="card">
      <div className="page-header">
        <h1 className="page-title">Agenda de atenciones</h1>
        <span className="badge badge-role">{rol}</span>
      </div>
      {error && <p className="error-text">{error}</p>}

      <div className="agenda-filtros">
        <label className="filtro-busqueda">
          <span className="campo-etiqueta">Buscar niño o paciente</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe el nombre del niño..."
          />
        </label>
        <label className="filtro-estado">
          <span className="campo-etiqueta">Estado</span>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </label>
        {filtradas.length < atenciones.length ? (
          <span className="filtro-conteo">Mostrando {filtradas.length} de {atenciones.length}</span>
        ) : (
          <span className="filtro-conteo">{atenciones.length} atención(es)</span>
        )}
      </div>

      <table className="table tabla-agenda">
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
          {filtradas.map((c) => (
            <tr key={c.id}>
              <td>
                <div className="persona-cell">
                  <span className="avatar">{iniciales(c.nino?.nombreCompleto || c.nino?.nombres)}</span>
                  <span className="persona-nombre">{c.nino?.nombreCompleto || c.nino?.nombres}</span>
                </div>
              </td>
              <td>
                <div className="persona-cell">
                  <span className="avatar avatar-claro">{iniciales(c.terapeuta)}</span>
                  <span className="persona-nombre">{c.terapeuta || "-"}</span>
                </div>
              </td>
              <td>
                <span className="esp-nombre">{c.especialidad || "-"}</span>
                {c.precio != null && (
                  <span className="esp-precio">S/ {Number(c.precio).toFixed(2)}</span>
                )}
              </td>
              <td>
                <div className="fecha-hora">
                  <span className="fecha">
                    {new Date(c.fechaHora).toLocaleDateString("es-PE", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <span className="hora">
                    {new Date(c.fechaHora).toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </td>
              <td>
                <span className={`badge badge-${c.estado.toLowerCase()}`}>{c.estado}</span>
              </td>
              <td>
                <div className="acciones-celda">
                  {esAdmin && (
                    <>
                      <button
                        className="btn btn-sm"
                        onClick={() => accion(c.id, "confirmar")}
                        disabled={c.estado !== "PENDIENTE"}
                      >
                        Confirmar
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => accion(c.id, "cancelar")}
                        disabled={c.estado === "CANCELADA" || c.estado === "ATENDIDA"}
                      >
                        Cancelar
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => abrirReprogramar(c)}
                        disabled={c.estado === "CANCELADA" || c.estado === "ATENDIDA"}
                      >
                        Reprogramar
                      </button>
                    </>
                  )}
                  {c.nino?.id && (
                    <button
                      className="btn btn-sm"
                      onClick={() => navigate(`/ninos/${c.nino.id}/avance`)}
                    >
                      Ver paciente
                    </button>
                  )}
                  {esTerapeuta && c.estado === "CONFIRMADA" && (
                    <button
                      className="btn btn-sm"
                      onClick={() =>
                        navigate("/registrar-avance", {
                          state: {
                            atencionId: c.id,
                            atencionLabel: `${c.nino?.nombreCompleto || c.nino?.nombres} — ${c.especialidad} (${new Date(c.fechaHora).toLocaleString("es-PE")})`,
                            duracion: c.duracionMinutos || 45,
                          },
                        })
                      }
                    >
                      Registrar avance
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {filtradas.length === 0 && (
            <tr>
              <td colSpan={6} className="celda-vacia">
                {atenciones.length === 0
                  ? "No hay atenciones registradas todavía."
                  : "No hay atenciones que coincidan con la búsqueda."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {reprogramando && (
        <div className="modal-capa" onClick={cerrarReprogramar}>
          <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-titulo">Reprogramar atención</h2>
            <p className="modal-sub">
              {reprogramando.nino?.nombreCompleto || reprogramando.nino?.nombres} —{" "}
              {reprogramando.especialidad}
            </p>

            <label className="campo-bloque">
              Nueva fecha
              <input
                type="date"
                value={nuevaFecha}
                min={hoy}
                onChange={(e) => setNuevaFecha(e.target.value)}
              />
            </label>

              <div className="campo-bloque">
                <span className="campo-etiqueta">Nueva hora</span>
                <div className="horas-grid">
                  {HORAS.map((h) => {
                    const ocupada = horaReprogramarOcupada(h);
                    return (
                      <button
                        key={h}
                        type="button"
                        className={`hora-chip ${nuevaHora === h ? "activa" : ""} ${ocupada ? "ocupada" : ""}`}
                        disabled={ocupada}
                        title={ocupada ? "El terapeuta ya tiene una sesión en este horario" : undefined}
                        onClick={() => setNuevaHora(h)}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
                {nuevaFecha && ocupadosRepro.length > 0 && (
                  <p className="campo-etiqueta" style={{ fontWeight: "normal", marginTop: 6 }}>
                    Las horas tachadas ya están reservadas para este terapeuta ese día.
                  </p>
                )}
              </div>

            <div className="modal-acciones">
              <button
                className="btn btn-primary"
                onClick={confirmarReprogramar}
                disabled={guardando || !nuevaFecha || !nuevaHora}
              >
                {guardando ? "Guardando..." : "Confirmar reprogramación"}
              </button>
              <button className="btn btn-outline" onClick={cerrarReprogramar} disabled={guardando}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}