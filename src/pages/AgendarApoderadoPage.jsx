import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api.js";

const DIA_JS = { SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6 };
const HORAS = Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

export default function AgendarApoderadoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [apoderado, setApoderado] = useState(null);
  const [especialidades, setEspecialidades] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [horario, setHorario] = useState({ feriados: [], diasCerrados: [] });
  const [form, setForm] = useState({ ninoId: "", especialidadId: "", trabajadorId: "", fecha: "", hora: "" });
  const [ocupados, setOcupados] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  const hoy = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([api.obtenerApoderado(id), api.listarEspecialidades(), api.listarTerapeutas(), api.obtenerHorarios()])
      .then(([a, e, t, h]) => {
        setApoderado(a);
        setEspecialidades(e);
        setTerapeutas(t);
        setHorario(h);
        if (a.hijos?.length === 1) {
          setForm((f) => ({ ...f, ninoId: String(a.hijos[0].id) }));
        }
      })
      .catch(() => setError("No se pudieron cargar los datos. Verifica tu sesión."))
      .finally(() => setCargando(false));
  }, [id]);

  const hijo = (apoderado?.hijos || []).find((n) => String(n.id) === form.ninoId);
  const esp = especialidades.find((e) => String(e.id) === form.especialidadId);
  const ter = terapeutas.find((t) => String(t.id) === form.trabajadorId);
  const duracionSel = esp?.duracionMinutos || 45;

  // Cargar horarios ocupados del terapeuta para la fecha elegida
  useEffect(() => {
    if (!form.trabajadorId || !form.fecha || esNoLaborable(form.fecha)) {
      setOcupados([]);
      return;
    }
    api.horariosOcupados(form.trabajadorId, form.fecha)
      .then((lista) => setOcupados(lista))
      .catch(() => setOcupados([]));
  }, [form.trabajadorId, form.fecha]);

  // Un horario NO deshabilitado queda ocupado si se solapa con una cita del terapeuta
  function horaOcupada(h) {
    if (!form.trabajadorId || !form.fecha || ocupados.length === 0) return false;
    const ini = Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
    const fin = ini + duracionSel;
    return ocupados.some((o) => {
      if (!String(o.fechaHora).startsWith(form.fecha)) return false;
      const d = new Date(o.fechaHora);
      const s = d.getHours() * 60 + d.getMinutes();
      const e = s + (o.duracionMinutos || 60);
      return ini < e && s < fin; // solapan en el tiempo
    });
  }

  // Si la hora seleccionada quedó ocupada, limpiarla
  useEffect(() => {
    if (form.hora && horaOcupada(form.hora)) {
      setForm((f) => ({ ...f, hora: "" }));
    }
  }, [ocupados, duracionSel]);
  const completo = Boolean(hijo && esp && ter && form.fecha && form.hora);
  const fechaLabel = form.fecha
    ? new Date(`${form.fecha}T00:00:00`).toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  function esNoLaborable(fecha) {
    if (!fecha) return false;
    const d = new Date(`${fecha}T00:00:00`);
    const diaNombre = Object.keys(DIA_JS).find((k) => DIA_JS[k] === d.getDay());
    return (horario.diasCerrados || []).includes(diaNombre) || (horario.feriados || []).includes(fecha);
  }

  function cambiarFecha(valor) {
    setForm((f) => ({ ...f, fecha: valor, hora: "" }));
    if (valor && esNoLaborable(valor)) {
      setError("Ese día el centro está cerrado (domingo o feriado). Elige otro día.");
    } else {
      setError("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    if (!form.fecha || !form.hora) {
      setError("Selecciona una fecha y una hora.");
      return;
    }
    if (esNoLaborable(form.fecha)) {
      setError("Ese día el centro está cerrado. Elige otro.");
      return;
    }
    try {
      const fechaHora = `${form.fecha}T${form.hora}:00`;
      const agenda = await api.agendarAtencion({
        ninoId: Number(form.ninoId),
        especialidadId: Number(form.especialidadId),
        terapeutaId: Number(form.trabajadorId),
        fechaHora,
      });
      setMensaje(`Cita solicitada para el ${new Date(fechaHora).toLocaleString("es-PE")} (estado: ${agenda.estado}). El centro la confirmará.`);
      setForm({ ninoId: "", especialidadId: "", trabajadorId: "", fecha: "", hora: "" });
    } catch (err) {
      setError(err.message?.includes("se solapa")
        ? "El terapeuta ya tiene una atención en ese horario. Elige otro."
        : err.message || "No se pudo agendar la cita. Intenta otro horario.");
    }
  }

  if (cargando) return <p className="page-msg">Cargando...</p>;

  function filaResumen(etiqueta, valor) {
    return (
      <div className="resumen-fila">
        <span className="resumen-etiqueta">{etiqueta}</span>
        <span className={valor ? "resumen-valor" : "resumen-valor resumen-pendiente"}>{valor || "Por elegir"}</span>
      </div>
    );
  }

  return (
    <div className="card section-card agendar-card">
      <div className="agendar-cabecera">
        <div className="agendar-icono" aria-hidden="true">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="3" y="5" width="18" height="16" rx="2.5" />
            <path d="M3 9.5h18" />
            <path d="M8 3v4M16 3v4" />
            <path d="M8 13h2.2M8 16.5h2.2M13.5 13h2.2M13.5 16.5h2.2" />
          </svg>
        </div>
        <div>
          <h1 className="page-title">Agendar cita para apoderado</h1>
          {apoderado && <p className="agendar-sub">Apoderado: {apoderado.nombreCompleto} ({apoderado.email || "sin email"})</p>}
        </div>
      </div>

      <div className="agendar-info">
        <span className="agendar-info-chip">Lun – Sáb</span>
        <span className="agendar-info-chip">8:00 am – 8:00 pm</span>
        <span className="agendar-info-chip">Sesiones de 60 min</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <form onSubmit={handleSubmit}>
        <div className="agendar-layout">
          <div className="agendar-form">
            <div className="grupo-campo">
              <span className="campo-etiqueta">Hijo</span>
              <select value={form.ninoId} onChange={(e) => setForm({ ...form, ninoId: e.target.value })} required>
                <option value="">Selecciona al niño o niña</option>
                {(apoderado?.hijos || []).map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nombreCompleto} ({n.parentesco})
                  </option>
                ))}
              </select>
            </div>

            <div className="grupo-campo">
              <span className="campo-etiqueta">Especialidad</span>
              <select value={form.especialidadId} onChange={(e) => setForm({ ...form, especialidadId: e.target.value })} required>
                <option value="">Selecciona la especialidad</option>
                {especialidades.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} · {e.duracionMinutos} min · S/ {Number(e.precio).toFixed(2)}
                  </option>
                ))}
              </select>
              {esp && <p className="ayuda-campo">Sesión de {esp.duracionMinutos} minutos · S/ {Number(esp.precio).toFixed(2)}</p>}
            </div>

            <div className="grupo-campo">
              <span className="campo-etiqueta">Terapeuta</span>
              <select value={form.trabajadorId} onChange={(e) => setForm({ ...form, trabajadorId: e.target.value })} required>
                <option value="">Selecciona el terapeuta</option>
                {terapeutas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.usuario?.nombre || t.nombre}{t.colegiatura ? ` · ${t.colegiatura}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="two-col">
              <div className="grupo-campo">
                <span className="campo-etiqueta">Fecha</span>
                <input
                  type="date"
                  min={hoy}
                  value={form.fecha}
                  onChange={(e) => cambiarFecha(e.target.value)}
                  required
                />
                {esNoLaborable(form.fecha) && <p className="fecha-cerrada">Ese día el centro está cerrado. Elige otro.</p>}
              </div>

              <div className="grupo-campo">
                <span className="campo-etiqueta">Hora</span>
                <div className="horas-grid">
                  {HORAS.map((h) => {
                    const ocupada = horaOcupada(h);
                    return (
                      <button
                        type="button"
                        key={h}
                        className={`hora-chip ${form.hora === h ? "activa" : ""} ${ocupada ? "ocupada" : ""}`}
                        disabled={!form.fecha || esNoLaborable(form.fecha) || ocupada}
                        title={ocupada ? "El terapeuta ya tiene una sesión en este horario" : undefined}
                        onClick={() => setForm({ ...form, hora: h })}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
                {form.trabajadorId && form.fecha && ocupados.length > 0 && (
                  <p className="ayuda-campo">Las horas tachadas ya están reservadas para este terapeuta.</p>
                )}
              </div>
            </div>
          </div>

          <aside className="agendar-resumen">
            <h3 className="resumen-titulo">Resumen de la cita</h3>
            {filaResumen("Hijo", hijo?.nombreCompleto)}
            {filaResumen("Especialidad", esp?.nombre)}
            {filaResumen("Terapeuta", ter?.usuario?.nombre || ter?.nombre)}
            {filaResumen("Fecha", form.fecha && form.hora ? `${fechaLabel} · ${form.hora}` : (fechaLabel || ""))}
            {esp && (
              <div className="resumen-total">
                <span className="resumen-total-etiqueta">Total por sesión</span>
                <span className="resumen-total-precio">S/ {Number(esp.precio).toFixed(2)}</span>
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-agendar-confirm" disabled={!completo}>
              Solicitar cita
            </button>
            {!completo && <p className="resumen-aviso">Completa todos los campos para confirmar.</p>}
            <Link className="btn btn-outline btn-volver" to="/apoderados">Volver</Link>
          </aside>
        </div>
      </form>
    </div>
  );
}