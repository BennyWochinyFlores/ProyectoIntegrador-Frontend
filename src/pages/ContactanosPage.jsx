import { useState } from "react";

export default function ContactanosPage() {
  const [form, setForm] = useState({ nombre: "", correo: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setEnviado(true);
    setForm({ nombre: "", correo: "", mensaje: "" });
  }

  return (
    <div>
      <section className="card section-card">
        <h1>Contáctanos</h1>
        <div className="contact-grid">
          <div>
            <h3>Información del centro</h3>
            <p><strong>Dirección:</strong> Av. Los Terapeutas 123, Lima, Perú</p>
            <p><strong>Teléfono:</strong> (01) 555-1234</p>
            <p><strong>Correo:</strong> contacto@centroestimulacion.pe</p>
            <p><strong>Horario:</strong> Lun a Sáb 8:00 - 20:00 (domingos y feriados cerrado)</p>
          </div>
          <div>
            <h3>Escríbenos</h3>
            {enviado && (
              <p className="success-text">¡Gracias por escribirnos! Te responderemos pronto.</p>
            )}
            <form onSubmit={handleSubmit}>
              <label>
                Nombre
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </label>
              <label>
                Correo electrónico
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  required
                />
              </label>
              <label>
                Mensaje
                <textarea
                  rows="4"
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  required
                />
              </label>
              <button type="submit" className="btn btn-primary">Enviar mensaje</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}