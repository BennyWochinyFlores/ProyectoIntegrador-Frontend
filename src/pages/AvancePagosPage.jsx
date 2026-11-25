import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

function iniciales(nombre = "") {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function AvancePagosPage() {
  const navigate = useNavigate();
  const [hijos, setHijos] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const lista = await api.misHijos();
        setHijos(lista);
        const todas = [];
        for (const n of lista) {
          const a = await api.atencionesDeNino(n.id);
          todas.push(...a.map((x) => ({ ...x, nino: n })));
        }
        setAtenciones(todas);
        setPagos(await api.listarPagosMios());
      } catch {
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const atendidas = atenciones.filter((a) => a.estado === "ATENDIDA");
  const pendientes = pagos.filter((p) => p.estado === "PENDIENTE");
  const realizados = pagos.filter((p) => p.estado === "PAGADO");
  const totalPagado = realizados.reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const cards = [
    { label: "Hijos registrados", valor: hijos.length, icon: "🧒" },
    { label: "Atenciones totales", valor: atenciones.length, icon: "📅" },
    { label: "Atenciones atendidas", valor: atendidas.length, icon: "✅" },
    { label: "Total pagado", valor: `S/ ${totalPagado.toFixed(2)}`, icon: "💰" },
  ];

  return (
    <div>
      <h1>Avance y pagos</h1>
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <>
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
            <h3>Avance por hijo</h3>
            {hijos.length === 0 ? (
              <p className="sin-datos">
                No tienes hijos registrados. <Link to="/registrar-nino">Registra uno</Link>.
              </p>
            ) : (
              hijos.map((h) => {
                const nombre = h.nombreCompleto || h.nombres;
                const suyas = atenciones
                  .filter((a) => a.nino?.id === h.id)
                  .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
                return (
                  <div key={h.id} className="hijo-resumen">
                    <div className="hijo-cabecera">
                      <span className="avatar">{iniciales(nombre)}</span>
                      <strong className="hijo-nombre">{nombre}</strong>
                      <span className="badge">{h.parentesco}</span>
                    </div>
                    {suyas.length === 0 ? (
                      <p className="hijo-vacio">Aún no tiene citas registradas.</p>
                    ) : (
                      <div className="tabla-wrap hijo-tabla">
                        <table className="table tabla-agenda">
                          <thead>
                            <tr>
                              <th>Fecha y hora</th>
                              <th>Terapia</th>
                              <th>Terapeuta</th>
                              <th>Nivel de avance</th>
                              <th>Estado</th>
                              <th>Observaciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {suyas.map((s) => (
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
                                  {s.duracionMinutos && (
                                    <span className="esp-precio">{s.duracionMinutos} min</span>
                                  )}
                                </td>
                                <td>
                                  <div className="persona-cell">
                                    <span className="avatar avatar-claro">
                                      {iniciales(s.terapeuta)}
                                    </span>
                                    <span className="persona-nombre">
                                      {s.terapeuta || "-"}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  {s.nivelAvance ? (
                                    <span className={`badge badge-${String(s.nivelAvance).toLowerCase()}`}>
                                      {s.nivelAvance}
                                    </span>
                                  ) : (
                                    <span className="sin-datos">Sin registro</span>
                                  )}
                                </td>
                                <td>
                                  <span className={`badge badge-${s.estado.toLowerCase()}`}>{s.estado}</span>
                                </td>
                                <td>{s.observaciones || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {pendientes.length > 0 && (
            <div className="card">
              <div className="page-header">
                <h3>Pagos</h3>
                <span className="badge badge-pendiente">{pendientes.length} pendiente(s)</span>
              </div>
              <div className="tabla-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Niño</th>
                      <th>Tipo de terapia</th>
                      <th>Costo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendientes.map((p) => (
                      <tr key={p.id}>
                        <td>{p.atencion?.nino?.nombreCompleto || "-"}</td>
                        <td>{p.atencion?.especialidad || "-"}</td>
                        <td><strong>S/ {Number(p.monto).toFixed(2)}</strong></td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/pagar/${p.id}`)}
                          >
                            Pagar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}