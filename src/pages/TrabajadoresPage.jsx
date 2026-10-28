import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import IconoRol from "../components/IconoRol.jsx";

const TIPOS = ["", "ADMIN", "RECEPCIONISTA", "TERAPEUTA"];
const FILTROS_VACIOS = { id: "", tipo: "", nombre: "" };

function iniciales(nombre = "") {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function TrabajadoresPage() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [trabajadores, setTrabajadores] = useState(null);
  const [busque, setBusque] = useState(false);
  const [error, setError] = useState("");

  function cambiar(campo, valor) {
    setFiltros((f) => ({ ...f, [campo]: valor }));
  }

  function validar() {
    if (filtros.id && !/^\d+$/.test(filtros.id)) {
      setError("El ID debe ser un número.");
      return false;
    }
    return true;
  }

  async function buscar(e) {
    e.preventDefault();
    if (!validar()) return;
    setError("");
    setTrabajadores(null);
    setBusque(true);
    try {
      const lista = await api.listarTrabajadores({
        id: filtros.id || undefined,
        tipo: filtros.tipo || undefined,
        nombre: filtros.nombre || undefined,
      });
      setTrabajadores(lista);
    } catch (err) {
      setTrabajadores([]);
      setError(err.message);
    }
  }

  function limpiar() {
    setFiltros(FILTROS_VACIOS);
    setTrabajadores(null);
    setBusque(false);
    setError("");
  }

  const lista = trabajadores || [];
  const total = lista.length;
  const porTipo = { ADMIN: 0, RECEPCIONISTA: 0, TERAPEUTA: 0 };
  lista.forEach((t) => {
    if (porTipo[t.tipo] !== undefined) porTipo[t.tipo]++;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Trabajadores</h1>
        <span className="badge badge-role">ADMIN</span>
      </div>

      <div className="vista-cards">
        {[
          { label: "Total", valor: total, icon: "👥" },
          { label: "Administradores", valor: porTipo.ADMIN, icon: "⚙️" },
          { label: "Recepcionistas", valor: porTipo.RECEPCIONISTA, icon: "🏠" },
          { label: "Terapeutas", valor: porTipo.TERAPEUTA, icon: "🩺" },
        ].map((c) => (
          <div key={c.label} className="card stat-card">
            <span className="stat-icon">{c.icon}</span>
            <div>
              <strong>{c.valor}</strong>
              <small>{c.label}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="card-actions" style={{ marginTop: 0, marginBottom: 14 }}>
        <Link className="btn btn-primary" to="/nuevo-trabajador">+ Nuevo trabajador</Link>
      </div>

      <form className="card" onSubmit={buscar}>
        <div className="fila filtros-fila">
          <label>
            Nombre
            <input
              type="text"
              placeholder="Buscar por nombre o apellido"
              value={filtros.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
            />
          </label>
          <label>
            ID
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ej: 1"
              value={filtros.id}
              onChange={(e) => cambiar("id", e.target.value.replace(/\D/g, "").slice(0, 8))}
            />
          </label>
          <label>
            Tipo
            <select value={filtros.tipo} onChange={(e) => cambiar("tipo", e.target.value)}>
              {TIPOS.map((t) => (
                <option key={t || "todos"} value={t}>
                  {t ? t : "Todos"}
                </option>
              ))}
            </select>
          </label>
          <div className="filtros-acciones">
            <button type="submit" className="btn btn-primary">Buscar</button>
            <button type="button" onClick={limpiar}>Limpiar</button>
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
      </form>

      {!busque && !trabajadores && <p className="page-msg">Usa los filtros para ver trabajadores.</p>}

      {trabajadores && (
        <div className="card">
          {trabajadores.length === 0 ? (
            <p className="sin-datos">No se encontraron trabajadores con esos filtros.</p>
          ) : (
            <div className="tabla-wrap">
              <table className="table tabla-trabajadores">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Tipo</th>
                    <th>Colegiatura</th>
                    <th>Email</th>
                    <th>Estado</th>
                    <th>Contrato</th>
                  </tr>
                </thead>
                <tbody>
                  {trabajadores.map((t) => {
                    const nombre = `${t.apellidoPaterno || ""} ${t.apellidoMaterno || ""} ${t.nombres || ""}`;
                    return (
                      <tr key={t.id}>
                        <td>
                          <div className="persona-cell">
                            <span className="avatar avatar-claro">{iniciales(nombre)}</span>
                            <span className="persona-nombre">{nombre || "-"}</span>
                          </div>
                        </td>
                        <td>{t.dni || "-"}</td>
                        <td>
                          <span className={`badge badge-trabajador rol-${String(t.tipo || "").toLowerCase()}`}>
                            <IconoRol tipo={t.tipo} />
                            {t.tipo}
                          </span>
                        </td>
                        <td>{t.colegiatura || "-"}</td>
                        <td>{t.email || "-"}</td>
                        <td>
                          <span className={`badge ${t.activo ? "badge-logrado" : "badge-cancelada"}`}>
                            {t.activo ? "ACTIVO" : "INACTIVO"}
                          </span>
                        </td>
                        <td>
                          <Link className="btn btn-outline btn-sm" to={`/trabajadores/${t.id}/contrato`}>
                            Ver contrato
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}