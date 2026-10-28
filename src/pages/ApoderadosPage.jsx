import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

function iniciales(nombre = "") {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function ApoderadosPage() {
  const [apoderados, setApoderados] = useState(null);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    api.listarApoderados()
      .then(setApoderados)
      .catch((err) => setError(err.message || "No se pudieron cargar los apoderados."));
  }, []);

  const apoderadosFiltrados = apoderados
    ? apoderados.filter((a) =>
        a.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase())
      )
    : null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Apoderados</h1>
        <span className="badge badge-role">ADMIN / RECEPCIONISTA</span>
      </div>
      {error && <p className="error-text">{error}</p>}
      <p className="page-msg">
        Revisa a los apoderados registrados y agenda sus citas si aún no lo han hecho.
      </p>

      <div className="buscador-apoderados">
        <input
          type="text"
          placeholder="Buscar apoderado por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-buscar"
        />
        <button
          type="button"
          onClick={() => setBusqueda("")}
          disabled={!busqueda.trim()}
          className="btn btn-outline btn-limpiar"
          title="Limpiar búsqueda"
        >
          Limpiar
        </button>
      </div>

      {!apoderados ? (
        <p className="page-msg">Cargando...</p>
      ) : apoderadosFiltrados.length === 0 ? (
        <p className="sin-datos">
          {busqueda.trim()
            ? `No se encontraron apoderados con el nombre "${busqueda}".`
            : "Aún no hay apoderados registrados."}
        </p>
      ) : (
        <div className="apoderados-grid">
          {apoderadosFiltrados.map((a) => (
            <div key={a.id} className="apoderado-card">
              <div className="apoderado-cabecera">
                <span className="avatar avatar-grande">{iniciales(a.nombreCompleto)}</span>
                <div className="apoderado-titulo">
                  <strong className="apoderado-nombre-card">{a.nombreCompleto}</strong>
                  <span className="apoderado-dni">DNI: {a.dni || "—"}</span>
                </div>
              </div>

              <div className="apoderado-cuerpo">
                <div className="apoderado-fila">
                  <span className="apoderado-etiqueta">Email</span>
                  <span className="apoderado-valor apoderado-email">{a.email || "—"}</span>
                </div>
                <div className="apoderado-fila">
                  <span className="apoderado-etiqueta">Teléfonos</span>
                  {a.telefonos?.length ? (
                    <span className="apoderado-valor">
                      {a.telefonos.map((tel, i) => (
                        <span key={i} className="chip chip-telefono">{tel}</span>
                      ))}
                    </span>
                  ) : (
                    <span className="apoderado-vacio">Sin teléfonos</span>
                  )}
                </div>
                <div className="apoderado-fila">
                  <span className="apoderado-etiqueta">Hijos</span>
                  {a.hijos?.length ? (
                    <span className="apoderado-valor">
                      {a.hijos.map((h) => (
                        <span key={h.id} className="chip chip-hijo">
                          {h.nombreCompleto}
                          <em className="chip-parentesco">{h.parentesco}</em>
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="apoderado-vacio">Sin hijos</span>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <Link className="btn btn-primary btn-agendar" to={`/apoderados/${a.id}/agendar`}>
                  Agendar cita
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
