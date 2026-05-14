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

## 2. Diagnóstico del Error de Build
- El error de compilación (`UNRESOLVED_ENTRY` / `rolldown`) persiste.
- **Hallazgo Crítico:** Se detectó un import a mitad de archivo en `GestionGaleria.jsx` (línea 14). Los imports en ESM deben estar en el nivel superior. Es muy probable que este tipo de sintaxis esté rompiendo el nuevo motor de compilación `rolldown` de Vite 8.

## 3. Pendientes Críticos (Siguiente Sesión)

### Estabilidad del Build (Prioridad 1)
- [ ] Mover todos los imports a la parte superior en `GestionGaleria.jsx` y revisar otros componentes (`GestionPaginas.jsx`, `GestionUsuarios.jsx`) por patrones similares.
- [ ] Restaurar el plugin de Tailwind CSS en `vite.config.js` una vez que el build base funcione.
- [ ] Limpiar archivos temporales de debug (`debug_build.mjs`, `build_output.txt`).

### Verificación de Funcionalidad (Prioridad 2)
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
