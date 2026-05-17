# CONTEXTO 8: Estado del Ecosistema SCHRTyC (Post-RBAC y Hardening)

Este documento resume los avances realizados en la sesión actual y establece los pasos pendientes para completar la transición a MariaDB, el sistema RBAC y la estabilidad del build.

## 1. Avances Realizados

### Backend: Seguridad y RBAC
- **Middleware `verificarRol`:** Se ha implementado el control de acceso basado en roles en las siguientes rutas críticas:
  - `noticias.js`: Protegido para `admin` y `editor_prensa`.
  - `paginas.js`: Protegido para `admin` e `editor_inst`.
  - `programacion.js`, `estaciones.js`, `programas.js`: Protegidos para `admin` y `editor_prog`.
  - `galeria.js`: Protegido para `admin` y `editor_prensa`.
  - `configuracion.js`: Solo accesible para el rol `admin`.
  - `usuarios.js`: Gestión completa de usuarios (CRUD) solo para `admin`.
  - `importar.js`: Funcionalidad de importación de Excel restringida a `admin`.

### Backend: Corrección de Importación
- Se corrigió el archivo `importar.js` que intentaba usar una base de datos JSON inexistente. Ahora utiliza `pool.query` para insertar los programas importados directamente en MariaDB.

### Frontend: Portabilidad de Datos (Media Paths)
- **Rutas Relativas:** Se ha modificado el flujo de carga y selección de archivos para almacenar rutas relativas (`/uploads/...`) en lugar de URLs absolutas. Esto asegura que la base de datos sea portable entre entornos (local, staging, producción).
  - Afectados: `api.js` (servicio `subirArchivo`) y `ArchiveroModal.jsx` (onSelect).

### Autenticación Hardened
- **Refresh Tokens:** Implementados mediante cookies `HttpOnly` y `Secure` (en producción).
- **Access Tokens:** Manejados exclusivamente en memoria dentro de React para prevenir ataques XSS.
- **Persistencia:** El sistema intenta un refresh silencioso al cargar la aplicación para mantener la sesión.

### Frontend: Estabilidad del Build (RESUELTO)
- **Corrección de Sintaxis:** Se movieron los imports a la parte superior en `GestionGaleria.jsx` para cumplir con ESM.
- **Corrección de Iconos:** Se arreglaron aliases de `lucide-react` incorrectos (`ImageIcon` -> `Image as ImageIcon`) que rompían el motor `rolldown`.
- **Compatibilidad:** El proceso `npm run build` ahora completa con éxito en Vite 8 con Tailwind CSS activado.

## 2. Diagnóstico del Error de Build (Resuelto)
- El error `UNRESOLVED_ENTRY` era causado por:
  1. Imports a mitad de archivo en componentes JSX.
  2. Uso de iconos inexistentes en `lucide-react` (se usaba `ImageIcon` sin el alias `Image as ImageIcon`).
  3. Exportaciones e importaciones de API con nombres inconsistentes (`getProgramas` vs `fetchProgramas`).
- **Estado Actual:** Build exitoso en 1.1s.

## 3. Pendientes Críticos (Siguiente Sesión)

### Verificación de Funcionalidad (Prioridad 1)
- [ ] Probar la creación de un usuario con rol limitado (ej. `editor_prensa`) y verificar que NO pueda acceder a Programación o Configuración.
- [ ] Verificar que la importación de Excel realmente inserte en la tabla de MariaDB correctamente.

### Archivos Creados/Modificados en esta sesión
- `backend/src/routes/usuarios.js` [NUEVO]
- `frontend/src/components/admin/GestionUsuarios.jsx` [NUEVO]
- `frontend/src/context/AuthContext.jsx` [MODIFICADO]
- `backend/src/routes/auth.js` [MODIFICADO]
- `backend/src/db.js` [MODIFICADO - Inicialización de Admin]

---
*Fin del Contexto 8*
