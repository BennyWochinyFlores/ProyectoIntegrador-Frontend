import { Link } from "react-router-dom";

const servicios = [
  {
    titulo: "Estimulación Temprana",
    descripcion:
      "Terapias personalizadas para potenciar el desarrollo motor, cognitivo y sensorial de niños de 0 a 3 años.",
  },
  {
    titulo: "Terapia de Lenguaje",
    descripcion:
      "Estimulación del habla, comunicación y lenguaje en niños con dificultades para expresarse o comprender.",
  },
  {
    titulo: "Terapia Ocupacional",
    descripcion:
      "Desarrollo de habilidades para la vida diaria, motricidad fina e integración sensorial.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <h1>Centro de Estimulación Integral</h1>
        <p>
          Acompañamos el desarrollo de tu hijo con terapias especializadas en
          estimulación temprana, lenguaje y terapia ocupacional.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/login">
            Iniciar sesión
          </Link>
          <Link className="btn btn-outline" to="/contactanos">
            Contáctanos
          </Link>
        </div>
      </section>

      <section className="card section-card">
        <h2>Nuestros servicios</h2>
        <div className="grid-3">
          {servicios.map((s) => (
            <div key={s.titulo} className="service-item">
              <h3>{s.titulo}</h3>
              <p>{s.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card section-card">
        <h2>¿Quiénes somos?</h2>
        <p>
          Somos un equipo de profesionales en salud infantil dedicado a brindar
          atención integral y personalizada. Trabajamos junto a las familias
          para que cada niño alcance su máximo potencial.
        </p>
        <p>
          Nuestro sistema en línea permite a los padres consultar el avance de
          sus hijos, agendar citas con especialistas y dar seguimiento a cada
          terapia desde la comodidad de su hogar.
        </p>
      </section>
    </div>
  );
}