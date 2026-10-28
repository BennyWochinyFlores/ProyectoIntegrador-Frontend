import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import PasswordStrength from "../components/PasswordStrength.jsx";

const soloDigitos = (valor, max) => valor.replace(/\D/g, "").slice(0, max);

export default function RegistrarTrabajadorPage() {
  const navigate = useNavigate();
  const hoy = new Date().toISOString().slice(0, 10);

  const [especialidades, setEspecialidades] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState({
    apellidoPaterno: "",
    apellidoMaterno: "",
    nombres: "",
    dni: "",
    fechaNacimiento: "",
    genero: "",
    email: "",
    password: "",
    telefono: "",
    tipo: "",
    colegiatura: "",
    especialidadIds: [],
    tipoContrato: "INDEFINIDO",
    puesto: "",
    fechaInicio: "",
    fechaFin: "",
    salario: "",
    jornada: "Lun-Sáb 08:00-20:00",
  });

  useEffect(() => {
    api.listarEspecialidades()
      .then(setEspecialidades)
      .catch(() => setError("No se pudieron cargar las especialidades."));
  }, []);

  function cambiar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function toggleEspecialidad(id) {
    setForm((f) => ({
      ...f,
      especialidadIds: f.especialidadIds.includes(id)
        ? f.especialidadIds.filter((x) => x !== id)
        : [...f.especialidadIds, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const esValida = form.password.length >= 6 && /[A-Za-z]/.test(form.password) && /\d/.test(form.password);
    if (!esValida) {
      setError("La contraseña debe tener al menos 6 caracteres e incluir letras y números.");
      setCargando(false);
      return;
    }
    setCargando(true);
    try {
      await api.registrarTrabajador({
        ...form,
        dni: form.dni || null,
        telefono: form.telefono || null,
        colegiatura: form.colegiatura || null,
        especialidadIds: form.tipo === "TERAPEUTA" ? form.especialidadIds : [],
        contrato: {
          tipoContrato: form.tipoContrato,
          puesto: form.puesto,
          fechaInicio: form.fechaInicio,
          fechaFin: form.tipoContrato === "DEFINIDO" ? form.fechaFin : null,
          salario: Number(form.salario),
          jornada: form.jornada || null,
        },
      });
      navigate("/trabajadores");
    } catch (err) {
      setError(err.message?.includes("ya está registrado") || err.message?.includes("409")
        ? "El correo o el DNI ya están registrados."
        : err.message || "No se pudo registrar al trabajador. Verifica los datos.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card section-card">
      <h1 className="page-title">Registrar trabajador</h1>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <h2 className="section-card h2">Datos personales</h2>
        <div className="two-col">
          <label>
            Apellido paterno
            <input type="text" value={form.apellidoPaterno} onChange={(e) => cambiar("apellidoPaterno", e.target.value)} />
          </label>
          <label>
            Apellido materno
            <input type="text" value={form.apellidoMaterno} onChange={(e) => cambiar("apellidoMaterno", e.target.value)} />
          </label>
        </div>
        <label>
          Nombres
          <input type="text" value={form.nombres} onChange={(e) => cambiar("nombres", e.target.value)} required />
        </label>
        <div className="two-col">
          <label>
            DNI (7 dígitos)
            <input
              type="text"
              inputMode="numeric"
              value={form.dni}
              maxLength={7}
              pattern="[0-9]{7}"
              title="El DNI debe tener exactamente 7 dígitos"
              placeholder="1234567"
              onChange={(e) => cambiar("dni", soloDigitos(e.target.value, 7))}
              required
            />
          </label>
          <label>
            Fecha de nacimiento
            <input
              type="date"
              value={form.fechaNacimiento}
              max={hoy}
              onChange={(e) => cambiar("fechaNacimiento", e.target.value)}
              required
            />
          </label>
        </div>
        <div className="two-col">
          <label>
            Género
            <select value={form.genero} onChange={(e) => cambiar("genero", e.target.value)} required>
              <option value="">Seleccionar...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </label>
          <label>
            Celular (9 dígitos)
            <input
              type="text"
              inputMode="numeric"
              value={form.telefono}
              maxLength={9}
              pattern="[0-9]{9}"
              title="El celular debe tener exactamente 9 dígitos"
              placeholder="987654321"
              onChange={(e) => cambiar("telefono", soloDigitos(e.target.value, 9))}
              required
            />
          </label>
        </div>
        <div className="two-col">
          <label>
            Correo electrónico
            <input type="email" value={form.email} onChange={(e) => cambiar("email", e.target.value)} required />
          </label>
          <label>
            Contraseña (mínimo 6 caracteres, con letras y números)
            <input type="password" value={form.password} minLength={6} onChange={(e) => cambiar("password", e.target.value)} required />
            <PasswordStrength password={form.password} />
          </label>
        </div>

        <h2 className="section-card h2">Puesto</h2>
        <div className="two-col">
          <label>
            Tipo de trabajador
            <select value={form.tipo} onChange={(e) => cambiar("tipo", e.target.value)} required>
              <option value="">Seleccionar...</option>
              <option value="ADMIN">ADMIN</option>
              <option value="RECEPCIONISTA">RECEPCIONISTA</option>
              <option value="TERAPEUTA">TERAPEUTA</option>
            </select>
          </label>
          <label>
            Colegiatura
            <input type="text" placeholder="Ej: CTP-12345" value={form.colegiatura} onChange={(e) => cambiar("colegiatura", e.target.value)} />
            <span className="ayuda-campo">
              Solo aplica para la categoría TERAPEUTA (ej. CTP-12345).
            </span>
          </label>
        </div>
        {form.tipo === "TERAPEUTA" && (
          <label style={{ display: "block" }}>
            Especialidades
            <div className="especialidades-grid">
              {especialidades.map((e) => (
                <label className="especialidad-chip" key={e.id}>
                  <input
                    type="checkbox"
                    checked={form.especialidadIds.includes(e.id)}
                    onChange={() => toggleEspecialidad(e.id)}
                  />
                  {e.nombre}
                </label>
              ))}
            </div>
          </label>
        )}

        <h2 className="section-card h2">Contrato</h2>
        <div className="two-col">
          <label>
            Tipo de contrato
            <select value={form.tipoContrato} onChange={(e) => cambiar("tipoContrato", e.target.value)} required>
              <option value="INDEFINIDO">INDEFINIDO</option>
              <option value="DEFINIDO">DEFINIDO</option>
            </select>
          </label>
          <label>
            Puesto laboral
            <input type="text" placeholder="Ej: Terapeuta de lenguaje" value={form.puesto} onChange={(e) => cambiar("puesto", e.target.value)} required />
          </label>
        </div>
        <div className="two-col">
          <label>
            Fecha de inicio
            <input type="date" value={form.fechaInicio} onChange={(e) => cambiar("fechaInicio", e.target.value)} required />
          </label>
          {form.tipoContrato === "DEFINIDO" && (
            <label>
              Fecha de fin
              <input type="date" min={form.fechaInicio || undefined} value={form.fechaFin} onChange={(e) => cambiar("fechaFin", e.target.value)} required />
            </label>
          )}
        </div>
        <div className="two-col">
          <label>
            Salario mensual (S/)
            <input type="number" step="0.01" min="0" value={form.salario} onChange={(e) => cambiar("salario", e.target.value)} required />
          </label>
          <label>
            Jornada
            <input type="text" value={form.jornada} onChange={(e) => cambiar("jornada", e.target.value)} />
          </label>
        </div>

        <div className="card-actions">
          <button type="submit" className="btn btn-primary" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrar trabajador"}
          </button>
          <Link className="btn btn-outline" to="/trabajadores">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}