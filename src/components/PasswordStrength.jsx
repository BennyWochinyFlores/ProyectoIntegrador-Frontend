function puntosContrasena(p) {
  if (!p) return 0;
  let pts = 0;
  if (p.length >= 6) pts++;
  if (p.length >= 10) pts++;
  if (/[A-Za-z]/.test(p) && /\d/.test(p)) pts++;
  if (/[A-Z]/.test(p) || /[^A-Za-z0-9]/.test(p)) pts++;
  return pts;
}

const niveles = ["mala", "regular", "buena"];
const etiquetas = { mala: "Mala", regular: "Regular", buena: "Segura" };
const segmentos = { mala: 1, regular: 2, buena: 4 };

export function nivelContrasena(p) {
  if (!p) return null;
  const pts = puntosContrasena(p);
  if (pts <= 1) return "mala";
  if (pts <= 2) return "regular";
  return "buena";
}

const requisitos = [
  { test: (p) => p.length >= 6, texto: "Mínimo 6 caracteres" },
  { test: (p) => /[A-Za-z]/.test(p) && /\d/.test(p), texto: "Letras y números" },
  { test: (p) => /[A-Z]/.test(p), texto: "Al menos una mayúscula" },
];

export default function PasswordStrength({ password }) {
  const nivel = nivelContrasena(password);
  const pts = puntosContrasena(password);
  if (!nivel) return null;
  return (
    <div className="fortaleza">
      <div className="barra-seguridad">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`segmento ${i < segmentos[nivel] ? nivel : ""}`}
          />
        ))}
      </div>
      <div className="fortaleza-fila">
        <span className={`texto-seguridad ${nivel}`}>Seguridad: {etiquetas[nivel]}</span>
        {nivel === "buena" && <span className="texto-seguridad buena">✓</span>}
      </div>
      <ul className="requisitos-contrasena">
        {requisitos.map((r) => {
          const ok = r.test(password);
          return (
            <li key={r.texto} className={ok ? "ok" : "no"}>
              {ok ? "✓" : "○"} {r.texto}
            </li>
          );
        })}
      </ul>
    </div>
  );
}