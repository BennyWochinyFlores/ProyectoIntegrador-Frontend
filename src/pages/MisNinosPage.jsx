import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../services/api.js";

function iniciales(nombre = "") {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function edad(fecha) {
  const nac = new Date(fecha);
  const hoy = new Date();
  let anios = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) anios--;
  return anios;
}

function nombreCompleto(n) {
  return [n.apellidoPaterno, n.apellidoMaterno, n.nombres].filter(Boolean).join(" ");
}

export default function MisNinosPage() {
  const [ninos, setNinos] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const location = useLocation();
  const aviso = location.state?.aviso;

  useEffect(() => {
    api
      .misHijos()
      .then(setNinos)
      .catch(() => setError("No se pudieron cargar tus hijos."))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="page-msg">Cargando tus hijos...</p>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mis hijos</h1>
        <Link className="btn btn-primary" to="/registrar-nino">Registrar hijo</Link>
      </div>
      {error && <p className="error-text">{error}</p>}
      {aviso && <p className="ok-text">{aviso}</p>}

      {ninos.length === 0 ? (
        <p className="sin-datos">
          Todavía no tienes hijos registrados. Usa el botón "Registrar hijo" para dar de alta a tu niño/a.
        </p>
      ) : (
        <div className="apoderados-grid">
          {ninos.map((n) => {
            const nombre = nombreCompleto(n) || n.nombres;
            return (
              <div key={n.id} className="apoderado-card">
                <div className="apoderado-cabecera">
                  <span className="avatar avatar-grande">{iniciales(nombre)}</span>
                  <div className="apoderado-titulo">
                    <strong className="apoderado-nombre-card">{nombre}</strong>
                    <span className="apoderado-dni">
                      DNI: {n.dni || "—"} · {n.parentesco || "—"}
                    </span>
                  </div>
                </div>

                <div className="apoderado-cuerpo">
                  <div className="apoderado-fila">
                    <span className="apoderado-etiqueta">Nacimiento</span>
                    <span className="apoderado-valor">
                      {new Date(n.fechaNacimiento).toLocaleDateString("es-PE")}
                    </span>
                  </div>
                  <div className="apoderado-fila">
                    <span className="apoderado-etiqueta">Edad</span>
                    <span className="apoderado-valor">{edad(n.fechaNacimiento)} años</span>
                  </div>
                  <div className="apoderado-fila">
                    <span className="apoderado-etiqueta">Género</span>
                    <span className="apoderado-valor">{n.genero === "F" ? "Femenino" : "Masculino"}</span>
                  </div>
                  {!n.esPrincipal && (
                    <div className="apoderado-fila">
                      <span className="apoderado-etiqueta">Vinculación</span>
                      <span className="apoderado-valor">
                        Por coincidencia de DNI con otro padre/madre
                      </span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <Link className="btn btn-primary" to={`/agendar?ninoId=${n.id}`}>
                    Agendar cita
                  </Link>
                  <Link className="btn btn-outline" to={`/ninos/${n.id}/avance`}>
                    Ver avance
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}