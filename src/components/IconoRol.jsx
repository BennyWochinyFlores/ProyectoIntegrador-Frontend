const TRAZOS = {
  ADMIN: [
    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    "m9 12 2 2 4-4",
  ],
  RECEPCIONISTA: [
    "M8 3h8a1 1 0 0 1 1 1v2H7V4a1 1 0 0 1 1-1z",
    "M6 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1",
    "M8 12h8",
    "M8 16h5",
  ],
  TERAPEUTA: [
    "M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z",
  ],
  APODERADO: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  USUARIO: [
    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  ],
  CORREO: [
    "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
  ],
  TELEFONO: [
    "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
  ],
};

const ORDEN = ["ADMIN", "RECEPCIONISTA", "TERAPEUTA", "APODERADO"];

function claveDe(tipo) {
  const texto = String(tipo || "").toUpperCase();
  return ORDEN.find((r) => texto.includes(r)) || "USUARIO";
}

export default function IconoRol({ tipo, className = "" }) {
  const clave = claveDe(tipo);
  const trazos = TRAZOS[clave];
  return (
    <svg
      className={`icono-svg ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {trazos.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}