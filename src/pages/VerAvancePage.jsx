import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api.js";
import { getRol } from "../services/auth.js";

function iniciales(nombre = "") {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function edadDe(fecha) {
  if (!fecha) return null;
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export default function VerAvancePage() {
  const { ninoId } = useParams();
  const rol = getRol();
  const [nino, setNino] = useState(null);
  const [atenciones, setAtenciones] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([api.obtenerNino(ninoId), api.atencionesDeNino(ninoId)])
      .then(([n, s]) => {
        setNino(n);
        setAtenciones(s);
      })
      .catch((err) => setError(err.message || "No se pudo cargar el paciente."))
      .finally(() => setCargando(false));
  }, [ninoId]);

  const nombre = nino?.nombreCompleto || nino?.nombres || "paciente";
  const esApoderado = rol === "APODERADO";
  const volverA = esApoderado ? "/mis-ninos" : "/agenda";
  const etiquetaVolver = esApoderado ? "Volver a mis hijos" : "Volver a la agenda";

  if (cargando) return <p className="page-msg">Cargando paciente...</p>;

  async function descargar(s) {
    try {
      const blob = await api.descargarDiagnostico(s.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = s.diagnosticoNombre || `diagnostico-atencion-${s.id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "No se pudo descargar el diagnóstico.");
    }
  }

  return (
    <div>
      <h1 className="page-title">Paciente: {nombre}</h1>
      {error ? (
        <p className="error-text">{error}</p>
      ) : (
        <>
          <div className="card perfil-card">
            <div className="perfil-cabecera">
              <span className="avatar avatar-grande">{iniciales(nombre)}</span>
              <div>
                <h2 className="perfil-nombre">{nombre}</h2>
                <p className="perfil-email">
                  {nino?.dni ? `DNI ${nino.dni}` : ""}
                  {nino?.dni && nino?.genero ? " · " : ""}
                  {nino?.genero === "F" ? "Niña" : nino?.genero === "M" ? "Niño" : ""}
                </p>
              </div>
            </div>
            <div className="perfil-grid">
              <div className="perfil-seccion">
                <h3>Datos del paciente</h3>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">DNI</span>
                  <strong>{nino?.dni || "-"}</strong>
                </div>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Género</span>
                  <strong>{nino?.genero === "F" ? "Femenino" : nino?.genero === "M" ? "Masculino" : "-"}</strong>
                </div>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Nacimiento</span>
                  <strong>{nino?.fechaNacimiento || "-"}</strong>
                </div>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Edad</span>
                  <strong>{edadDe(nino?.fechaNacimiento) != null ? `${edadDe(nino.fechaNacimiento)} años` : "-"}</strong>
                </div>
              </div>
              <div className="perfil-seccion">
                <h3>Apoderado</h3>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Nombre</span>
                  <strong>{nino?.apoderado?.nombre || "-"}</strong>
                </div>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Parentesco</span>
                  <strong>{nino?.parentesco || "-"}</strong>
                </div>
              </div>
            </div>
          </div>

          <h2 className="seccion-titulo">Citas</h2>
          {atenciones.length === 0 ? (
            <p className="sin-datos">Aún no hay citas registradas para este paciente.</p>
          ) : (
            <div className="card">
              <table className="table tabla-agenda">
                <thead>
                  <tr>
                    <th>Fecha y hora</th>
                    <th>Terapia</th>
                    <th>Terapeuta</th>
                    <th>Nivel de avance</th>
                    <th>Estado</th>
                    <th>Diagnóstico</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {atenciones.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="fecha-hora">
                          <span className="fecha">
                            {new Date(s.fechaHora).toLocaleDateString("es-PE", {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                          <span className="hora">
                            {new Date(s.fechaHora).toLocaleTimeString("es-PE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="esp-nombre">{s.especialidad || "-"}</span>
                        {s.duracionMinutos && <span className="esp-precio">{s.duracionMinutos} min</span>}
                      </td>
                      <td>
                        <div className="persona-cell">
                          <span className="avatar avatar-claro">{iniciales(s.terapeuta)}</span>
                          <span className="persona-nombre">{s.terapeuta || "-"}</span>
                        </div>
                      </td>
                      <td>
                        {s.nivelAvance ? (
                          <span className={`badge badge-${String(s.nivelAvance).toLowerCase()}`}>{s.nivelAvance}</span>
                        ) : (
                          <span className="sin-datos">Sin registro</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${s.estado.toLowerCase()}`}>{s.estado}</span>
                      </td>
                      <td>
                        {s.diagnosticoNombre ? (
                          <button className="btn btn-sm" onClick={() => descargar(s)} title={s.diagnosticoNombre}>
                            Descargar
                          </button>
                        ) : (
                          <span className="sin-datos">—</span>
                        )}
                      </td>
                      <td>{s.observaciones || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="card-actions">
            <Link className="btn btn-outline" to={volverA}>{etiquetaVolver}</Link>
          </div>
        </>
      )}
    </div>
  );
}