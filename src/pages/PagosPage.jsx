import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function PagosPage() {
  const [pagos, setPagos] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  async function cargar() {
    try {
      setPagos(await api.listarPagos());
      setAtenciones(await api.listarAtenciones().catch(() => []));
    } catch {
      setPagos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function aplicarFiltro(e) {
    e.preventDefault();
    setCargando(true);
    cargar();
  }

  function limpiarFiltros() {
    setDesde("");
    setHasta("");
    setCargando(true);
    cargar();
  }

  const fechaEnRango = (p) => {
    if (!desde && !hasta) return true;
    const f = new Date(p.fechaPago);
    if (desde && f < new Date(`${desde}T00:00`)) return false;
    if (hasta && f > new Date(`${hasta}T23:59:59`)) return false;
    return true;
  };

  const visibles = pagos.filter(fechaEnRango);
  const totalIngresos = visibles
    .filter((p) => p.estado === "PAGADO")
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);
  const contar = (estado) => atenciones.filter((a) => a.estado === estado).length;

  const cards = [
    { label: "Ingresos (pagado)", valor: `S/ ${totalIngresos.toFixed(2)}`, icon: "💵" },
    { label: "Pagos registrados", valor: visibles.length, icon: "🧾" },
    { label: "Atenciones pendientes", valor: contar("PENDIENTE"), icon: "⏳" },
    { label: "Atenciones confirmadas", valor: contar("CONFIRMADA"), icon: "✅" },
    { label: "Atenciones atendidas", valor: contar("ATENDIDA"), icon: "📈" },
    { label: "Canceladas", valor: contar("CANCELADA"), icon: "🚫" },
  ];

  return (
    <div>
      <h1>Ingresos y pagos</h1>
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <>
          <form className="card" onSubmit={aplicarFiltro}>
            <div className="fila filtros-fila">
              <label>
                Desde
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </label>
              <label>
                Hasta
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </label>
              <div className="filtros-acciones">
                <button type="submit" className="btn btn-primary">Balance por fechas</button>
                <button type="button" onClick={limpiarFiltros}>Quitar filtro</button>
              </div>
            </div>
          </form>

          <div className="vista-cards">
            {cards.map((c) => (
              <div key={c.label} className="card stat-card">
                <span className="stat-icon">{c.icon}</span>
                <div>
                  <strong>{c.valor}</strong>
                  <small>{c.label}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>
              Historial de pagos
              {(desde || hasta) && (
                <span className="badge badge-role">filtrado del {desde || "inicio"} al {hasta || "hoy"}</span>
              )}
            </h3>
            {visibles.length === 0 ? (
              <p className="sin-datos">No hay pagos en el rango seleccionado.</p>
            ) : (
              <div className="tabla-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Niño</th>
                      <th>Apoderado</th>
                      <th>Especialidad</th>
                      <th>Método</th>
                      <th>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((p) => (
                      <tr key={p.id}>
                        <td>{new Date(p.fechaPago).toLocaleString("es-PE")}</td>
                        <td>{p.atencion?.nino?.nombreCompleto || "-"}</td>
                        <td>{p.atencion?.nino?.apoderado?.nombre || "-"}</td>
                        <td>{p.atencion?.especialidad || "-"}</td>
                        <td>{p.metodo}</td>
                        <td>S/ {Number(p.monto).toFixed(2)}</td>
                        <td><span className={`badge badge-${String(p.estado).toLowerCase()}`}>{p.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}