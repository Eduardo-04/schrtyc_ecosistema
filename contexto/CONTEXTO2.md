# SCHRTyC — Sistema de Administración
Actúa como Senior Full Stack Developer. Estoy desarrollando el sistema web 
"SCHRTyC" (Sistema Chiapaneco de Radio, Televisión y Cinematografía) 
para el Gobierno de Chiapas.

## Propósito del Proyecto
Este repositorio es el SISTEMA DE ADMINISTRACIÓN (CMS) interno del SCHRTyC.
NO es el sitio público. El sitio público es:
→ http://radiotvycine.chiapas.gob.mx/

Cuando se tenga acceso al servidor, el sitio público consumirá esta API en:
→ VITE_API_URL=https://api.radiotvycine.chiapas.gob.mx

---

## Stack actual (funcionando):
- Frontend: React + Vite + Tailwind CSS v4 (@tailwindcss/vite)
- Backend: Node.js + Express
- Autenticación: JWT (jsonwebtoken)
- Iconos: lucide-react
- Ubicación: D:\schrtyc\

---

## Estructura de archivos:
schrtyc/
├── backend/
│   ├── src/
│   │   ├── routes/     → programacion.js, noticias.js, estaciones.js, auth.js
│   │   ├── services/   → sheetsService.js (conector Google Sheets)
│   │   ├── middleware/ → auth.js (verificarToken JWT)
│   │   └── app.js
│   └── .env            → PORT=3001, JWT_SECRET=schrtyc_secret_2026
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/  → Sidebar, Header, Dashboard, GrillaProgramacion, Login
    │   │   ├── public/ → (vacío, será proyecto separado)
    │   │   └── shared/ → BadgeEnVivo, LoadingSpinner
    │   ├── services/   → api.js (BASE_URL desde .env)
    │   ├── hooks/      → useProgramacion.js
    │   └── App.jsx     → Maneja sesión JWT + routing por estado
    ├── .env            → VITE_API_URL=http://localhost:3001/api
    └── vite.config.js  → plugin @tailwindcss/vite

---

## Paleta de colores institucional:
- Guinda:  #611232  (principal)
- Dorado:  #A57F2C  (acento)
- Fondo:   #f8f9fa
- Usar hex directo en estilos: bg-[#611232], o style={{ backgroundColor:'#611232' }}

---

## Endpoints del backend:
GET  /api/programacion        → Grilla Radio y TV (filtros: ?tipo=TV|Radio&estacion=)
GET  /api/noticias            → Noticias institucionales
GET  /api/estaciones          → Estaciones activas con streamUrl
POST /api/auth/login          → { email, password } → { ok, token, usuario }
POST /api/auth/verificar      → Header: Authorization: Bearer TOKEN → { ok, usuario }

---

## Estructura de datos:

### Programa:
{
  hora_inicio: '06:00',
  hora_fin:    '07:00',
  nombre:      'Amanecer Chiapaneco',
  conductor:   'Nombre del conductor',
  estacion:    'Canal 10 TV',
  descripcion: 'Descripción del programa',
  tipo:        'TV' | 'Radio'
}

### Noticia:
{
  id:        1,
  titulo:    'Título de la noticia',
  fecha:     '2026-03-24',
  categoria: 'Tecnología',
  imagen:    ''
}

### Usuario (JWT payload):
{
  id:     1,
  nombre: 'Administrador',
  rol:    'admin' | 'editor'
}

---

## Credenciales de prueba:
admin@schrtyc.gob.mx  / admin2026   (rol: admin)
editor@schrtyc.gob.mx / editor2026  (rol: editor)
Token dura: 8 horas — guardado en localStorage como 'schrtyc_token'

---

## Convenciones del proyecto:
- Tailwind v4: @import "tailwindcss" en index.css (NO @tailwind base/components)
- Estilos: usar style={{ }} inline o hex directo en clases Tailwind
- PowerShell en Windows: NO usar && para encadenar comandos (usar líneas separadas)
- Backend usa MOCK_DATA con fallback si Google Sheets falla
- El hook useProgramacion tiene auto-refresh cada 5 minutos

---

## Estado actual:
✅ Backend Express corriendo en localhost:3001
✅ Frontend Admin en localhost:5173
✅ Login JWT funcional — token en localStorage, sesión de 8h
✅ Sidebar, Header con "Ver Sitio" → radiotvycine.chiapas.gob.mx
✅ Dashboard con tarjetas de acceso rápido
✅ Grilla de Programación con badge "En Vivo" automático
✅ Datos mock listos para conectar Google Sheets

⏳ CRUD Noticias          — siguiente
⏳ CRUD Programación      — siguiente
⏳ Conectar Google Sheets — esperando credenciales
⏳ Deploy en servidor     — esperando acceso al servidor