# CONTEXTO 9: Sistema Dinámico de Galerías (Baúl de Locaciones)

Este documento guarda el estado y la decisión arquitectónica acordada antes de comenzar la implementación del módulo de galerías para páginas institucionales (especialmente Cine). 
Si la implementación falla o no gusta, este documento sirve como punto de restauración de la lógica.

## Objetivo
Implementar un sistema de "Baúl de Locaciones" para la página de Cine, permitiendo agregar múltiples locaciones. Cada locación debe tener:
- Título (Nombre)
- Descripción (Bio)
- Portada (Foto principal)
- Baúl de Fotos (Arreglo de imágenes para un slider)

## Decisión Arquitectónica
Para no romper el modelo compartido del CMS y mantener flexibilidad, se optó por un enfoque genérico:
1.  **Base de Datos**: Se agrega una columna `galerias` (JSON) a la tabla `paginas` en MariaDB.
2.  **CMS**: Se agrega una pestaña "🖼️ Galerías" en `GestionPaginas.jsx`, disponible para todas las páginas, que gestiona este arreglo JSON.
3.  **Portal Web**: `PaginaCine.jsx` consumirá este campo y renderizará las colecciones con un diseño moderno (slider).

## Estructura JSON Acordada
```json
[
  {
    "id": "12345",
    "titulo": "Nombre de la locación",
    "descripcion": "Biografía de la locación",
    "portada": "url_portada.jpg",
    "fotos": ["url_baul1.jpg", "url_baul2.jpg"]
  }
]
```

## Estado Previo (Rollback)
- La tabla `paginas` original solo tiene: slug, titulo, herobadge, herodescripcion, seccionlabel, secciontitulo, contenido, imagenportada, multimedia, tramites, integrantes, ultimaactualizacion.
- `GestionPaginas.jsx` no tiene pestaña de "Galerías".
- `PaginaCine.jsx` renderiza contenido estándar y `mediaItems` (multimedia).
