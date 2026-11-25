const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "token";

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const esFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(esFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    let message = text || `Error ${response.status}`;
    if (text.trim().startsWith("{")) {
      try {
        message = JSON.parse(text).message || message;
      } catch {
        /* texto no JSON */
      }
    }
    const error = new Error(message || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const contentType = response.headers.get("content-type");
  return contentType && contentType.includes("application/json")
    ? response.json()
    : response.text();
}

export const api = {
  login: (credenciales) => request("/auth/login", { method: "POST", body: JSON.stringify(credenciales) }),
  registro: (datos) => request("/auth/registro", { method: "POST", body: JSON.stringify(datos) }),

  listarAtenciones: () => request("/atenciones"),
  obtenerAtencion: (id) => request(`/atenciones/${id}`),
  agendarAtencion: (datos) =>
    request("/citas", { method: "POST", body: JSON.stringify(datos) }),
  confirmarAtencion: (id) => request(`/atenciones/${id}/confirmar`, { method: "PUT" }),
  reprogramarAtencion: (id, datos) =>
    request(`/atenciones/${id}/reprogramar`, { method: "PUT", body: JSON.stringify(datos) }),
  cancelarAtencion: (id) => request(`/atenciones/${id}/cancelar`, { method: "PUT" }),
  atenderAtencion: (id, datos) =>
    request(`/atenciones/${id}/atender`, { method: "PUT", body: JSON.stringify(datos) }),
  atencionesDeNino: (ninoId) => request(`/atenciones/nino/${ninoId}`),
  subirDiagnostico: (id, archivo) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return request(`/atenciones/${id}/diagnostico`, { method: "PUT", body: formData });
  },
  descargarDiagnostico: async (id) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_URL}/atenciones/${id}/diagnostico`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      let mensaje = "No se pudo descargar el archivo";
      if (text.trim().startsWith("{")) {
        try {
          mensaje = JSON.parse(text).message || mensaje;
        } catch {
          /* texto no JSON */
        }
      }
      throw new Error(mensaje);
    }
    return response.blob();
  },

  listarEspecialidades: () => request("/especialidades"),
  listarTerapeutas: () => request("/terapeutas"),
  horariosOcupados: (terapeutaId, fecha) =>
    request(`/citas/ocupados?terapeutaId=${terapeutaId}&fecha=${fecha}`),
  listarNinos: () => request("/ninos"),
  misHijos: () => request("/ninos/mis-hijos"),
  registrarNino: (datos) => request("/ninos", { method: "POST", body: JSON.stringify(datos) }),
  buscarNinoPorDni: (dni) => request(`/ninos/por-dni/${encodeURIComponent(dni)}`),
  vincularNino: (datos) => request("/ninos/vincular", { method: "POST", body: JSON.stringify(datos) }),
  obtenerNino: (id) => request(`/ninos/${id}`),

  listarTusTelefonos: () => request("/telefonos/mios"),
  agregarTelefono: (datos) => request("/telefonos", { method: "POST", body: JSON.stringify(datos) }),
  actualizarTelefono: (id, datos) => request(`/telefonos/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
  eliminarTelefono: (id) => request(`/telefonos/${id}`, { method: "DELETE" }),

  listarApoderados: (filtros) => {
    const q = new URLSearchParams();
    if (filtros?.nombre) q.set("nombre", filtros.nombre);
    const s = q.toString();
    return request(`/apoderados${s ? `?${s}` : ""}`);
  },
  obtenerApoderado: (id) => request(`/apoderados/${id}`),

  listarPagos: (rango) => {
    const q = new URLSearchParams();
    if (rango?.desde) q.set("desde", rango.desde);
    if (rango?.hasta) q.set("hasta", rango.hasta);
    const s = q.toString();
    return request(`/pagos${s ? `?${s}` : ""}`);
  },
  listarPagosMios: () => request("/pagos/mios"),
  obtenerPago: (id) => request(`/pagos/${id}`),
  pagarPago: (id, datos) => request(`/pagos/${id}/pagar`, { method: "PUT", body: JSON.stringify(datos) }),

  listarTrabajadores: (filtros) => {
    const q = new URLSearchParams();
    if (filtros?.id) q.set("id", filtros.id);
    if (filtros?.tipo) q.set("tipo", filtros.tipo);
    if (filtros?.nombre) q.set("nombre", filtros.nombre);
    const s = q.toString();
    return request(`/trabajadores${s ? `?${s}` : ""}`);
  },
  registrarTrabajador: (datos) => request("/trabajadores", { method: "POST", body: JSON.stringify(datos) }),
  detalleTrabajador: (id) => request(`/trabajadores/${id}`),

  obtenerHorarios: () => request("/horarios"),
};