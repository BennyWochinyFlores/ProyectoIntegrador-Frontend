# Frontend — Centro de Estimulación Integral

React 19 + Vite. Consume la API REST del backend (Java 21 / Spring Boot).

## Requisitos previos

- Node.js LTS (18+)
- Visual Studio Code (recomendado)
- El backend corriendo en `http://localhost:8080` (ver `../backend/README.md`)

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

Si el backend corre en otra URL (por ejemplo, ya desplegado), actualiza esta variable.

## Estructura

```
src/
  pages/       Pantallas (LoginPage, AgendaPage — una por historia de usuario)
  components/  Componentes reutilizables (vacío por ahora, se llena en el siguiente sprint)
  services/    api.js — cliente centralizado que llama a la API REST
  App.jsx      Rutas de la aplicación (react-router-dom)
  main.jsx     Punto de entrada de React
  index.css    Estilos base
```

## Pantallas implementadas (sprint actual)

- **LoginPage** (HU-11): formulario listo, pendiente de conectar a `/api/auth/login`
  cuando el backend lo exponga.
- **AgendaPage** (HU-12): lista las citas reales desde `GET /api/citas` y permite
  confirmar/cancelar usando los endpoints ya funcionales del backend.

## Pendiente por implementar (siguiente sprint)

- [ ] Conectar LoginPage al endpoint real y guardar el token JWT
- [ ] Formulario para agendar una nueva cita (POST /api/citas)
- [ ] FichaNinoPage con historial y progreso (HU-13)
- [ ] Formulario de registro de sesión para terapeutas (HU-14)
- [ ] Rutas protegidas según rol (redirigir si no hay token)
