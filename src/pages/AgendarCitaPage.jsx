import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";

export default function AgendarCitaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ninoInicial = params.get("ninoId") || "";

  const [ninos, setNinos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [form, setForm] = useState({ ninoId: ninoInicial, especialidadId: "", terapeutaId: "", fechaHora: "" });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([api.misHijos(), api.listarEspecialidades(), api.listarTerapeutas()])
      .then(([n, e, t]) => {
        setNinos(n);
        setEspecialidades(e);
        setTerapeutas(t);
      })
      .catch(() => setError("No se pudieron cargar los datos. Verifica tu sesión."))
      .finally(() => setCargando(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      const citada = await api.agendarCita({
        ninoId: Number(form.ninoId),
        especialidadId: Number(form.especialidadId),
        terapeutaId: Number(form.terapeutaId),
        fechaHora: `${form.fechaHora}:00`,
      });
      setMensaje(`Cita solicitada para el ${new Date(form.fechaHora).toLocaleString("es-PE")} (estado: ${citada.estado}).`);
      setForm({ ninoId: ninoInicial, especialidadId: "", terapeutaId: "", fechaHora: "" });
    } catch (err) {
      setError(err.message || "No se pudo agendar la cita. Intenta otro horario.");
    }
  }

  if (cargando) return <p className="page-msg">Cargando...</p>;

  return (
    <div className="card section-card">
      <h1 className="page-title">Agendar cita</h1>
      {error && <p className="error-text">{error}</p>}
      {mensaje && <p className="success-text">{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Hijo
          <select
            value={form.ninoId}
            onChange={(e) => setForm({ ...form, ninoId: e.target.value })}
            required
          >
            <option value="">Selecciona...</option>
            {ninos.map((n) => (
              <option key={n.id} value={n.id}>{n.nombres}</option>
            ))}
          </select>
        </label>
        <label>
          Especialidad
          <select
            value={form.especialidadId}
            onChange={(e) => setForm({ ...form, especialidadId: e.target.value })}
            required
          >
            <option value="">Selecciona...</option>
            {especialidades.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre} ({e.duracionMinutos} min)</option>
            ))}
          </select>
        </label>
        <label>
          Terapeuta
          <select
            value={form.terapeutaId}
            onChange={(e) => setForm({ ...form, terapeutaId: e.target.value })}
            required
          >
            <option value="">Selecciona...</option>
            {terapeutas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.usuario.nombre} — {t.especialidad.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fecha y hora
          <input
            type="datetime-local"
            value={form.fechaHora}
            onChange={(e) => setForm({ ...form, fechaHora: e.target.value })}
            required
          />
        </label>
        <div className="card-actions">
          <button type="submit" className="btn btn-primary">Solicitar cita</button>
          <Link className="btn btn-outline" to="/mis-ninos">Volver</Link>
        </div>
      </form>
    </div>
  );
}