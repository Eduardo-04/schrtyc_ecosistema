# 🔍 ANÁLISIS COMPLETO DEL ECOSISTEMA SCHRTyC
> Última actualización: 17 Mayo 2026 — v2 (post-correcciones críticas)

---

## 📋 RESUMEN EJECUTIVO

El ecosistema está **operativo y sus 6 vulnerabilidades críticas ya fueron corregidas**. El siguiente paso es trabajar en las mejoras de seguridad adicionales y la deuda técnica restante para alcanzar un nivel de hardening de producción real.

**Leyenda de estado:**
- ✅ **Resuelto** — corregido y verificado en producción
- 🔴 **Crítico** — riesgo de seguridad inmediato
- 🟠 **Alto** — bug funcional o riesgo elevado
- 🟡 **Medio** — mejora de seguridad o estabilidad
- 🟢 **Bajo / Deuda técnica**

---

## 🏗️ ARQUITECTURA DEL PROYECTO

```
schrtyc_ecosistema/
├── .env                    ← Secretos locales (NO en git) ✅ creado
├── .env.example            ← Plantilla documentada ✅ mejorado
├── docker-compose.yml      ← Lee vars desde .env ✅ corregido
├── SCHRTyC/
│   ├── backend/            ← API Node.js/Express  → Puerto 3005
│   └── frontend/           ← CMS React/Vite/Tailwind → Puerto 3001
└── schrtyc-web/
    └── web/                ← Portal Público React/Vite → Puerto 3000
```

---

## ✅ VULNERABILIDADES CRÍTICAS — RESUELTAS

### ~~1. `JWT_SECRET` hardcodeado~~ ✅ RESUELTO
**Antes:** `JWT_SECRET=supersecret` en `docker-compose.yml`  
**Ahora:** Lee `${JWT_SECRET}` desde `.env`. El archivo `.env` está en `.gitignore`.

### ~~2. Credenciales de BD hardcodeadas~~ ✅ RESUELTO
**Antes:** `MYSQL_ROOT_PASSWORD: myrootpassword` y similares en texto plano  
**Ahora:** Todas leen de `${DB_ROOT_PASSWORD}`, `${DB_USER}`, `${DB_PASSWORD}` desde `.env`.

### ~~3. Upload de archivos sin autenticación~~ ✅ RESUELTO
**Antes:** `POST /api/archivero/upload` sin middleware. Cualquiera podía subir archivos.  
**Ahora:** `verificarToken` restaurado. Responde `401` sin token válido.

### ~~4. CORS abierto a todos los orígenes~~ ✅ RESUELTO
**Antes:** `origin: true` aceptaba cualquier dominio con credenciales.  
**Ahora:** Whitelist dinámica: en `development` permite todo; en `production` solo dominios en `CORS_ORIGIN`.

### ~~5. `helmet` importado pero no aplicado~~ ✅ RESUELTO
**Antes:** `require('helmet')` pero nunca `app.use(helmet())`.  
**Ahora:** `app.use(helmet())` activo — cabeceras `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.

### ~~6. Cookie `secure: false` fija~~ ✅ RESUELTO
**Antes:** La cookie de refresh token viajaba sin cifrar en HTTP.  
**Ahora:** `secure: process.env.NODE_ENV === 'production'` — automático.

### Extra añadido en la corrección ✅
- **`healthcheck`** en servicio `db` del compose → la API espera a que MariaDB esté lista antes de arrancar (`depends_on: condition: service_healthy`)
- **`.env.example`** completamente reescrito con instrucciones para generar secretos con `crypto`

---

## 🛡️ SEGURIDAD ADICIONAL — RECOMENDACIONES

### CATEGORÍA A: API / BACKEND (Node.js)

---

#### A-1. 🟠 Rate limiter de login demasiado permisivo (100 intentos)
**Archivo:** `backend/src/app.js` línea 59

```js
max: 100, // 100 intentos en 15 min → permite ataques de diccionario
```
**Riesgo:** Con 100 intentos en 15 minutos es suficiente para ataques de fuerza bruta contra contraseñas de 4-6 caracteres.  
**Solución:**
```js
// Login: 10 intentos por IP cada 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // No contar logins exitosos
  message: { ok: false, message: 'Demasiados intentos. Espera 15 minutos.' }
})
// Rate limit general para toda la API (anti-scraping)
const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 300 })
app.use('/api/', generalLimiter)
```

---

#### A-2. 🟠 Sin límite de tamaño en peticiones JSON
**Archivo:** `backend/src/app.js` línea 51

```js
app.use(express.json()) // ← Sin límite → vulnerable a JSON bomb
```
**Riesgo:** Un atacante puede enviar un body JSON de varios MB para saturar el proceso Node.  
**Solución:**
```js
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
```

---

#### A-3. 🟠 Sin validación de complejidad de contraseña
**Archivo:** `backend/src/routes/usuarios.js` línea 24

```js
if (!nombre || !email || !password || !rol) // ← Solo verifica que no esté vacío
```
**Riesgo:** Un admin puede crear usuarios con contraseña `"1"` o `"abc"`.  
**Solución:** Agregar validación antes del hash:
```js
if (password.length < 8)
  return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 8 caracteres' })
if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
  return res.status(400).json({ ok: false, message: 'Debe contener al menos una mayúscula y un número' })
```

---

#### A-4. 🟠 `DELETE /api/programacion` sin restricción puede borrar TODA la BD
**Archivo:** `backend/src/routes/programacion.js` líneas 102–120

```js
router.delete('/', async (req, res) => {
  const { estacion } = req.query
  let query = 'DELETE FROM programacion' // Sin WHERE si no hay estacion
```
**Riesgo:** `DELETE /api/programacion` sin parámetros borra todos los registros.  
**Solución:**
```js
router.delete('/', async (req, res) => {
  const { estacion } = req.query
  if (!estacion)
    return res.status(400).json({ ok: false, message: 'El parámetro estacion es requerido para borrar programación' })
  // ...
})
```

---

#### A-5. 🟡 Sin auditoría de acciones administrativas
**Riesgo:** No hay registro de quién borró qué, cuándo se modificó una noticia, o quién creó un usuario. Si hay un incidente no hay forma de rastrearlo.  
**Solución:** Agregar una tabla `auditoria` y middleware que registre operaciones mutantes (POST, PUT, DELETE) con: `usuario_id`, `accion`, `recurso`, `ip`, `timestamp`.

---

#### A-6. 🟡 Sin blacklist de JWT — tokens robados no pueden invalidarse
**Riesgo:** Si el `refreshToken` de un admin es robado, sigue siendo válido 7 días. No hay mecanismo para revocar un token específico.  
**Solución básica:** Guardar en BD una tabla `token_revocados (jti, exp)` y verificar en cada refresh. O almacenar el refresh token hasheado en la tabla `usuarios` y compararlo.

---

#### A-7. 🟡 `endpoint /api` expone la lista de todos los endpoints internos
**Archivo:** `backend/src/app.js` líneas 64–81

```js
app.get('/api', (req, res) => {
  res.json({ endpoints: ['/api/auth', '/api/noticias', ...] }) // Mapa del sistema
})
```
**Riesgo:** Facilita el reconnaissance (reconocimiento) a atacantes.  
**Solución:** En producción, eliminar o proteger este endpoint:
```js
if (process.env.NODE_ENV !== 'production') {
  app.get('/api', (req, res) => res.json({ endpoints: [...] }))
}
```

---

#### A-8. 🟡 Logs de debug con datos sensibles en producción
**Archivos:** `routes/noticias.js:78`, `routes/archivero.js:88-101`

```js
console.log(`[UPDATE NOTICIA] id: ${id}, body:`, req.body) // Expone contenido
console.log('--- Nueva petición de subida ---')
```
**Solución:** Implementar un logger condicional:
```js
// utils/logger.js
const log = process.env.NODE_ENV !== 'production' ? console.log : () => {}
```

---

#### A-9. 🟡 Tipo de archivo en upload verificado solo por MIME (falseable)
**Archivo:** `backend/src/routes/archivero.js` línea 78

```js
if (file.mimetype.startsWith('image/') || allowedMimeTypes.includes(file.mimetype))
```
**Riesgo:** El MIME type lo envía el cliente — puede manipularse. Un SVG con scripts maliciosos puede pasar como `image/svg+xml`.  
**Solución:** Verificar el magic number (primeros bytes del archivo) con la librería `file-type`. También excluir explícitamente SVG de las subidas si no se necesita.

---

#### A-10. 🟢 Respuestas de error demasiado verbosas en producción
**Archivo:** `backend/src/routes/configuracion.js` línea 25

```js
res.status(500).json({ ok: false, message: err.message }) // Expone stack/mensaje interno
```
**Solución:** Abstraer errores en producción:
```js
const mensaje = process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message
res.status(500).json({ ok: false, message: mensaje })
```

---

### CATEGORÍA B: DOCKER / INFRAESTRUCTURA

---

#### B-1. 🟠 Contenedor API corre como `root`
**Archivo:** `SCHRTyC/backend/Dockerfile`

```dockerfile
FROM node:20-alpine
# No hay USER → corre como root dentro del contenedor
```
**Riesgo:** Si hay una vulnerabilidad de escape del contenedor, el atacante tiene privilegios root.  
**Solución:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev    # ← Solo dependencias de producción
COPY . .
RUN mkdir -p uploads && chown -R node:node /app
USER node                # ← Corre como usuario no-privilegiado
EXPOSE 3001
CMD ["node", "src/app.js"]
```

---

#### B-2. 🟠 `npm install` en Docker instala devDependencies
**Archivo:** `SCHRTyC/backend/Dockerfile` línea 4

```dockerfile
RUN npm install   # Instala nodemon y devDeps en producción
```
**Riesgo:** Imagen ~40% más grande, superficie de ataque mayor.  
**Solución:** `RUN npm ci --omit=dev`

---

#### B-3. 🟠 Adminer expuesto en producción sin protección extra
**Archivo:** `docker-compose.yml` líneas finales

```yaml
adminer:
  ports:
    - "8080:8080"  # Puerto público en producción
```
**Riesgo:** La interfaz web de la BD está accesible desde internet, protegida solo por las credenciales de MariaDB.  
**Solución para producción:** Usar un perfil Docker para que Adminer solo arranque en desarrollo:
```yaml
adminer:
  profiles: ["dev"]  # Solo arranca con: docker-compose --profile dev up
```

---

#### B-4. 🟡 Sin límites de recursos (CPU/RAM) en los contenedores
**Riesgo:** Un ataque DoS o un leak de memoria puede tumbar el servidor host entero.  
**Solución:**
```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 512M
      reservations:
        memory: 128M
```

---

#### B-5. 🟡 Sin política de reinicio inteligente ni límite de reinicios
**Archivo:** `docker-compose.yml`

```yaml
restart: unless-stopped  # Reinicia infinitamente aunque el error sea permanente
```
**Solución:**
```yaml
restart: on-failure
  max_attempts: 5  # Detiene el loop de crash-restart-crash
```

---

#### B-6. 🟢 Sin estrategia de backup de `mysql_data`
**Riesgo:** Si el directorio `mysql_data/` se corrompe o borra, se pierde toda la BD.  
**Solución:** Script de backup automatizado:
```bash
# cron diario: backup de la BD
docker exec schrtyc_ecosistema-db-1 \
  mysqldump -u appuser -p$DB_PASSWORD schrtyc_db | gzip > backups/$(date +%Y%m%d).sql.gz
```

---

### CATEGORÍA C: NGINX (Frontends)

---

#### C-1. 🟠 Sin Content Security Policy (CSP) en nginx
**Archivo:** `SCHRTyC/frontend/nginx.conf` y `schrtyc-web/web/nginx.conf`

```nginx
# No hay add_header Content-Security-Policy
```
**Riesgo:** Sin CSP, si hay una vulnerabilidad XSS puede ejecutarse cualquier script externo.  
**Solución para el CMS admin:**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: *.youtube.com; frame-src *.youtube.com *.facebook.com *.spotify.com;";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

---

#### C-2. 🟡 Anti-cache total en el CMS bloquea compresión eficiente
**Archivo:** `SCHRTyC/frontend/nginx.conf` líneas 8–12

```nginx
add_header Cache-Control "no-store, no-cache, must-revalidate...";
```
**Problema:** Impide que los assets estáticos (JS, CSS, imágenes) sean cacheados por el navegador → cada visita descarga todo de nuevo.  
**Solución:** Cache agresivo para assets versionados por Vite (`/assets/*`), sin cache solo para `index.html`:
```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
location / {
    add_header Cache-Control "no-cache";
    try_files $uri $uri/ /index.html;
}
```

---

### CATEGORÍA D: FRONTEND / CMS

---

#### D-1. 🟠 CMS no tiene auto-refresh de token — sesión expira en silencio
**Archivo:** `SCHRTyC/frontend/src/services/api.js`

**Riesgo:** El access token dura 15 minutos. Cuando expira, el admin ve errores sin entender por qué. El campo `code: 'TOKEN_EXPIRED'` nunca se usa para hacer refresh automático.  
**Solución:** Interceptor en la función `request()`:
```js
const request = async (endpoint, options = {}, _retry = false) => {
  try {
    // ... petición normal
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED' && !_retry) {
      const nuevoToken = await authRefresh()
      if (nuevoToken) {
        setAccessToken(nuevoToken.token)
        return request(endpoint, options, true) // reintento con nuevo token
      }
    }
    throw error
  }
}
```

---

#### D-2. 🟡 Sin timeout de sesión ni advertencia al usuario
**Riesgo:** Un admin que deja el CMS abierto en su PC puede dejar la sesión activa indefinidamente (el refresh token dura 7 días).  
**Solución:** Agregar un contador de inactividad en `AuthContext` que haga logout automático después de, por ejemplo, 2 horas sin interacción.

---

#### D-3. 🟡 Formulario de nuevo usuario en CMS no valida contraseña mínima
**Archivo:** `SCHRTyC/frontend/src/components/admin/GestionUsuarios.jsx`

El formulario solo verifica que el campo no esté vacío (`required`). No hay validación de longitud o complejidad en el cliente.  
**Solución:** Agregar validación en `handleSubmit` antes de enviar:
```js
if (modal.mode === 'create' && data.password.length < 8) {
  alert('La contraseña debe tener al menos 8 caracteres')
  return
}
```

---

### CATEGORÍA E: CÓDIGO / DEUDA TÉCNICA

---

#### E-1. 🟠 Código de prueba `registros` expuesto en producción sin autenticación
**Archivos:** `routes/registros.js`, `controllers/registrosController.js`, `db.js:20-28`, `app.js:18,92`

```js
app.use('/api/registros', registrosRoutes) // Prueba MariaDB — sin auth
```
**Solución:** Eliminar todo este código. No tiene utilidad en el sistema final.

---

#### E-2. 🟠 Estaciones de radio en la homepage no vienen de la API
**Archivo:** `schrtyc-web/web/src/pages/PaginaInicio.jsx` líneas 9–23

```js
const ESTACIONES_FIJAS = [ // 8 estaciones hardcodeadas, ignoran el CMS
```
**Solución:** Usar el estado `estaciones` que ya se carga de la API (línea 87-88) para renderizar las tarjetas.

---

#### E-3. 🟠 Imágenes de estaciones desde `picsum.photos` (servicio externo)
**Archivo:** `schrtyc-web/web/src/pages/PaginaInicio.jsx` línea 54

```js
const bg = `https://picsum.photos/seed/${SEEDS[est.id] || est.id}/400/220`
```
**Solución:** Usar `getUploadUrl(est.imagen)` con un placeholder local como fallback.

---

#### E-4. 🟡 Inconsistencia en formato de respuesta de la API (galería)
**Archivo:** `backend/src/routes/galeria.js` línea 10

```js
res.json(rows)  // Array directo — sin wrapper { ok, data }
// Todos los demás: res.json({ ok: true, data: rows })
```

---

#### E-5. 🟡 `googleapis` instalado pero sin usar (~171MB extra)
**Archivo:** `backend/package.json` línea 21

```json
"googleapis": "^171.4.0"  // Nadie lo importa
```

---

#### E-6. 🟡 `PUT /api/usuarios/:id` query SQL con orden incorrecto al cambiar password
**Archivo:** `backend/src/routes/usuarios.js` líneas 47–55

```js
let query = 'UPDATE usuarios SET nombre=?, email=?, rol=?, activo=? '
if (password) query += ', password_hash=? ' // Genera: '... activo=? , password_hash=?'
```
El espacio antes de la coma es sintácticamente válido en MariaDB pero semánticamente confuso. Una query limpia evita bugs futuros.

---

#### E-7. 🟢 Sin tests unitarios ni de integración
No existe ningún directorio de tests. El único script en `package.json` retorna error por defecto.

---

#### E-8. 🟢 `package.json` raíz vacío — sin scripts para desarrollo local
**Archivo:** `SCHRTyC/package.json` (80 bytes)
Sin scripts como `npm run dev:backend`, `npm run dev:cms`, etc.

---

#### E-9. 🟢 Sin política documentada de rotación de secretos
No hay documentación sobre cada cuánto rotar `JWT_SECRET` ni procedimiento para hacerlo sin romper sesiones activas.

---

## 📊 RESUMEN DE ESTADO ACTUAL

| Categoría | Total | ✅ Resuelto | 🔴🟠 Pendiente urgente | 🟡🟢 Backlog |
|-----------|-------|-------------|----------------------|--------------|
| Seguridad crítica original | 6 | **6** | 0 | — |
| API/Backend | 10 | 0 | 4 (A1,A2,A3,A4) | 6 |
| Docker/Infra | 6 | 1 (healthcheck) | 3 (B1,B2,B3) | 3 |
| Nginx | 2 | 0 | 1 (C1) | 1 |
| Frontend/CMS | 3 | 0 | 1 (D1) | 2 |
| Código/Deuda | 9 | 0 | 3 (E1,E2,E3) | 6 |
| **TOTAL** | **36** | **7** | **12** | **18** |

---

## 🎯 PLAN DE ACCIÓN PRIORIZADO

### 🔥 Fase 1 — Hardening inmediato (Alta prioridad)
- [ ] **A-1** Reducir rate limiter de auth a 10 intentos + agregar limiter general
- [ ] **A-2** Agregar límite de 2MB a `express.json()`
- [ ] **A-3** Validación de complejidad de contraseña en backend y CMS
- [ ] **A-4** Hacer obligatorio el parámetro `estacion` en `DELETE /programacion`
- [ ] **B-1** Cambiar Dockerfile a usuario no-root + `npm ci --omit=dev`
- [ ] **B-3** Perfilar Adminer para que solo arranque en dev
- [ ] **C-1** Agregar cabeceras CSP y seguridad en nginx de ambos frontends
- [ ] **E-1** Eliminar código de prueba `registros` completamente

### ⚙️ Fase 2 — Estabilidad y UX (Media prioridad)
- [ ] **D-1** Auto-refresh de token en el CMS (interceptor de `TOKEN_EXPIRED`)
- [ ] **A-7** Ocultar lista de endpoints en producción
- [ ] **A-8** Logger condicional para eliminar `console.log` de producción
- [ ] **E-2** Conectar tarjetas de radio del inicio a la API real
- [ ] **E-3** Reemplazar `picsum.photos` con placeholder local
- [ ] **B-4** Agregar límites de CPU/RAM en docker-compose

### 🔧 Fase 3 — Mejoras avanzadas (Backlog)
- [ ] **A-5** Sistema de auditoría de acciones administrativas
- [ ] **A-6** Blacklist de refresh tokens (revocación)
- [ ] **A-9** Verificar magic number de archivos subidos
- [ ] **D-2** Timeout de sesión por inactividad
- [ ] **B-6** Script de backup automático de la BD
- [ ] **E-4** Normalizar formato de respuesta en todos los endpoints
- [ ] **E-5** Eliminar `googleapis` del `package.json`
- [ ] **E-7** Agregar tests básicos (al menos para auth y rutas críticas)

---

## ✅ LO QUE ESTÁ BIEN (No tocar)

- ✅ RBAC (Roles) bien implementado en middleware y CMS
- ✅ Access tokens cortos (15min) + refresh tokens (7d) con httpOnly cookie
- ✅ Seeding automático de BD funcional y robusto
- ✅ Pool de conexiones MySQL2 correctamente configurado
- ✅ Queries 100% parametrizadas (no hay SQL injection posible)
- ✅ Dockerfiles multi-stage para frontends (build → nginx)
- ✅ `getUploadUrl` centralizado y consistente en casi todas las páginas
- ✅ Lazy loading de páginas en React (buen performance inicial)
- ✅ CMS protege secciones por rol en backend Y frontend
- ✅ Gestión completa de usuarios con 4 roles desde el CMS
- ✅ Manejo defensivo de `imagenes` en noticias (array, JSON string, newlines)
- ✅ Healthcheck en BD + `depends_on: condition: service_healthy`
