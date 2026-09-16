import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

function edad(fecha) {
  const nac = new Date(fecha);
  const hoy = new Date();
  let anios = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) anios--;
  return anios;
}

export default function MisNinosPage() {
  const [ninos, setNinos] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

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
      <div className="grid-3">
        {ninos.map((n) => (
          <div key={n.id} className="card nino-card">
            <h2>{n.nombres}</h2>
            <p>Fecha de nacimiento: {new Date(n.fechaNacimiento).toLocaleDateString("es-PE")}</p>
            <p>Edad: {edad(n.fechaNacimiento)} años</p>
            <div className="card-actions">
              <Link className="btn btn-primary" to={`/agendar?ninoId=${n.id}`}>
                Agendar cita
              </Link>
              <Link className="btn btn-outline" to={`/ninos/${n.id}/avance`}>
                Ver avance
              </Link>
            </div>
          </div>
        ))}
      </div>
      {ninos.length === 0 && (
        <p>Todavía no tienes hijos registrados. Usa el botón "Registrar hijo" para dar de alta a tu niño/a.</p>
      )}
    </div>
  );
}