import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api.js";

export default function PagarPagoPage() {
  const { pagoId } = useParams();
  const navigate = useNavigate();

  const [pago, setPago] = useState(null);
  const [metodo, setMetodo] = useState("");
  const [numeroBoleta, setNumeroBoleta] = useState("");
  const [numeroOperacion, setNumeroOperacion] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (pagoId) {
      api.obtenerPago(pagoId)
        .then(setPago)
        .catch((err) => setError(err.message || "No se pudo cargar el pago."))
        .finally(() => setCargando(false));
    }
  }, [pagoId]);

  const esTransaccion = metodo === "TRANSFERENCIA";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    if (!metodo) {
      setError("Selecciona el método de pago.");
      return;
    }
    if (esTransaccion && !numeroBoleta.trim()) {
      setError("Ingresa el número de boleta.");
      return;
    }
    if (esTransaccion && !numeroOperacion.trim()) {
      setError("Ingresa el número de operación de la transacción.");
      return;
    }
    setEnviando(true);
    try {
      const pagado = await api.pagarPago(pagoId, {
        metodo,
        numeroBoleta: numeroBoleta.trim(),
        numeroOperacion: numeroOperacion.trim(),
      });
      setMensaje(`Pago de S/ ${Number(pagado.monto).toFixed(2)} registrado correctamente. Te redirigimos a tus pagos...`);
      setTimeout(() => navigate("/avance-pagos"), 1600);
    } catch (err) {
      setError(err.message || "No se pudo registrar el pago.");
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <p className="page-msg">Cargando...</p>;

  if (!pago) {
    return (
      <div className="card">
        {error && <p className="error-text">{error}</p>}
        <p>No se encontró el pago. <Link to="/avance-pagos">Volver a Avance y pagos</Link></p>
      </div>
    );
  }

  const nino = pago.atencion?.nino?.nombreCompleto || "Paciente";
  const especialidad = pago.atencion?.especialidad?.nombre || "-";
  const fechaAtencion = pago.atencion?.fechaHora
    ? new Date(pago.atencion.fechaHora).toLocaleString("es-PE", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  if (pago.estado !== "PENDIENTE") {
    return (
      <div className="card">
        <div className="alert alert-success">
          Este pago de S/ {Number(pago.monto).toFixed(2)} ya fue efectuado ({pago.estado}).
        </div>
        <p>Sesión de {especialidad} para {nino} · {fechaAtencion}</p>
        <Link className="btn btn-primary" to="/avance-pagos">Volver a Avance y pagos</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Efectuar pago</h1>
        <span className="badge badge-pendiente">Pago pendiente</span>
      </div>

      <div className="card perfil-card">
        <div className="perfil-cabecera">
          <span className="avatar avatar-grande">{nino.split(/\s+/)[0]?.[0] || "P"}</span>
          <div>
            <h2 className="perfil-nombre">{nino}</h2>
            <p className="perfil-email">{especialidad} · {fechaAtencion}</p>
          </div>
        </div>
        <div className="perfil-grid">
          <div className="perfil-seccion">
            <h3>Atención</h3>
            <div className="perfil-fila">
              <span className="perfil-etiqueta">Tipo de terapia</span>
              <strong>{especialidad}</strong>
            </div>
            <div className="perfil-fila">
              <span className="perfil-etiqueta">Fecha</span>
              <strong>{fechaAtencion}</strong>
            </div>
          </div>
          <div className="perfil-seccion">
            <h3>Importe a pagar</h3>
            <div className="pago-monto">S/ {Number(pago.monto).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <h2 className="seccion-titulo">Método de pago</h2>
      <div className="card">
        {error && <p className="error-text">{error}</p>}
        {mensaje && <p className="success-text">{mensaje}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grupo-campo">
            <span className="campo-etiqueta">¿Cómo efectuarás este pago?</span>
            <div className="metodo-opciones">
              <label className={`metodo-opcion ${metodo === "EFECTIVO" ? "activa-efectivo" : ""}`}>
                <input
                  type="radio"
                  name="metodo"
                  value="EFECTIVO"
                  checked={metodo === "EFECTIVO"}
                  onChange={() => setMetodo("EFECTIVO")}
                />
                <span className="metodo-titulo">Efectivo</span>
                <span className="metodo-sub">Pagas en el local del centro</span>
              </label>
              <label className={`metodo-opcion ${esTransaccion ? "activa-transferencia" : ""}`}>
                <input
                  type="radio"
                  name="metodo"
                  value="TRANSFERENCIA"
                  checked={esTransaccion}
                  onChange={() => setMetodo("TRANSFERENCIA")}
                />
                <span className="metodo-titulo">Transacción</span>
                <span className="metodo-sub">Transferencia o depósito bancario</span>
              </label>
            </div>
          </div>

          {esTransaccion && (
            <div className="boleta-card">
              <span className="campo-etiqueta">Datos de la boleta (solo para transacción)</span>
              <div className="two-col">
                <label className="grupo-campo">
                  <span className="campo-etiqueta">Número de boleta</span>
                  <input
                    type="text"
                    maxLength={50}
                    value={numeroBoleta}
                    onChange={(e) => setNumeroBoleta(e.target.value)}
                    placeholder="Ej: B001-000123"
                  />
                </label>
                <label className="grupo-campo">
                  <span className="campo-etiqueta">Número de operación</span>
                  <input
                    type="text"
                    maxLength={50}
                    value={numeroOperacion}
                    onChange={(e) => setNumeroOperacion(e.target.value)}
                    placeholder="Ej: 84521379"
                  />
                </label>
              </div>
              <p className="ayuda-campo">
                Estos datos son obligatorios para validar el pago por transacción.
              </p>
            </div>
          )}

          <div className="card-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={enviando}>
              {enviando ? "Procesando..." : `Confirmar pago de S/ ${Number(pago.monto).toFixed(2)}`}
            </button>
            <Link className="btn btn-outline" to="/avance-pagos">Volver</Link>
          </div>
        </form>
      </div>
    </div>
  );
}