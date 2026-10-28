import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { getUser } from "../services/auth.js";

const OPCIONES_POR_GENERO = {
  F: [
    { valor: "MADRE", etiqueta: "Madre" },
    { valor: "TUTOR", etiqueta: "Tutor" },
  ],
  M: [
    { valor: "PADRE", etiqueta: "Padre" },
    { valor: "TUTOR", etiqueta: "Tutor" },
  ],
};

const PARENTESCOS_SOLO_TUTOR = [{ valor: "TUTOR", etiqueta: "Tutor" }];

export default function RegistrarNinoPage() {
  const navigate = useNavigate();
  const generoApoderado = getUser()?.genero;
  const parentescos = OPCIONES_POR_GENERO[generoApoderado] || PARENTESCOS_SOLO_TUTOR;

  const [dni, setDni] = useState("");
  const [genero, setGenero] = useState("M");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [nombres, setNombres] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [parentesco, setParentesco] = useState(generoApoderado === "F" ? "MADRE" : generoApoderado === "M" ? "PADRE" : "TUTOR");

  const [habilitado, setHabilitado] = useState(false);
  const [encontrado, setEncontrado] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function buscarPorDni(e) {
    e.preventDefault();
    setError("");
    setAviso("");
    const d = dni.trim();
    if (!/^\d{8}$/.test(d)) {
      setError("Ingresa un DNI válido de 8 dígitos.");
      return;
    }
    setBuscando(true);
    setBuscado(true);
    try {
      const nino = await api.buscarNinoPorDni(d);
      setEncontrado(true);
      setHabilitado(false);
      setApellidoPaterno(nino.apellidoPaterno || "");
      setApellidoMaterno(nino.apellidoMaterno || "");
      setNombres(nino.nombres);
      setFechaNacimiento(nino.fechaNacimiento?.slice(0, 10) || "");
      setGenero(nino.genero);
      setAviso("Niño/a encontrado. Verifica los datos y presiona Registrar para vincularlo a tu cuenta.");
    } catch (err) {
      if (err.status === 409) {
        navigate("/mis-ninos", { state: { aviso: "Este hijo ya está vinculado a tu cuenta." } });
        return;
      }
      if (err.status === 404) {
        setEncontrado(false);
        setHabilitado(true);
        setAviso("No hay un niño/a registrado con ese DNI. Completa los datos para registrarlo.");
      } else {
        setEncontrado(false);
        setHabilitado(false);
        setError("No se pudo buscar el DNI. Intenta de nuevo.");
      }
    } finally {
      setBuscando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const d = dni.trim();
    if (!/^\d{8}$/.test(d)) {
      setError("Ingresa un DNI válido de 8 dígitos.");
      return;
    }
    setCargando(true);
    try {
      if (encontrado) {
        await api.vincularNino({ dni: d, parentesco });
      } else {
        await api.registrarNino({
          dni: d,
          genero,
          apellidoPaterno,
          apellidoMaterno,
          nombres,
          fechaNacimiento,
          parentesco,
        });
      }
      navigate("/mis-ninos");
    } catch (err) {
      setError(err.status === 409 ? err.message : "No se pudo guardar al niño/a. Verifica los datos.");
    } finally {
      setCargando(false);
    }
  }

  const camposBloqueados = !habilitado || encontrado || buscando;

  return (
    <div className="card login-card">
      <h1 className="page-title">Registrar hijo</h1>
      <form onSubmit={buscarPorDni} className="buscar-dni-form">
        <label>
          DNI del niño/a
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={dni}
            onChange={(e) => {
              setDni(e.target.value.replace(/\D/g, ""));
              setError("");
              setAviso("");
              setBuscado(false);
              setEncontrado(false);
              setHabilitado(false);
              setApellidoPaterno("");
              setApellidoMaterno("");
              setNombres("");
              setFechaNacimiento("");
              setGenero("M");
            }}
            required
            autoFocus
          />
        </label>
        <button type="submit" className="btn btn-outline" disabled={buscando}>
          {buscando ? "Buscando..." : "Buscar por DNI"}
        </button>
      </form>

      {buscado && aviso && <p className="ok-text">{aviso}</p>}
      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="two-col">
          <label>
            Apellido paterno
            <input type="text" value={apellidoPaterno} onChange={(e) => setApellidoPaterno(e.target.value)} disabled={camposBloqueados} required />
          </label>
          <label>
            Apellido materno
            <input type="text" value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value)} disabled={camposBloqueados} required />
          </label>
        </div>
        <label>
          Nombres del niño/a
          <input type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} disabled={camposBloqueados} required />
        </label>
        <div className="two-col">
          <label>
            Fecha de nacimiento
            <input type="date" max={new Date().toISOString().slice(0, 10)} value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} disabled={camposBloqueados} required />
          </label>
          <label>
            Género
            <select value={genero} onChange={(e) => setGenero(e.target.value)} disabled={camposBloqueados} required>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </label>
        </div>
        <label>
          Parentesco
          <select value={parentesco} onChange={(e) => setParentesco(e.target.value)}>
            {parentescos.map((p) => (
              <option key={p.valor} value={p.valor}>{p.etiqueta}</option>
            ))}
          </select>
        </label>

        {buscado && (
          <button type="submit" disabled={cargando}>
            {cargando
              ? "Guardando..."
              : encontrado
                ? "Vincular a mi cuenta"
                : "Guardar niño/a"}
          </button>
        )}
      </form>
    </div>
  );
}