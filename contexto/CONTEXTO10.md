# CONTEXTO 10: Estandarización de Artistas y Gestión del CTA en Galería

Este documento detalla la implementación, las decisiones de diseño y las modificaciones técnicas realizadas para la galería de arte en el ecosistema SCHRTyC.

## 1. Motivación y Requerimientos
* **Estandarización de Nombres**: Evitar la introducción manual libre de nombres de artistas que causaba inconsistencias y duplicaciones en los filtros por variaciones ortográficas (ej., "Vincent Van Gogh" vs "Vincent van Gogh").
* **Perfiles de Artistas con Foto**: Permitir añadir una foto de perfil oficial para cada artista que se muestre en la pestaña "Artistas (Directorio)" del sitio web público.
* **Banner CTA Editable**: Permitir que el banner de invitación inferior ("¿Eres creador chiapaneco? Somete tu obra...") y su botón de enlace se puedan personalizar directamente desde el gestor administrativo del portal.

---

## 2. Cambios de Base de Datos y Backend (`SCHRTyC/backend`)
* **Nueva Tabla `galeria_autores`**:
  * Creada en MariaDB a través de `db.js`. Almacena `id`, `nombre` (único) y `foto` (ruta relativa / URL).
  * Sembrado inicial configurado desde `galeria_autores.json`.
* **Modificación de Tabla `paginas`**:
  * Se agregaron columnas de forma segura mediante sentencias `ALTER TABLE`: `cta_titulo`, `cta_descripcion`, `cta_link`.
* **Endpoints de API (`routes/galeria.js` y `routes/paginas.js`)**:
  * Se implementó el CRUD completo para autores (endpoints protegidos por token de administrador/editor).
  * Se incluyeron los nuevos campos `cta_` en la lista de `CAMPOS_EDITABLES` de las páginas institucionales.

---

## 3. Cambios en Panel de Administración CMS (`SCHRTyC/frontend`)
* **Servicios de API (`frontend/src/services/api.js`)**:
  * Añadidos los métodos: `getGaleriaAutores`, `crearGaleriaAutor`, `editarGaleriaAutor`, `eliminarGaleriaAutor`.
* **Gestor de Galería (`GestionGaleria.jsx`)**:
  * **Sección de Artistas**: Se añadió un modal de gestión de artistas completo, accesible con el nuevo botón "Artistas". Permite agregar nombres y subir/vincular fotos mediante el gestor del `ArchiveroInput`.
  * **Selector de Obras**: Se reemplazó el campo libre para ingresar el autor por un `<select>` que muestra a los artistas oficiales registrados.
  * **Configuración del Banner (CTA)**: Se incluyeron campos en `ModalPaginaGaleria` para editar los textos y el enlace del botón de invitación.

---

## 4. Cambios en Portal Web Público (`schrtyc-web/web`)
* **Servicios de API (`web/src/services/api.js`)**:
  * Se agregó el método helper público `getGaleriaAutores`.
* **Página de Galería (`PaginaGaleria.jsx`)**:
  * El componente carga en paralelo el listado de artistas. En la pestaña de Directorio, asocia a cada artista con su foto oficial. Si no está configurada, utiliza la imagen de su primera obra en catálogo como fallback de portada.
  * El banner inferior (footer) renderiza de forma reactiva los campos dinámicos `cta_titulo`, `cta_descripcion` y `cta_link` traídos de la base de datos, con fallbacks estáticos en español del Sistema Chiapaneco.

---

## 5. Archivos Modificados / Creados
* **Creado**:
  * `SCHRTyC/backend/src/data/galeria_autores.json`
  * `contexto/CONTEXTO10.md`
* **Modificado**:
  * `SCHRTyC/backend/src/db.js`
  * `SCHRTyC/backend/src/data/paginas_db.json`
  * `SCHRTyC/backend/src/routes/galeria.js`
  * `SCHRTyC/backend/src/routes/paginas.js`
  * `SCHRTyC/frontend/src/services/api.js`
  * `SCHRTyC/frontend/src/components/admin/GestionGaleria.jsx`
  * `schrtyc-web/web/src/services/api.js`
  * `schrtyc-web/web/src/pages/PaginaGaleria.jsx`
