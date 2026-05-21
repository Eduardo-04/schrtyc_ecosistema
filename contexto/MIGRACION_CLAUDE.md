# Contexto para Claude: Migración Segura a Producción

Hola Claude, necesito tu ayuda para planear y ejecutar de forma segura un despliegue en mi servidor de producción, asegurándome de **no perder ni alterar los datos que ya existen en el servidor**.

## 1. Contexto del Proyecto
Se trata de un ecosistema (SCHRTyC) que contiene:
- Un backend en Node.js/Express
- Un CMS (Panel de Administración) en React
- Un Frontend público en React
- Base de datos MariaDB
- Todo orquestado con Docker Compose.

## 2. Los Cambios Recientes
Recientemente, en la rama `develop`, hicimos modificaciones al apartado de **Páginas Institucionales**. Específicamente, se agregó un módulo de "Galerías" (un "Baúl de Locaciones" para la página de Cine). 

La decisión arquitectónica de este cambio implicó:
1. **Base de Datos:** Se requiere agregar una nueva columna llamada `galerias` (de tipo JSON) a la tabla `paginas` en MariaDB.
2. **CMS:** Se modificó `GestionPaginas.jsx` para agregar una pestaña que gestiona este JSON.
3. **Frontend:** Se actualizaron componentes (como `PaginaCine.jsx`) para leer este campo.

*(Nota: Localmente he hecho algunos cambios de prueba en notas y subido algunas fotos al apartado de galería de arte, pero esto no debe reemplazar los datos de producción).*

## 3. Mi Preocupación Principal
El ecosistema ya está corriendo en el servidor de producción y tiene datos reales. Me da miedo que, al subir estos nuevos cambios de GitHub y reconstruir los contenedores, **se vayan a arruinar o perder los datos de las páginas que ya están subidas allá** (textos, rutas de imágenes en volúmenes, etc.). 

La tabla `paginas` actual en producción solo tiene las columnas: `slug`, `titulo`, `herobadge`, `herodescripcion`, `seccionlabel`, `secciontitulo`, `contenido`, `imagenportada`, `multimedia`, `tramites`, `integrantes`, `ultimaactualizacion`.

## 4. Lo que necesito de ti (Instrucciones Solicitadas)
Necesito que me des un plan paso a paso y a prueba de fallos para:
1. **Respaldar la base de datos actual** de producción antes de tocar nada.
2. **Migrar la base de datos de forma segura:** ¿Cómo agrego exactamente la columna `galerias` a la tabla `paginas` directamente en el contenedor MariaDB de producción sin borrar las filas existentes?
3. **Actualizar el código y los contenedores:** Cuál es el flujo correcto (git pull, docker-compose build/up, etc.) para aplicar los cambios del backend y frontend asegurando que los volúmenes de datos de MariaDB y de subida de imágenes (`/uploads`) no se reseteen ni se pierdan.

Dime exactamente qué comandos correr en la terminal del servidor Ubuntu para lograr esto sin riesgo.
