import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { getRol } from "../services/auth.js";

const NIVEL_ORDEN = ["INICIAL", "EN_PROGRESO", "AVANZADO", "COMPLETADO"];
const NIVEL_ETIQUETA = {
  INICIAL: "Inicial",
  EN_PROGRESO: "En progreso",
  AVANZADO: "Avanzado",
  COMPLETADO: "Completado",
};

function iniciales(nombre = "") {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function tamanoLegible(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function RegistrarAvancePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const rol = getRol();
  const esTerapeuta = rol === "TERAPEUTA";
  const atencionId = state?.atencionId;
  const atencionLabel = state?.atencionLabel || "";
  const duracionBase = state?.duracion || 45;

  const [detalle, setDetalle] = useState(null);
  const [asistio, setAsistio] = useState(true);
  const [duracionMinutos, setDuracionMinutos] = useState(duracionBase);
  const [observaciones, setObservaciones] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [diagnostico, setDiagnostico] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (atencionId) {
      api.obtenerAtencion(atencionId)
        .then((d) => {
          setDetalle(d);
          if (d?.diagnosticoNombre) {
            setDiagnostico({
              nombre: d.diagnosticoNombre,
              tamano: d.diagnosticoTamano,
              fecha: d.diagnosticoFecha,
            });
          }
        })
        .catch(() => {});
    }
  }, [atencionId]);

  async function descargar() {
    try {
      const blob = await api.descargarDiagnostico(atencionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = diagnostico?.nombre || "diagnostico.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "No se pudo descargar el diagnóstico.");
    }
  }

  function elegirArchivo(f) {
    if (!f) {
      setArchivo(null);
      return;
    }
    if (!/\.(doc|docx)$/i.test(f.name)) {
      setError("El diagnóstico debe ser un archivo Word (.doc o .docx).");
      setArchivo(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("El diagnóstico no debe superar los 5 MB.");
      setArchivo(null);
      return;
    }
    setError("");
    setArchivo(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    // El diagnostico es obligatorio para sesiones con asistencia (si aún no tiene uno subido)
    if (esTerapeuta && asistio && !archivo && !diagnostico) {
      setError("El diagnóstico es obligatorio: sube el archivo Word de la sesión antes de registrar el avance.");
      return;
    }
    setCargando(true);
    try {
      const att = await api.atenderAtencion(atencionId, {
        asistio,
        duracionMinutos: Number(duracionMinutos),
        observaciones,
      });
      setMensaje(
        asistio
          ? "Sesión registrada. El pago quedó pendiente para que el apoderado lo efectúe."
          : "Atención registrada como inasistencia (sin pago)."
      );
      if (esTerapeuta && archivo) {
        try {
          const info = await api.subirDiagnostico(atencionId, archivo);
          setDiagnostico({ nombre: info.nombre, tamano: info.tamano, fecha: info.fecha });
          setMensaje((m) => `${m} Diagnóstico subido.`);
          setArchivo(null);
        } catch (eDiag) {
          setError(
            eDiag.error || eDiag.message || "Atención guardada, pero no se pudo subir el diagnóstico."
          );
          setMensaje("");
          return;
        }
      }
      setObservaciones("");
      setTimeout(() => navigate("/agenda"), 1300);
    } catch (err) {
      setError(err.message || "No se pudo registrar la atención.");
    } finally {
      setCargando(false);
    }
  }

  if (!atencionId) {
    return (
      <div className="card">
        <p>No se seleccionó ninguna atención. <Link to="/agenda">Volver a la agenda</Link></p>
      </div>
    );
  }

  const nombre = detalle?.nino?.nombreCompleto || atencionLabel.split("—")[0]?.trim() || "Paciente";
  const especialidad = detalle?.especialidad;
  const precio = null;
  const terapeuta = detalle?.terapeuta;
  const siguienteNivel = detalle?.siguienteNivel || "INICIAL";
  const fechaHora = detalle?.fechaHora
    ? new Date(detalle.fechaHora).toLocaleString("es-PE", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Registrar avance de terapia</h1>
        <span className="badge badge-role">Sesión</span>
      </div>

      <div className="card perfil-card">
        <div className="perfil-cabecera">
          <span className="avatar avatar-grande">{iniciales(nombre)}</span>
          <div>
            <h2 className="perfil-nombre">{nombre}</h2>
            <p className="perfil-email">
              {[especialidad, fechaHora].filter(Boolean).join(" · ") || atencionLabel}
            </p>
          </div>
        </div>
        <div className="perfil-grid">
          <div className="perfil-seccion">
            <h3>Terapia</h3>
            <div className="perfil-fila">
              <span className="perfil-etiqueta">Especialidad</span>
              <strong>{especialidad || "-"}</strong>
            </div>
            {precio != null && (
              <div className="perfil-fila">
                <span className="perfil-etiqueta">Tarifa</span>
                <strong>S/ {Number(precio).toFixed(2)}</strong>
              </div>
            )}
            <div className="perfil-fila">
              <span className="perfil-etiqueta">Duración</span>
              <strong>{detalle?.duracionMinutos || duracionBase} min</strong>
            </div>
          </div>
          <div className="perfil-seccion">
            <h3>Terapeuta</h3>
            <div className="perfil-fila">
              <span className="perfil-etiqueta">Nombre</span>
              <strong>{terapeuta || "-"}</strong>
            </div>
          </div>
        </div>
      </div>

      <h2 className="seccion-titulo">Registrar sesión</h2>
      <div className="card">
        {error && <p className="error-text">{error}</p>}
        {mensaje && <p className="success-text">{mensaje}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grupo-campo">
            <span className="campo-etiqueta">Asistencia a la sesión</span>
            <div className="asistencia-opciones">
              <label className={`asistencia-opcion ${asistio ? "activa-si" : ""}`}>
                <input type="radio" name="asistio" checked={asistio} onChange={() => setAsistio(true)} />
                <span className="asistencia-titulo">Asistió</span>
                <span className="asistencia-sub">Registra la sesión; el pago queda pendiente</span>
              </label>
              <label className={`asistencia-opcion ${!asistio ? "activa-no" : ""}`}>
                <input type="radio" name="asistio" checked={!asistio} onChange={() => setAsistio(false)} />
                <span className="asistencia-titulo">No asistió</span>
                <span className="asistencia-sub">Marca inasistencia, sin pago</span>
              </label>
            </div>
          </div>

          <div className="two-col">
            <label className="grupo-campo">
              <span className="campo-etiqueta">Duración efectiva (minutos)</span>
              <input
                type="number"
                min="5"
                max="240"
                value={duracionMinutos}
                onChange={(e) => setDuracionMinutos(e.target.value)}
                required
              />
            </label>
            <div className="grupo-campo">
              <span className="campo-etiqueta">Nivel de esta sesión</span>
              <div className={`nivel-auto ${!asistio ? "deshabilitado" : ""}`}>
                <div className="nivel-cadena">
                  {NIVEL_ORDEN.map((v, i) => {
                    const indiceActual = NIVEL_ORDEN.indexOf(siguienteNivel);
                    return (
                      <span className="nivel-paso-contenedor" key={v}>
                        <span
                          className={`nivel-paso ${
                            indiceActual > i ? "pasado" : ""
                          } ${v === siguienteNivel ? "actual" : ""}`}
                        >
                          {NIVEL_ETIQUETA[v]}
                        </span>
                        {i < NIVEL_ORDEN.length - 1 && <span className="nivel-flecha">→</span>}
                      </span>
                    );
                  })}
                </div>
                <p className="ayuda-campo">
                  El nivel avanza solo según las sesiones anteriores: la cita inicial no se repite. Si el niño ya
                  pasó por Inicial, esta sesión será En progreso, luego Avanzado y finalmente Completado.
                </p>
              </div>
            </div>
          </div>

          <label className="grupo-campo">
            <span className="campo-etiqueta">Observaciones de la sesión</span>
            <input
              type="text"
              maxLength={100}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Breve nota de la sesión (máx. 100 caracteres)..."
            />
            <span className={`contador-caracteres ${observaciones.length >= 90 ? "alerta" : ""}`}>
              {observaciones.length}/100
            </span>
          </label>

          {esTerapeuta && (
            <div className="grupo-campo">
              <span className="campo-etiqueta">
                Diagnóstico (archivo Word) {asistio && !diagnostico && <em style={{ color: "#b91c1c" }}>— obligatorio</em>}
              </span>
              <input
                type="file"
                accept=".doc,.docx"
                required={esTerapeuta && asistio && !diagnostico}
                onChange={(e) => elegirArchivo(e.target.files?.[0] || null)}
              />
              <p className="ayuda-campo">
                Sube el documento Word (.doc/.docx, máx. 5 MB) con el diagnóstico de la sesión.
                Es obligatorio cuando el paciente asistió; si ya registraste uno, puedes actualizarlo aquí.
                Solo el terapeuta puede subirlo.
              </p>
              {archivo && (
                <p className="archivo-seleccionado">
                  Seleccionado: {archivo.name} · {tamanoLegible(archivo.size)}
                </p>
              )}
              {diagnostico && (
                <div className="cuadro-archivo">
                  <span className="cuadro-archivo-icono">W</span>
                  <div className="cuadro-archivo-info">
                    <strong>{diagnostico.nombre}</strong>
                    <p>
                      {tamanoLegible(diagnostico.tamano)}
                      {diagnostico.fecha
                        ? ` · subido ${new Date(diagnostico.fecha).toLocaleString("es-PE")}`
                        : ""}
                    </p>
                  </div>
                  <button type="button" className="btn btn-sm" onClick={descargar}>Descargar</button>
                </div>
              )}
            </div>
          )}

          <div className={`cuadro-pago ${asistio ? "info-si" : "info-no"}`}>
            <span className="cuadro-pago-icono">{asistio ? "✓" : "✕"}</span>
            <div>
              <strong>{asistio ? "Pago pendiente" : "Inasistencia"}</strong>
              <p>
                {asistio
                  ? `Al guardar se registrará la sesión y quedará un pago de ${
                      precio != null ? `S/ ${Number(precio).toFixed(2)}` : "la tarifa de la especialidad"
                    } pendiente, que el apoderado podrá efectuar desde "Avance y pagos".`
                  : "Al guardar la sesión quedará cancelada y no se generará ningún pago."}
              </p>
            </div>
          </div>

          <div className="card-actions">
            <button type="submit" className="btn btn-primary" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar avance"}
            </button>
            <Link className="btn btn-outline" to="/agenda">Volver</Link>
          </div>
        </form>
      </div>
    </div>
  );
}