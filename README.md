# Frontend — Centro de Estimulación Integral

Aplicación web en React 19 + Vite. Consume la API REST del backend (Java 21 / Spring Boot).

## Requisitos previos

- Node.js LTS (18+)
- El backend corriendo en `http://localhost:8080`

## Instalación y arranque

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Configuración

El archivo `.env` define la URL base de la API:

```
VITE_API_URL=http://localhost:8080/api
```

Si el backend corre en otra URL, actualiza esta variable.

## Estructura

```
src/
  pages/       Pantallas de la aplicación
  components/  Componentes reutilizables
  services/    api.js — cliente centralizado que llama a la API REST
  App.jsx      Definición de rutas (react-router-dom)
  main.jsx     Punto de entrada de React
  index.css    Estilos base
```

## Pantallas

- Página principal, login y registro de apoderado.
- Mis hijos y registro de niño.
- Agendar cita (horario de 8:00 am a 8:00 pm, lunes a sábado) y avance y pagos.
- Agenda de citas para recepcionista y terapeuta, con confirmar, cancelar y atender.
- Gestión de trabajadores para el administrador: alta de empleados con contrato y ficha del contrato.
- Ingresos y pagos por rango de fechas.
- Perfil y teléfonos.