Actúa como Senior Full Stack Developer. Estoy desarrollando el sistema web 
"SCHRTyC" (Sistema Chiapaneco de Radio, Televisión y Cinematografía) 
para el Gobierno de Chiapas.

## Stack actual (ya instalado y funcionando):
- Frontend: React + Vite + Tailwind CSS v4 (con plugin @tailwindcss/vite)
- Backend: Node.js + Express
- Iconos: lucide-react
- Ubicación del proyecto: D:\schrtyc\

## Estructura de archivos:
schrtyc/
├── backend/
│   ├── src/
│   │   ├── routes/        → programacion.js, noticias.js, estaciones.js
│   │   ├── services/      → sheetsService.js (conector Google Sheets)
│   │   ├── middleware/    → auth.js (JWT)
│   │   └── app.js
│   └── .env               → PORT=3001
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/     → Sidebar, Header, Dashboard, GrillaProgramacion
    │   │   ├── public/    → LandingPage, StickyPlayer, ProgramacionDia
    │   │   └── shared/    → BadgeEnVivo, LoadingSpinner
    │   ├── services/      → api.js (BASE_URL: http://localhost:3001/api)
    │   ├── hooks/         → useProgramacion.js (custom hook con auto-refresh 5min)
    │   └── App.jsx        → Router entre secciones con estado local
    └── vite.config.js

## Paleta de colores institucional:
- Guinda: #611232
- Dorado: #A57F2C
- Fondo: #f8f9fa

## Lo que ya funciona:
✅ Backend Express corriendo en localhost:3001
✅ Endpoints: GET /api/programacion, /api/noticias, /api/estaciones
✅ Frontend en localhost:5173
✅ Sidebar, Header, Dashboard con tarjetas
✅ GrillaProgramacion con badge "En Vivo" automático
✅ Datos mock en backend (listos para conectar Google Sheets)
✅ useProgramacion hook con filtros por tipo y estación

## Estructura de datos (Array de objetos del backend):
{
  hora_inicio: '06:00',
  hora_fin:    '07:00',
  nombre:      'Amanecer Chiapaneco',
  conductor:   'Nombre del conductor',
  estacion:    'Canal 10 TV',
  descripcion: 'Descripción del programa',
  tipo:        'TV' | 'Radio'
}

## Pendiente por desarrollar:
1. LandingPage.jsx — Página pública con hero institucional
2. StickyPlayer.jsx — Reproductor de audio persistente (sticky bottom)
3. ProgramacionDia.jsx — Grilla pública que consume /api/programacion
4. Login con JWT — Proteger rutas /admin
5. Conectar Google Sheets real via Service Account
6. CRUD de Noticias

## Convenciones del proyecto:
- Tailwind v4: usar @import "tailwindcss" en index.css
- Colores con hex directo: bg-[#611232], text-[#A57F2C]
- Custom hook useProgramacion acepta filtros: { tipo, estacion }
- Backend usa MOCK_DATA con fallback si Sheets falla
- PowerShell en Windows — NO usar && para encadenar comandos
## Propósito del Proyecto
Este repositorio es el SISTEMA DE ADMINISTRACIÓN (CMS) interno del SCHRTyC.
NO es el sitio público. El sitio público es:
→ http://radiotvycine.chiapas.gob.mx/

## Conexión futura:
Cuando se tenga acceso al servidor de radiotvycine.chiapas.gob.mx,
el sitio público consumirá esta API en:
→ VITE_API_URL=https://api.radiotvycine.chiapas.gob.mx

## Endpoints disponibles:
GET /api/programacion  → Grilla de programación (Radio y TV)
GET /api/noticias      → Noticias institucionales
GET /api/estaciones    → Estaciones activas con streamUrl

## Estado actual:
✅ Backend Express corriendo en localhost:3001
✅ Panel Admin en localhost:5173
✅ Datos mock listos para conectar Google Sheets
⏳ Login JWT — pendiente
⏳ CRUD Noticias — pendiente
⏳ Conexión Google Sheets real — pendiente
⏳ Deploy en servidor — esperando acceso