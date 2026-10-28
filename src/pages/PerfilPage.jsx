import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { getUser } from "../services/auth.js";
import IconoRol from "../components/IconoRol.jsx";

function iniciales(nombre = "") {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function PerfilPage() {
  const usuario = getUser();
  const [telefonos, setTelefonos] = useState([]);
  const [numero, setNumero] = useState("");
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [numeroEdit, setNumeroEdit] = useState("");
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    cargarTelefonos();
  }, []);

  async function cargarTelefonos() {
    setCargando(true);
    try {
      setTelefonos(await api.listarTusTelefonos());
    } catch {
      setTelefonos([]);
    } finally {
      setCargando(false);
    }
  }

  async function agregar(e) {
    e.preventDefault();
    const soloDigitos = numero.replace(/\D/g, "").slice(0, 9);
    if (soloDigitos.length !== 9) {
      setMsg("Error: el celular debe tener exactamente 9 dígitos.");
      return;
    }
    try {
      const t = await api.agregarTelefono({ numero: soloDigitos });
      setMsg(`Teléfono ${t.numero} registrado como ${t.esPrincipal ? "principal" : "secundario"}.`);
      setNumero("");
      await cargarTelefonos();
    } catch (err) {
      setMsg(err.message);
    }
  }

  function iniciarEdicion(t) {
    setEditandoId(t.id);
    setNumeroEdit(t.numero.replace(/\D/g, "").slice(0, 9));
    setMsg(null);
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setNumeroEdit("");
    setMsg(null);
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    if (!editandoId) return;
    const soloDigitos = numeroEdit.replace(/\D/g, "").slice(0, 9);
    if (soloDigitos.length !== 9) {
      setMsg("Error: el celular debe tener exactamente 9 dígitos.");
      return;
    }
    try {
      await api.actualizarTelefono(editandoId, { numero: soloDigitos });
      setMsg("Teléfono actualizado correctamente.");
      setEditandoId(null);
      setNumeroEdit("");
      await cargarTelefonos();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function eliminarTelefono(id) {
    if (eliminandoId) return;
    try {
      setEliminandoId(id);
      await api.eliminarTelefono(id);
      setMsg("Teléfono eliminado correctamente.");
      await cargarTelefonos();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mi perfil</h1>
        <span className={`badge badge-rol rol-${String(usuario?.rol || "").toLowerCase()}`}>{usuario?.rol}</span>
      </div>

      <div className="card perfil-card">
        <div className="perfil-cabecera">
          <span className="avatar avatar-grande">{iniciales(usuario?.nombre)}</span>
<div className="vista-perfil">
            <h2 className="perfil-nombre">{usuario?.nombre}</h2>
            <p className="perfil-email">{usuario?.email}</p>
          </div>
        </div>

        <div className="perfil-grid">
          <div className="perfil-seccion datos-seccion">
            <h3>Datos personales</h3>
            <div className="perfil-datos">
              <div className="perfil-fila">
                <span className="perfil-fila-icono perfil-icono-nombre"><IconoRol tipo="USUARIO" /></span>
                <span className="perfil-etiqueta">Nombre</span>
                <strong>{usuario?.nombre}</strong>
              </div>
              <div className="perfil-fila">
                <span className="perfil-fila-icono">✉</span>
                <span className="perfil-etiqueta">Email</span>
                <strong>{usuario?.email}</strong>
              </div>
              <div className="perfil-fila">
                <span className="perfil-fila-icono"><IconoRol tipo={usuario?.rol} /></span>
                <span className="perfil-etiqueta">Rol</span>
                <strong>
                  <span className={`badge badge-rol rol-${String(usuario?.rol || "").toLowerCase()}`}>
                    {usuario?.rol}
                  </span>
                </strong>
              </div>
            </div>
          </div>

          <div className="perfil-seccion telefonos-seccion">
            <h3>Mis teléfonos</h3>
            {cargando ? (
              <p>Cargando…</p>
            ) : telefonos.length === 0 ? (
              <p className="sin-datos">Aún no tienes teléfonos registrados.</p>
            ) : (
              <ul className="lista-telefonos">
                {telefonos.map((t) => (
                  <li key={t.id} className="telefono-item">
                    <span className="telefono-icono">☎</span>
                    <div className="telefono-info">
                      <span className="telefono-numero">{t.numero}</span>
                      {t.esPrincipal && <span className="badge badge-principal">Principal</span>}
                    </div>
                    <div className="telefono-acciones">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => iniciarEdicion(t)}
                        disabled={editandoId === t.id || eliminandoId === t.id}
                      >
                        Modificar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => eliminarTelefono(t.id)}
                        disabled={eliminandoId === t.id || editandoId === t.id}
                      >
                        {eliminandoId === t.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {editandoId && (
              <form onSubmit={guardarEdicion} className="telefono-editar">
                <div className="telefono-editar-cabecera">
                  <span className="telefono-editar-icono">✎</span>
                  <span>
                    <strong>Modificar teléfono</strong>
                    <small>Ingresa el nuevo número (9 dígitos)</small>
                  </span>
                </div>
                <div className="telefono-editar-fila">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Nuevo número"
                    value={numeroEdit}
                    maxLength={9}
                    onChange={(e) => setNumeroEdit(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    autoFocus
                  />
                  <button type="submit" className="btn btn-primary">Guardar</button>
                  <button type="button" className="btn btn-outline" onClick={cancelarEdicion}>Cancelar</button>
                </div>
              </form>
            )}
            <form onSubmit={agregar} className="fila telefono-agregar">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Nuevo celular (9 dígitos)"
                value={numero}
                maxLength={9}
                onChange={(e) => setNumero(e.target.value.replace(/\D/g, "").slice(0, 9))}
              />
              <button type="submit" className="btn btn-primary">Agregar</button>
            </form>
            {msg && <p className={msg.includes("Error") ? "error" : "ok"}>{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}