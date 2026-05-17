# CONTEXTO5 — Análisis de Calidad: SCHRTyC + schrtyc-web
**Generado:** 2026-05-10  
**Proyectos analizados:**
- `D:\SISTEMA\SCHRTyC\` → Gestor de Contenido (CMS) = Backend Node/Express + Frontend Admin React
- `D:\SISTEMA\schrtyc-web\web\` → Landing page pública = Frontend React (consume la misma API)

---

## 1. ESTADO GENERAL DEL ECOSISTEMA

```
SCHRTyC/                     ← Monorepo del CMS
├── backend/                 ← Node.js + Express (puerto 3001)
│   ├── src/
│   │   ├── app.js           ← Entry point, CORS solo localhost
│   │   ├── routes/          ← 8 rutas (auth, noticias, galeria, paginas,
│   │   │                        programacion, programas, estaciones, importar)
│   │   ├── middleware/      ← auth.js (JWT verificarToken)
│   │   ├── services/        ← sheetsService.js (Google Sheets, sin usar aún)
│   │   └── data/            ← JSON "base de datos" (galeria_db, noticias_db,
│   │                            paginas_db, galeria_filtros)
│   └── .env                 ← PORT, JWT_SECRET, GOOGLE_KEY_FILE, SHEETS_ID
│
└── frontend/                ← React + Vite + Tailwind v4 (puerto 5173)
    └── src/
        ├── components/admin/ ← 12 módulos del CMS
        └── services/api.js   ← Fetch wrapper centralizado

schrtyc-web/web/             ← Landing pública
└── src/
    ├── pages/               ← 11 páginas
    ├── components/layout/   ← Header + Footer
    └── services/api.js      ← Fetch wrapper (consume mismo backend)
```

---

## 2. SEGURIDAD 🔴 CRÍTICO

### 2.1 Credenciales hardcodeadas en código fuente

**Archivo:** `backend/src/routes/auth.js` — líneas 6–9
```js
const USUARIOS = [
  { id:1, email:'admin@schrtyc.gob.mx', password:'admin2026', rol:'admin' },
  { id:2, email:'editor@schrtyc.gob.mx', password:'editor2026', rol:'editor' },
]
```
- Las contraseñas están en **texto plano** dentro del código. Si el repositorio
  se filtra o se sube a Git, las credenciales son públicas.
- No hay hashing (bcrypt/argon2). La comparación es `u.password === password`.
- **Impacto:** Acceso total al CMS con credenciales expuestas.
- **Fix temporal (mientras no haya BD):** Mover a variables de entorno + bcrypt.
  ```js
  // .env
  ADMIN_EMAIL=admin@schrtyc.gob.mx
  ADMIN_HASH=$2b$10$xxxhashbcryptxxx
  ```

### 2.2 JWT Secret débil

**Archivo:** `backend/.env`
```
JWT_SECRET=schrtyc_secret_2026
```
- El secret es corto, predecible y descriptivo. Si alguien lo conoce puede
  forjar tokens válidos.
- **Fix:** Generar un secret de al menos 64 caracteres aleatorios:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### 2.3 Rutas de escritura sin autenticación

Varios endpoints de mutación NO requieren `verificarToken`:

| Ruta                     | Método | ¿Protegida? |
|--------------------------|--------|------------|
| POST /api/noticias       | POST   | ❌ No      |
| PUT /api/noticias/:id    | PUT    | ❌ No      |
| DELETE /api/noticias/:id | DELETE | ❌ No      |
| POST /api/galeria        | POST   | ❌ No      |
| PUT /api/galeria/:id     | PUT    | ❌ No      |
| DELETE /api/galeria/:id  | DELETE | ❌ No      |
| PUT /api/paginas/:slug   | PUT    | ❌ No      |
| POST /api/importar/prev  | POST   | ❌ No      |
| POST /api/importar/save  | POST   | ❌ No      |
| DELETE /api/programacion | DELETE | ❌ No      |

Sí están protegidas: POST/PUT/DELETE de estaciones y programas (catálogo).
El patrón es inconsistente — una decisión de diseño a regularizar.

- **Fix inmediato:** Añadir `verificarToken` como middleware a todas las
  rutas de escritura. Solo 1 línea por ruta.

### 2.4 CORS demasiado permisivo para producción

**Archivo:** `backend/src/app.js` — líneas 17–24
```js
origin: ['http://localhost:5173', 'http://localhost:5174']
```
- Actualmente solo permite localhost (correcto para dev).
- Cuando se despliegue, hay que actualizar con los dominios reales.
- No hay manejo de métodos OPTIONS (preflight) con `cors({ preflightContinue: false })`
  aunque Express/cors lo maneja por defecto.

### 2.5 Sin rate limiting

No hay protección contra fuerza bruta en `/api/auth/login`. Un atacante puede
intentar millones de combinaciones.
- **Fix:** Añadir `express-rate-limit` al endpoint de login.

### 2.6 Sin helmet.js

No se usan headers de seguridad HTTP (CSP, X-Frame-Options, etc).
- **Fix:** `npm install helmet` + `app.use(helmet())` en `app.js`.

### 2.7 Validación de entrada insuficiente

- `noticias.js`: Solo valida `titulo` y `categoria`. El campo `...req.body`
  se copia sin sanitizar — riesgo de inyección de campos no esperados.
- `galeria.js`: El campo `imagen` acepta cualquier URL sin validar que sea
  una URL válida o un dominio confiable.
- No hay sanitización de HTML en campos de texto largo (contenido de noticias,
  descripción de páginas). Si se renderiza con `dangerouslySetInnerHTML` en
  el frontend, hay riesgo XSS.

---

## 3. PERSISTENCIA DE DATOS 🟠 LIMITANTE PRINCIPAL

### 3.1 Modelo mixto: memoria RAM + archivos JSON

El proyecto usa **tres estrategias de almacenamiento distintas**, lo cual es
inconsistente y tiene implicaciones graves en producción:

| Módulo        | Almacenamiento  | Persiste al reiniciar |
|---------------|-----------------|----------------------|
| Noticias      | JSON en disco   | ✅ Sí               |
| Galería       | JSON en disco   | ✅ Sí               |
| Páginas       | JSON en disco   | ✅ Sí               |
| Programación  | Array en memoria| ❌ NO               |
| Programas     | Array en memoria| ❌ NO               |
| Estaciones    | Array en memoria| ❌ NO               |

**Problema crítico:** Si el servidor se reinicia (deployment, caída de luz,
actualización de Node), toda la programación, programas y estaciones
se pierden y vuelven a los datos de ejemplo hardcodeados.

### 3.2 JSON como base de datos es un antipatrón para producción

- Las operaciones de escritura son síncronas (`fs.writeFileSync`) — bloquean
  el event loop de Node.js con cada write.
- No hay transacciones: si el proceso muere a mitad de una escritura, el JSON
  puede corromperse.
- No hay concurrencia segura: dos requests simultáneos pueden sobrescribirse.
- No hay índices: buscar noticias por categoría es O(n) cada vez.

### 3.3 Plan de migración cuando llegue el servidor

Cuando den acceso al servidor del SCHRTyC, la arquitectura recomendada es:

**Opción A (Simple, recomendada para arrancar):**
```
SQLite3 + better-sqlite3
```
- Sin servidor de BD separado
- Persiste en un solo archivo `.db`
- Soporta transacciones y es síncrono (pero no bloquea como JSON)
- Migración: 1-2 días de trabajo

**Opción B (Escalable, si hay infraestructura):**
```
PostgreSQL + pg (driver nativo)
```
- Si el servidor ya tiene Postgres instalado
- Permite múltiples conexiones, backups automáticos, roles
- Migración: 3-5 días de trabajo

---

## 4. RENDIMIENTO 🟡 MEJORABLE

### 4.1 Lectura de JSON en cada request (backend)

En noticias.js, galeria.js y paginas.js, cada petición GET hace:
1. `fs.existsSync()` → syscall
2. `fs.readFileSync()` → I/O bloqueante
3. `JSON.parse()` → CPU

Con tráfico alto (ej. la landing pública consumiendo noticias), esto degrada.

**Fix:** Cache en memoria con TTL corto:
```js
let cache = null; let cacheTs = 0;
const leerDB = () => {
  if (cache && Date.now() - cacheTs < 5000) return cache;
  cache = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  cacheTs = Date.now();
  return cache;
};
```

### 4.2 Array en memoria sin paginación

`/api/noticias` devuelve TODAS las noticias sin límite. Lo mismo con galería.
La landing pública también pide TODO sin paginación.

**Fix:** Añadir `?limit=20&offset=0` en los endpoints y en el frontend
consumirlos con paginación o "cargar más".

### 4.3 Imágenes externas de Unsplash como placeholders

`paginas.js` tiene decenas de URLs de Unsplash hardcodeadas como datos
iniciales. En producción:
- Unsplash puede cambiar o eliminar las URLs
- Genera dependencia externa para contenido institucional
- No hay optimización de imágenes (WebP, lazy loading)

### 4.4 CSS como string JSX en la landing

`PaginaInicio.jsx`, `PaginaRadio.jsx`, etc. insertan hojas de estilo completas
como template strings en el DOM con `<style>{CSS}</style>`. Esto:
- Re-inyecta el CSS en cada render
- No es tree-shakeable ni cacheable por el navegador
- Duplica estilos si el componente se monta varias veces

**Fix:** Mover los estilos a archivos `.css` o usar módulos CSS.

### 4.5 Imports masivos en páginas grandes

`PaginaRadio.jsx` pesa **55 KB** y `PaginaCanal10.jsx` pesa **32 KB**.
No hay code splitting ni lazy loading de páginas.

**Fix en schrtyc-web:**
```js
// App.jsx — lazy loading
const PaginaRadio = lazy(() => import('./pages/PaginaRadio'))
```

### 4.6 Axis importado pero no usado (schrtyc-web)

`package.json` de schrtyc-web incluye `axios` como dependencia, pero
`services/api.js` usa `fetch` nativo. Axios añade ~30KB al bundle sin beneficio.

---

## 5. EFICIENCIA Y CALIDAD DE CÓDIGO 🟡

### 5.1 Duplicación de lógica entre proyectos

La función `estaEnVivo()` y el array de días de la semana están duplicados
en múltiples archivos:
- `frontend/src/services/api.js` línea 51 (array `DIAS`)
- `schrtyc-web/web/src/services/api.js` línea 3 (array `dias`, diferente capitalización)
- `schrtyc-web/web/src/pages/PaginaInicio.jsx` línea 8 (función `estaEnVivo`)
- `schrtyc-web/web/src/pages/PaginaRadio.jsx` (probablemente otra copia)

**Fix:** Crear un paquete compartido o una carpeta `shared/utils.js` con
funciones reutilizables.

### 5.2 Inconsistencia en la API: respuestas con formatos distintos

Los endpoints no tienen formato consistente:
- `/api/noticias` → `{ ok, data: [] }`
- `/api/galeria` → `[]` (array directo, sin `ok`)
- `/api/galeria/filtros` → `[]` (array directo)
- `/api/paginas` → `{ cine: {}, transparencia: {} }` (objeto, sin `ok`)

El frontend en `schrtyc-web/web/src/services/api.js` maneja esto con
cadenas de `??`:
```js
return Array.isArray(data) ? data : data.noticias ?? data.data ?? []
```
Esto es frágil. Hay que estandarizar: **siempre** `{ ok, data, mensaje }`.

### 5.3 programacion.js expone internos del módulo

```js
module.exports.db     = programas   // ← expone el array mutable
module.exports.nextId = () => nextId++
```
`importar.js` accede directamente al array de programación para insertar.
Esto crea acoplamiento fuerte entre módulos. Cuando se migre a BD, habrá
que cambiar ambos archivos.

**Fix:** Exportar una función `insertarProgramas(lista)` en programacion.js
y llamarla desde importar.js.

### 5.4 No hay manejo de errores HTTP en el frontend (schrtyc-web)

```js
// services/api.js de schrtyc-web
const res = await fetch(`${BASE}/noticias`);
const data = await res.json();  // ← no verifica res.ok
```
Si el backend está caído, `res.json()` falla con un error no descriptivo.
El CMS (SCHRTyC/frontend) sí hace `if (!res.ok) throw new Error(...)`.

### 5.5 App.jsx del CMS no usa React Router

El CMS navega por `seccionActiva` con un `switch` y `useState`. Funciona,
pero:
- No hay URLs únicas por sección (no se puede hacer bookmark ni compartir link)
- El botón "atrás" del navegador no funciona dentro del CMS
- Cuando se despliegue en servidor con nginx, hay que configurar redirect
  especial

**Fix:** Migrar a `react-router-dom` con rutas como `/admin/noticias`,
`/admin/programacion`, etc.

### 5.6 Token JWT en localStorage (consideración de seguridad)

Guardar el JWT en `localStorage` lo expone a ataques XSS. La alternativa
segura es `httpOnly cookies`. Sin embargo, para un CMS gubernamental interno
con dominio propio, `localStorage` es aceptable si se implementan headers
`Content-Security-Policy` correctos.

---

## 6. ARQUITECTURA Y DOCKERIZACIÓN 🔵 PRÓXIMA FASE

### 6.1 Estado actual de despliegue

```
Desarrollo local:
  backend  → node src/app.js  (puerto 3001)
  frontend → vite dev         (puerto 5173)
  web      → vite dev         (puerto 5174 o similar)

Producción objetivo:
  ?? → Servidor del SCHRTyC (sin acceso aún)
```

### 6.2 Propuesta de Docker Compose (3 contenedores)

Basado en el análisis del servidor real (`server_analysis.md.resolved`), la
arquitectura objetivo es **3 contenedores** en un servidor físico Linux con Apache:

```
Servidor físico (187.217.208.18)
├── Docker Engine
│   ├── container: backend   → Node.js 20 (Express) en puerto 3001
│   ├── container: admin     → Nginx sirviendo build Vite del CMS
│   └── container: web       → Nginx sirviendo build Vite de la landing
└── Apache (host) → proxy reverso hacia los containers
```

```yaml
# docker-compose.yml (raíz D:\SISTEMA\SCHRTyC\)
version: '3.9'
services:

  backend:
    build: ./backend
    container_name: schrtyc-api
    environment:
      - PORT=3001
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
      - CORS_ORIGINS=${CORS_ORIGINS}
    volumes:
      - ./backend/data:/app/data       # persiste los JSON
      - ./backend/uploads:/app/uploads # persiste imágenes subidas
    restart: unless-stopped
    # NO exponer puerto al host directamente — Apache hace el proxy

  admin:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: schrtyc-admin
    # Sirve el build estático en puerto 8080 interno
    restart: unless-stopped

  web:
    build:
      context: ./schrtyc-web/web
      dockerfile: Dockerfile.prod
    container_name: schrtyc-web
    # Sirve el build estático en puerto 8081 interno
    restart: unless-stopped
```

**Dockerfile del backend:**
```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/app.js"]
```

**Dockerfile de frontends (admin y web — mismo patrón):**
```dockerfile
# frontend/Dockerfile.prod
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**nginx-spa.conf (para SPA React — evita 404 en rutas):**
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**Configuración de Apache (VirtualHost en el servidor host):**
```apache
# Apache actúa de proxy reverso hacia los contenedores Docker
# /etc/httpd/conf.d/schrtyc.conf (CentOS) o /etc/apache2/sites-available/ (Ubuntu)

<VirtualHost *:80>
  ServerName radiotvycine.chiapas.gob.mx

  # Landing pública
  ProxyPass        /       http://localhost:8081/
  ProxyPassReverse /       http://localhost:8081/

  # CMS Admin
  ProxyPass        /admin/ http://localhost:8080/
  ProxyPassReverse /admin/ http://localhost:8080/

  # API Backend
  ProxyPass        /api/   http://localhost:3001/api/
  ProxyPassReverse /api/   http://localhost:3001/api/

  # Módulos necesarios: mod_proxy, mod_proxy_http
</VirtualHost>
```

> **Nota:** Será necesario activar `mod_proxy` y `mod_proxy_http` en Apache
> (`a2enmod proxy proxy_http` en Ubuntu, o editar `httpd.conf` en CentOS).

### 6.3 Variables de entorno para producción

Crear un `.env.production` que NO se suba a Git:
```bash
# Backend
PORT=3001
JWT_SECRET=<64-chars-random-hex>
NODE_ENV=production
GOOGLE_KEY_FILE=/run/secrets/google-credentials.json
SHEETS_ID=<real-id-when-available>
CORS_ORIGINS=https://radiotvycine.chiapas.gob.mx,https://admin.radiotvycine.chiapas.gob.mx

# Frontend CMS
VITE_API_URL=https://api.radiotvycine.chiapas.gob.mx

# Landing Web
VITE_API_URL=https://api.radiotvycine.chiapas.gob.mx
```

---

## 7. DEUDA TÉCNICA CATALOGADA

### 🔴 CRÍTICO — Hacer antes de producción

| # | Problema | Archivo | Acción |
|---|----------|---------|--------|
| C1 | Passwords hardcodeadas en texto plano | `auth.js` | Mover a .env + bcrypt |
| C2 | JWT_SECRET débil | `.env` | Generar 64-char random |
| C3 | Rutas de escritura sin auth (9 endpoints) | Varios routes | Añadir `verificarToken` |
| C4 | Programación/Estaciones/Programas no persisten | `programacion.js`, `estaciones.js`, `programas.js` | Convertir a JSON o BD |

### 🟠 IMPORTANTE — Hacer antes de golpe de apertura

| # | Problema | Archivo | Acción |
|---|----------|---------|--------|
| I1 | Sin rate limiting en login | `app.js` | `express-rate-limit` |
| I2 | Sin helmet (headers de seguridad) | `app.js` | `helmet()` |
| I3 | Sin paginación en listados | Routes + Frontend | Query params `limit/offset` |
| I4 | Error handling ausente en schrtyc-web | `api.js` (web) | Verificar `res.ok` |
| I5 | CORS hardcodeado para localhost | `app.js` | Env variable `CORS_ORIGINS` |

### 🟡 MEJORA — Para versión 2.0

| # | Problema | Archivo | Acción |
|---|----------|---------|--------|
| M1 | CSS como JSX string en landing | `PaginaInicio.jsx` et al. | Mover a archivos `.css` |
| M2 | Axios instalado sin usar | `schrtyc-web/package.json` | Remover |
| M3 | App.jsx sin React Router | `frontend/src/App.jsx` | Migrar a `react-router-dom` |
| M4 | Lógica duplicada entre proyectos | Varios | Paquete shared |
| M5 | Respuestas API inconsistentes | Todos los routes | Estandarizar `{ok, data}` |
| M6 | Code splitting ausente | `schrtyc-web/App.jsx` | `React.lazy()` |
| M7 | Imágenes Unsplash como contenido real | `paginas.js` | Subir imágenes propias |

---

## 8. FORTALEZAS DEL PROYECTO ✅

- Paleta de colores institucional consistente (#611232 guinda, #A57F2C dorado)
- Módulo de importación Excel funcional con parser robusto
- Separación clara de responsabilidades: CMS vs. Landing pública
- API centralizada en `services/api.js` en ambos frontends
- Módulo `verificarToken` JWT implementado y funcional (aunque inconsistente)
- Google Sheets service ya preparado (esperando credenciales)
- Diseño visual premium en la landing pública con animaciones y glassmorphism
- `ScrollToTop` implementado en la web para navegación correcta
- Health check en `/api/health`

---

## 9. PRÓXIMOS PASOS RECOMENDADOS (ordenados por impacto)

1. **Hashear passwords** con bcrypt aunque sean mock (1h de trabajo)
2. **Añadir `verificarToken`** a todas las rutas de escritura (30min)
3. **Cambiar JWT_SECRET** a un valor generado aleatoriamente (5min)
4. **Persistir programación/estaciones/programas** en JSON en disco como
   noticias/galería/páginas (2-3h de trabajo, patrón ya existe)
5. **Añadir helmet + rate-limit** al backend (30min)
6. **Preparar Dockerfiles** para el momento del despliegue
7. **Conectar Google Sheets** cuando lleguen las credenciales
8. **Migrar a SQLite** cuando confirmen la infraestructura del servidor

---

## 10. DATOS CONOCIDOS DEL SERVIDOR DE PRODUCCIÓN

> Información extraída de `server_analysis.md.resolved` (análisis externo previo).

| Parámetro           | Valor conocido                              |
|---------------------|---------------------------------------------|
| **URL oficial**     | `radiotvycine.chiapas.gob.mx`              |
| **IP pública**      | `187.217.208.18`                           |
| **ISP**             | Uninet (Telmex / América Móvil)            |
| **Servidor web**    | **Apache** (ya instalado en el host)       |
| **Ubicación**       | Tapachula / Tuxtla Gutiérrez, Chiapas      |
| **SO probable**     | Linux (CentOS / Rocky Linux / RHEL)        |
| **Arquitectura**    | x86_64 (64 bits) — compatible con Docker   |

### Implicaciones para el despliegue

1. **Apache ya existe** → no hay que instalarlo. Solo configurar VirtualHost
   como proxy reverso hacia los contenedores Docker (ver sección 6.2).
2. **Linux x86_64** → Docker se instala sin problemas. No hay restricciones
   de arquitectura (a diferencia de ARM o 32-bit).
3. **Uninet empresarial** → ancho de banda y latencia mejores que hosting
   compartido. El servidor aguanta carga de un portal gubernamental normal.
4. **CentOS/Rocky Linux probable** → usar `yum` / `dnf` para instalar Docker:
   ```bash
   sudo dnf install -y docker-ce docker-ce-cli containerd.io
   sudo systemctl enable --now docker
   ```

### Pendientes de confirmar con TI del SCHRTyC

- [ ] Versión exacta del kernel Linux (`uname -r`) — para verificar compat. Docker
- [ ] RAM y CPU disponibles en el servidor (`free -h`, `nproc`)
- [ ] ¿Tienen MySQL ya instalado? (común en gobierno) → afecta elección de BD
- [ ] ¿Hay certificado SSL vigente? → si no, configurar Let's Encrypt con Certbot
- [ ] ¿Google Cloud Console disponible para credenciales de Sheets?
- [ ] Puerto 443 habilitado en el firewall (HTTPS)
- [ ] Acceso SSH al servidor (usuario, método: clave o password)

---

*Este documento es complementario a CONTEXTO4.md y supersede las notas
de estado marcadas como "pendiente" en ese archivo.*
*Fuentes: análisis de código fuente completo + `server_analysis.md.resolved`.*
