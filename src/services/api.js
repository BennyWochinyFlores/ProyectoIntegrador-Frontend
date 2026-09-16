const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "token";

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Error ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  return contentType && contentType.includes("application/json")
    ? response.json()
    : response.text();
}

export const api = {
  // Autenticacion (HU-01, HU-02)
  login: (credenciales) => request("/auth/login", { method: "POST", body: JSON.stringify(credenciales) }),
  registro: (datos) => request("/auth/registro", { method: "POST", body: JSON.stringify(datos) }),

  // Citas (RF-03, RF-04)
  listarCitas: () => request("/citas"),
  obtenerCita: (id) => request(`/citas/${id}`),
  agendarCita: (datos) =>
    request("/citas", { method: "POST", body: JSON.stringify(datos) }),
  confirmarCita: (id) => request(`/citas/${id}/confirmar`, { method: "PUT" }),
  cancelarCita: (id) => request(`/citas/${id}/cancelar`, { method: "PUT" }),

  // Sesiones / avance (RF-05, RF-06)
  registrarSesion: (datos) =>
    request("/sesiones", { method: "POST", body: JSON.stringify(datos) }),
  listarSesionesNino: (ninoId) => request(`/sesiones/nino/${ninoId}`),

  // Catalogos y ninos
  listarEspecialidades: () => request("/especialidades"),
  listarTerapeutas: () => request("/terapeutas"),
  listarNinos: () => request("/ninos"),
  misHijos: () => request("/ninos/mis-hijos"),
  registrarNino: (datos) => request("/ninos", { method: "POST", body: JSON.stringify(datos) }),
  obtenerNino: (id) => request(`/ninos/${id}`),
};