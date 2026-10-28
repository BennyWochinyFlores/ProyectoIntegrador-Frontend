import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api.js";
import IconoRol from "../components/IconoRol.jsx";

const TIPO_CONTRATO = { INDEFINIDO: "Indefinido", DEFINIDO: "Definido" };

function iniciales(nombre = "") {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function fechaBonita(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
}

function fechaCorta(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ContratoTrabajadorPage() {
  const { id } = useParams();
  const [trabajador, setTrabajador] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.detalleTrabajador(id)
      .then(setTrabajador)
      .catch((err) => setError(err.message || "No se pudo obtener la información del trabajador."))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <p className="page-msg">Cargando...</p>;
  if (error) return <p className="error-text">{error}</p>;

  const c = trabajador?.contrato;
  const nombre = `${trabajador.apellidoPaterno || ""} ${trabajador.apellidoMaterno || ""} ${trabajador.nombres || ""}`.trim();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Contrato del trabajador</h1>
        <span className={`badge badge-rol rol-${String(trabajador.tipo || "").toLowerCase()}`}>
          <IconoRol tipo={trabajador.tipo} />
          {trabajador.tipo}
        </span>
      </div>

      <div className="card perfil-card">
        <div className="perfil-cabecera">
          <span className="avatar avatar-grande">{iniciales(nombre)}</span>
          <div>
            <h2 className="perfil-nombre">{nombre || "Trabajador"}</h2>
            <p className="perfil-email">
              {trabajador.dni ? `DNI ${trabajador.dni}` : "DNI no registrado"}
              {trabajador.email ? ` · ${trabajador.email}` : ""}
            </p>
          </div>
        </div>

        <div className="perfil-grid">
          <div className="perfil-seccion">
            <h3>Datos del trabajador</h3>
            <div className="perfil-fila">
              <span className="perfil-etiqueta">DNI</span>
              <strong>{trabajador.dni || "-"}</strong>
            </div>
            <div className="perfil-fila">
              <span className="perfil-etiqueta">Tipo</span>
              <strong>{trabajador.tipo}</strong>
            </div>
            <div className="perfil-fila">
              <span className="perfil-etiqueta">Estado</span>
              <span className={`badge ${trabajador.activo ? "badge-logrado" : "badge-cancelada"}`}>
                {trabajador.activo ? "ACTIVO" : "INACTIVO"}
              </span>
            </div>
            {trabajador.colegiatura && (
              <div className="perfil-fila">
                <span className="perfil-etiqueta">Colegiatura</span>
                <strong>{trabajador.colegiatura}</strong>
              </div>
            )}
          </div>

          <div className="perfil-seccion">
            <h3>Áreas asignadas</h3>
            {trabajador.especialidades?.length > 0 ? (
              <div className="chip-grupo">
                {trabajador.especialidades.map((e) => (
                  <span key={e} className="chip chip-hijo">{e}</span>
                ))}
              </div>
            ) : (
              <p className="perfil-fila">
                <span className="perfil-etiqueta">Especialidades</span>
                <strong>Sin asignar</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {!c ? (
        <div className="card">
          <p className="sin-datos">Este trabajador aún no tiene contrato registrado.</p>
        </div>
      ) : (
        <>
          <div className="vista-cards cuatro">
            <div className="card stat-card">
              <span className="stat-icon">📄</span>
              <div>
                <strong>{c.numero}</strong>
                <small>N° de contrato</small>
              </div>
            </div>
            <div className="card stat-card">
              <span className="stat-icon">💰</span>
              <div>
                <strong>S/ {Number(c.salario).toFixed(2)}</strong>
                <small>Salario mensual</small>
              </div>
            </div>
            <div className="card stat-card">
              <span className="stat-icon">📅</span>
              <div>
                <strong>{fechaCorta(c.fechaInicio)}</strong>
                <small>Fecha de inicio</small>
              </div>
            </div>
            <div className="card stat-card">
              <span className="stat-icon">🔖</span>
              <div>
                <strong>{TIPO_CONTRATO[c.tipoContrato] || c.tipoContrato}</strong>
                <small>Tipo de contrato</small>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="page-header">
              <h2 className="section-card">Detalle del contrato</h2>
              <span className="badge badge-logrado">{c.estado}</span>
            </div>
            <div className="perfil-grid">
              <div className="perfil-seccion">
                <h3>Condiciones</h3>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Puesto</span>
                  <strong>{c.puesto || "-"}</strong>
                </div>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Jornada</span>
                  <strong>{c.jornada || "-"}</strong>
                </div>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Salario mensual</span>
                  <strong>S/ {Number(c.salario).toFixed(2)}</strong>
                </div>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Tipo de contrato</span>
                  <strong>{TIPO_CONTRATO[c.tipoContrato] || c.tipoContrato}</strong>
                </div>
              </div>
              <div className="perfil-seccion">
                <h3>Vigencia</h3>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Fecha de inicio</span>
                  <strong>{fechaBonita(c.fechaInicio) || "-"}</strong>
                </div>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Fecha de fin</span>
                  <strong>{c.fechaFin ? fechaBonita(c.fechaFin) : "Contrato indefinido"}</strong>
                </div>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Tiempo de contrato</span>
                  <strong>
                    {c.fechaFin
                      ? `Del ${fechaCorta(c.fechaInicio)} al ${fechaCorta(c.fechaFin)}`
                      : `Desde ${fechaCorta(c.fechaInicio)} (indefinido)`}
                  </strong>
                </div>
                <div className="perfil-fila">
                  <span className="perfil-etiqueta">Estado</span>
                  <span className="badge badge-logrado">{c.estado}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="card-actions">
        <Link className="btn btn-outline" to="/trabajadores">Volver a trabajadores</Link>
      </div>
    </div>
  );
}