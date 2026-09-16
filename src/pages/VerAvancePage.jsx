import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api.js";

export default function VerAvancePage() {
  const { ninoId } = useParams();
  const [nino, setNino] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([api.obtenerNino(ninoId), api.listarSesionesNino(ninoId)])
      .then(([n, s]) => {
        setNino(n);
        setSesiones(s);
      })
      .catch((err) => setError(err.message || "No se pudo cargar el avance."))
      .finally(() => setCargando(false));
  }, [ninoId]);

  if (cargando) return <p className="page-msg">Cargando avance...</p>;

  return (
    <div>
      <h1 className="page-title">Avance de {nino?.nombres || "niño"}</h1>
      {error ? (
        <p className="error-text">{error}</p>
      ) : (
        <>
          {sesiones.length === 0 ? (
            <p>Aún no hay terapias registradas para este niño.</p>
          ) : (
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Terapia</th>
                    <th>Nivel de avance</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sesiones.map((s) => (
                    <tr key={s.id}>
                      <td>{new Date(s.cita.fechaHora).toLocaleString("es-PE")}</td>
                      <td>{s.cita.especialidad.nombre}</td>
                      <td>
                        <span className={`badge badge-${s.nivelAvance.toLowerCase()}`}>{s.nivelAvance}</span>
                      </td>
                      <td>{s.observaciones || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="card-actions">
            <Link className="btn btn-outline" to="/mis-ninos">Volver a mis hijos</Link>
          </div>
        </>
      )}
    </div>
  );
}