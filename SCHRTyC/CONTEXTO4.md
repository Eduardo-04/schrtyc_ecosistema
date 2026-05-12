Aquí el contexto actualizado con los cambios de hoy:

***

# SCHRTyC — Sistema de Administración
Actúa como Senior Full Stack Developer. Estoy desarrollando el sistema web "SCHRTyC" (Sistema Chiapaneco de Radio, Televisión y Cinematografía) para el Gobierno de Chiapas.

## Propósito del Proyecto
Este repositorio es el SISTEMA DE ADMINISTRACIÓN (CMS) interno del SCHRTyC. NO es el sitio público. El sitio público es:
→ [http://radiotvycine.chiapas.gob.mx/](http://radiotvycine.chiapas.gob.mx/)

Cuando se tenga acceso al servidor, el sitio público consumirá esta API en:
→ VITE_API_URL=https://api.radiotvycine.chiapas.gob.mx

***

## Stack actual (funcionando):
- Frontend: React + Vite + Tailwind CSS v4 (@tailwindcss/vite)
- Backend: Node.js + Express
- Autenticación: JWT (jsonwebtoken)
- Iconos: lucide-react
- Ubicación: D:\schrtyc\

***

## Estructura de archivos:
```
schrtyc/
├── backend/
│   ├── src/
│   │   ├── routes/     → programacion.js, noticias.js, estaciones.js, auth.js, importar.js
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
```

***

## Paleta de colores institucional:
- Guinda: #611232 (principal)
- Dorado: #A57F2C (acento)
- Fondo: #f8f9fa
- Usar hex directo en estilos: bg-[#611232], o style={{ backgroundColor:'#611232' }}

***

## Endpoints del backend:
```
GET    /api/programacion              → filtros: ?tipo=TV|Radio&estacion=&dia=
POST   /api/programacion              → crear programa
PUT    /api/programacion/:id          → editar programa
DELETE /api/programacion/:id          → eliminar un programa
DELETE /api/programacion              → eliminar todos (o ?estacion= para filtrar)
GET    /api/noticias                  → Noticias institucionales
GET    /api/estaciones                → Estaciones activas con streamUrl
POST   /api/auth/login                → { email, password } → { ok, token, usuario }
POST   /api/auth/verificar            → Header: Authorization: Bearer TOKEN
POST   /api/importar/preview          → multipart: archivo+estacion → { total, muestra, programas }
POST   /api/importar/guardar          → multipart: archivo+estacion → { ok, insertados }
```

***

## Estructura de datos:

### Programa:
```json
{
  "id": 1,
  "hora_inicio": "06:00",
  "hora_fin": "07:00",
  "nombre": "Amanecer Chiapaneco",
  "conductor": "Nombre del conductor",
  "estacion": "Canal 10 TV",
  "descripcion": "Descripción del programa",
  "tipo": "TV | Radio",
  "dia": "Lunes | Martes | Miércoles | Jueves | Viernes | Sábado | Domingo"
}
```

### Noticia:
```json
{
  "id": 1,
  "titulo": "Título de la noticia",
  "fecha": "2026-03-24",
  "categoria": "Tecnología",
  "imagen": ""
}
```

### Usuario (JWT payload):
```json
{ "id": 1, "nombre": "Administrador", "rol": "admin | editor" }
```

***

## Estaciones registradas:
```
Canal 10 TV
Radio 1 - 92.5 FM
Radio 2 - 101.3 FM
Radio 3 - 101.3 FM
Radio 4 - 102.3 FM
```

***

## Credenciales de prueba:
- admin@schrtyc.gob.mx / admin2026 (rol: admin)
- editor@schrtyc.gob.mx / editor2026 (rol: editor)
- Token dura 8h — guardado en localStorage como `schrtyc_token`

***

## Convenciones del proyecto:
- Tailwind v4: @import "tailwindcss" en index.css (NO @tailwind base/components)
- Tailwind v4: usar clases canónicas — ej. `max-w-35` en lugar de `max-w-[140px]`, `max-w-37.5` en lugar de `max-w-[150px]`
- Estilos: usar `style={{}}` inline o hex directo en clases Tailwind
- PowerShell en Windows: NO usar `&&` para encadenar comandos
- Backend usa array en memoria (mock) con fallback si Google Sheets falla
- `programacion.js` exporta `module.exports.db` y `module.exports.nextId` para que `importar.js` pueda compartir el mismo array
- El hook `useProgramacion` tiene auto-refresh cada 5 minutos
- Filtro de estaciones en frontend es **fijo** (usa `ESTACIONES` constante), NO dinámico desde programas cargados — esto evita el bug de filtro vacío al borrar
- **`estaEnVivo(inicio, fin, dia)`** — siempre pasar el campo `p.dia` al llamar esta función. Valida hora Y día de la semana con `diaMap` para evitar falsos positivos en días incorrectos

***

## Formato Excel para importar programación:
- Fila 1: `HORARIO | LUNES | MARTES | MIÉRCOLES | JUEVES | VIERNES | SÁBADO | DOMINGO`
- Columna A: horario formato `05:00 - 06:00`
- Cada celda con el nombre del programa en su día correspondiente
- Si un programa es de todos los días, repetir en cada columna
- El parser acepta días en mayúsculas, minúsculas, con o sin tildes

***

## Estado actual:
```
✅ Backend Express corriendo en localhost:3001
✅ Frontend Admin en localhost:5173
✅ Login JWT funcional — token en localStorage, sesión de 8h
✅ Sidebar, Header con "Ver Sitio" → radiotvycine.chiapas.gob.mx
✅ Dashboard con tarjetas y stats dinámicas desde API:
   ✅ Conteo real de noticias, programas TV/Radio, total programación
   ✅ Sección "En vivo ahora" — valida hora Y día actual (bug corregido)
   ✅ Noticias recientes con badge publicada/borrador
   ✅ Estaciones con estado activa/inactiva en tiempo real
✅ Grilla de Programación completa:
   ✅ Tabla con columnas: Horario, Día, Programa, Conductor, Tipo, Estación, Acciones
   ✅ Badge "EN VIVO" automático — valida hora Y día actual (bug corregido)
   ✅ Filtros por Tipo, Estación y Día
   ✅ CRUD completo (crear, editar, eliminar individual)
   ✅ Importar desde Excel (.xlsx) con preview antes de guardar
   ✅ Botón "Limpiar todo" (con confirmación) — borra por estación o todo
   ✅ Parser Excel robusto: acepta múltiples formatos de horario y días
✅ Datos mock listos para conectar Google Sheets

⏳ CRUD Noticias          — siguiente paso recomendado
⏳ Conectar Google Sheets — esperando credenciales del cliente
⏳ Base de datos real (SQLite o MongoDB) — cuando confirmen infra
⏳ Deploy en servidor     — esperando acceso al servidor
⏳ Módulo Estaciones (CRUD) — pendiente
⏳ Roles y permisos granulares (admin vs editor) — pendiente
```

***

## Próximo paso recomendado: CRUD Noticias
Ya tienes el endpoint `GET /api/noticias` y la estructura de datos lista. El siguiente módulo sería construir la pantalla de gestión de noticias con: lista, crear, editar, eliminar, filtro por categoría, y subida de imagen. ¿Arrancamos?

***

Listo Eduardo, contexto actualizado. Los cambios que agregué respecto al tuyo:
- ✅ Convención nueva de **Tailwind v4** con clases canónicas
- ✅ Convención de **`estaEnVivo`** con el tercer parámetro `dia`
- ✅ Dashboard actualizado en estado actual con las mejoras de hoy
- ✅ Bug del EN VIVO documentado como corregido en ambos componentes