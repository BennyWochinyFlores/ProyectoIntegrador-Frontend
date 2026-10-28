import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  { src: "/esti-slider-1.jpeg", alt: "Estimulación temprana", leyenda: "Estimulación temprana para los primeros años" },
  { src: "/esti-slider-2.jpeg", alt: "Terapia de lenguaje", leyenda: "Terapia de lenguaje y comunicación" },
  { src: "/esti-slider-3.jpeg", alt: "Terapia ocupacional", leyenda: "Terapia ocupacional e integración sensorial" },
  { src: "/esti-slider-4.jpeg", alt: "Nuestro centro", leyenda: "Un espacio pensado para el desarrollo integral" },
];

const servicios = [
  {
    id: "servicio-estimulacion",
    icon: "🧠",
    titulo: "Estimulación Temprana",
    descripcion: "Terapias personalizadas para potenciar el desarrollo motor, cognitivo y sensorial.",
    lista: ["Desarrollo motor y psicomotricidad", "Estimulación cognitiva y sensorial", "Niños de 0 a 3 años"],
  },
  {
    id: "servicio-lenguaje",
    icon: "🗣️",
    titulo: "Terapia de Lenguaje",
    descripcion: "Estimulación del habla, comunicación y lenguaje en niños con dificultades.",
    lista: ["Habla y articulación", "Comprensión y expresión", "Evaluación y plan de terapia"],
  },
  {
    id: "servicio-ocupacional",
    icon: "🧩",
    titulo: "Terapia Ocupacional",
    descripcion: "Desarrollo de habilidades para la vida diaria, motricidad fina e integración sensorial.",
    lista: ["Motricidad fina", "Integración sensorial", "Habilidades de la vida diaria"],
  },
];

const terapias = [
  {
    id: "terapia-estimulacion",
    imagen: "/esti-slider-1.jpeg",
    icon: "🧠",
    titulo: "Estimulación Temprana",
    descripcion: "Potenciamos el desarrollo psicomotor, cognitivo y sensorial en los primeros años de vida, con actividades lúdicas planificadas.",
    lista: ["Desarrollo motor y psicomotricidad", "Estimulación cognitiva y sensorial", "Niños de 0 a 3 años"],
  },
  {
    id: "terapia-lenguaje",
    imagen: "/esti-slider-2.jpeg",
    icon: "🗣️",
    titulo: "Terapia de Lenguaje",
    descripcion: "Fortalecemos la comunicación del niño: comprensión, expresión y pronunciación, para que se desenvuelva con mayor seguridad.",
    lista: ["Habla y articulación", "Comprensión y expresión", "Evaluación y plan de terapia"],
  },
  {
    id: "terapia-ocupacional",
    imagen: "/esti-slider-3.jpeg",
    icon: "🧩",
    titulo: "Terapia Ocupacional",
    descripcion: "Desarrollamos habilidades para la vida diaria, motricidad fina e integración sensorial, favoreciendo su autonomía.",
    lista: ["Motricidad fina", "Integración sensorial", "Habilidades de la vida diaria"],
  },
];

function SeccionCabecera({ oscuro, tag, titulo, parrafo }) {
  return (
    <div className={`seccion-cabecera ${oscuro ? "seccion-cabecera-oscura" : ""}`}>
      <div className="seccion-cabecera-izq">
        <span className="seccion-rayita" />
        <h2>{titulo}</h2>
      </div>
      <div className="seccion-cabecera-der">
        {tag && <span className="seccion-tag">{tag}</span>}
        <p>{parrafo}</p>
      </div>
    </div>
  );
}

const valores = [
  { icon: "🤝", titulo: "Compromiso", texto: "Un acompañamiento cercano en cada etapa del desarrollo de tu hijo." },
  { icon: "❤️", titulo: "Vocación de servicio", texto: "Profesionales que escuchan, orientan y acompañan a las familias." },
  { icon: "🎓", titulo: "Especialistas certificados", texto: "Terapeutas con experiencia en estimulación infantil." },
  { icon: "📊", titulo: "Seguimiento del avance", texto: "Registro de cada sesión y avance consultable en línea." },
];

export default function HomePage() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndice((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const anterior = () => setIndice((i) => (i - 1 + slides.length) % slides.length);
  const siguiente = () => setIndice((i) => (i + 1) % slides.length);

  return (
    <div className="home">
      <section className="home-slider" id="inicio">
        <div
          className="slider-contenedor"
          style={{ transform: `translateX(-${indice * 100}%)` }}
        >
          {slides.map((s) => (
            <div className="slider-panel" key={s.src}>
              <img className="slider-img" src={s.src} alt={s.alt} />
              <div className="slider-datos">
                <span className="slider-etiqueta">Wichay · Centro de Estimulación Integral</span>
                <h2 className="slider-titulo">{s.leyenda}</h2>
                <p className="slider-subtitulo">
                  Terapias especializadas para el desarrollo y la autonomía de tu hijo.
                </p>
                <a
                  className="btn-whatsapp"
                  href="https://wa.me/51999888777?text=Hola%2C%20Wichay.%20Requiero%20informaci%C3%B3n%20sobre%20las%20terapias."
                  target="_blank"
                  rel="noreferrer"
                >
                  📲 Solicita orientación
                </a>
              </div>
            </div>
          ))}
        </div>
        <button className="slider-boton slider-prev" onClick={anterior} aria-label="Anterior">‹</button>
        <button className="slider-boton slider-next" onClick={siguiente} aria-label="Siguiente">›</button>
        <div className="slider-dots">
          {slides.map((s, i) => (
            <button
              key={s.src}
              className={`slider-dot ${i === indice ? "activo" : ""}`}
              onClick={() => setIndice(i)}
              aria-label={`Ir a la imagen ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="home-hero">
        <div className="home-hero-dec home-hero-dec-1" />
        <div className="home-hero-dec home-hero-dec-2" />
        <img className="home-logo" src="/logo-paleta-wichay.jpeg" alt="Logo Wichay" />
        <span className="home-badge">🎈 Wichay · Centro de estimulación integral</span>
        <h1>
          El mejor inicio para el <span className="text-brillo">desarrollo</span> de tu hijo
        </h1>
        <p>
          Acompañamos el crecimiento de niños y adolescentes con terapias especializadas en
          estimulación temprana, lenguaje y terapia ocupacional, junto a un sistema en línea
          para que sigas su avance desde casa.
        </p>
        <div className="home-hero-actions">
          <Link className="btn btn-primary btn-lg" to="/registro">
            Agendar valoración
          </Link>
          <a className="btn btn-outline-light btn-lg" href="#nosotros">
            Conócenos
          </a>
        </div>
        <div className="home-stats">
          <div className="home-stat">
            <strong>+500</strong>
            <span>niños acompañados</span>
          </div>
          <div className="home-stat">
            <strong>3</strong>
            <span>terapias especializadas</span>
          </div>
          <div className="home-stat">
            <strong>100%</strong>
            <span>seguimiento en línea</span>
          </div>
        </div>
      </section>

      <nav className="home-anchors">
        <span>Ir a:</span>
        <a href="#nosotros">Nosotros</a>
        <a href="#servicios">Servicios</a>
        <a href="#contacto">Contacto</a>
      </nav>

      <section id="nosotros" className="home-nosotros">
        <SeccionCabecera
          tag="Nosotros"
          titulo="Un centro pensado para cada familia"
          parrafo="Wichay es un centro psicopedagógico conformado por un grupo humano de jóvenes profesionales en psicopedagogía y psicología, especialistas en abordar los problemas de aprendizaje y estudiar la conducta."
        />
        <div className="home-nosotros-contenido">
          <div className="home-mision-vision">
            <div className="home-mv-card">
              <span>🎯</span>
              <h4>Misión</h4>
              <p>Integrar a niños y adolescentes, brindando apoyo integral mediante el diagnóstico, prevención y tratamiento de trastornos de aprendizaje y emocionales con un equipo profesional multidisciplinario.</p>
            </div>
            <div className="home-mv-card">
              <span>🔭</span>
              <h4>Visión</h4>
              <p>Convertirnos en uno de los principales referentes en el tratamiento de trastornos de aprendizaje y emocionales a nivel nacional, con metodologías efectivas según los últimos avances de la ciencia.</p>
            </div>
          </div>
          <div className="home-nosotros-side">
            <div className="home-side-card">
              <span className="home-side-emoji">👶</span>
              <strong>Terapias desde los primeros años</strong>
              <p>Evaluación inicial y planes personalizados según la etapa de desarrollo.</p>
            </div>
            <div className="home-side-card">
              <span className="home-side-emoji">🗓️</span>
              <strong>Agenda tu próxima sesión</strong>
              <p>Pide tu cita en línea y confirma el horario con el especialista.</p>
            </div>
            <Link className="btn btn-primary" to="/contactanos">Pregúntanos aquí</Link>
          </div>
        </div>
        <div className="home-values">
          {valores.map((v) => (
            <div key={v.titulo} className="home-value">
              <span className="home-value-icon">{v.icon}</span>
              <div>
                <strong>{v.titulo}</strong>
                <p>{v.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="servicios" className="home-servicios">
        <SeccionCabecera
          oscuro
          tag="Nuestros servicios"
          titulo="Cuidamos cada logro de tu pequeño"
          parrafo="Wichay brinda los siguientes servicios: estimulación temprana, terapia de lenguaje y terapia ocupacional, con planes personalizados y seguimiento en línea de cada avance."
        />
        <div className="home-services-grid">
          {servicios.map((s) => (
            <div key={s.titulo} id={s.id} className="home-service-card">
              <div className="home-service-img"><span>{s.icon}</span></div>
              <div className="home-service-body">
                <h3>{s.titulo}</h3>
                <p>{s.descripcion}</p>
                <ul>
                  {s.lista.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
                <Link className="btn btn-primary" to="/registro">
                  Agendar valoración
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="terapias" className="home-terapias">
        <SeccionCabecera
          tag="Terapias"
          titulo="Conoce nuestras terapias"
          parrafo="Cada plan se arma a partir de una evaluación inicial y cada sesión está a cargo de especialistas, de modo que los avances de tu hijo se miden etapa por etapa."
        />
        <div className="home-terapias-list">
          {terapias.map((t, i) => (
            <div
              key={t.titulo}
              id={t.id}
              className={`home-terapia-row ${i % 2 === 1 ? "invertida" : ""}`}
            >
              <div className="home-terapia-img">
                <img src={t.imagen} alt={t.titulo} />
              </div>
              <div className="home-terapia-body">
                <span className="home-terapia-icon">{t.icon}</span>
                <h3>{t.titulo}</h3>
                <p>{t.descripcion}</p>
                <ul>
                  {t.lista.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
                <Link className="btn btn-primary" to="/registro">
                  Agendar valoración
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <h2>Comunícate con nosotros y saca la cita de tu hijo</h2>
          <p>Atendemos de lunes a sábado de 8:00 am a 8:00 pm.</p>
        </div>
        <div className="home-cta-actions">
          <Link className="btn btn-white" to="/contactanos">Contáctanos</Link>
          <Link className="btn btn-outline-light" to="/login">Iniciar sesión</Link>
        </div>
      </section>

      <section id="contacto" className="home-contact">
        <SeccionCabecera
          tag="Contacto"
          titulo="Estamos para acompañarte"
          parrafo="Escríbenos, llámanos o visítanos. Atendemos de lunes a sábado y te responderemos a la brevedad."
        />
        <div className="home-contact-contenido">
          <div className="home-contact-info">
            <h3>Datos de contacto</h3>
            <ul>
              <li>
                <span>📍</span>
                <div>
                  <strong>Dirección</strong>
                  <small>Calle Edwin Vásquez Cam Mza. G1 Lote 25, Urb. Enace, Carabayllo – Lima</small>
                </div>
              </li>
              <li>
                <span>📞</span>
                <div>
                  <strong>Teléfonos</strong>
                  <small>(01) 555-0123 · 999 888 777</small>
                </div>
              </li>
              <li>
                <span>✉️</span>
                <div>
                  <strong>Email</strong>
                  <small>contacto@centroestimulacion.pe</small>
                </div>
              </li>
              <li>
                <span>🕘</span>
                <div>
                  <strong>Horario</strong>
                  <small>Lunes a sábado de 8:00 am a 8:00 pm</small>
                </div>
              </li>
            </ul>
          </div>
          <div className="home-contact-form">
            <strong>¿Tienes dudas sobre las terapias?</strong>
            <p>Escríbenos y te responderemos a la brevedad.</p>
            <Link className="btn btn-primary btn-lg" to="/contactanos">Ir al formulario de contacto</Link>
            <Link className="btn btn-outline btn-lg" to="/registro">Crear cuenta de apoderado</Link>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        © {new Date().getFullYear()} Wichay Centro de Estimulación Integral S.A.C. · Todos los derechos reservados.
      </footer>
    </div>
  );
}