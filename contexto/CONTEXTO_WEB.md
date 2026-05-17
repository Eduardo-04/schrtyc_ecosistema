
---

## Header.jsx

Estructura de arriba a abajo:

1. **Barra top** — fondo `#2d2d2d` (mismo que franja textil). Contiene `chiapas.gob.mx` a la izquierda y links externos a la derecha (14–15px).
2. **Banner** — `<img>` real con `width:100%` y `height:auto` desde `http://radiotvycine.chiapas.gob.mx/assets/img/banner.jpg`. Si falla, desaparece sin dejar espacio.
3. **Franja textil** — `height: 32px`, `backgroundColor: #2d2d2d`, imagen `franja.png` en `repeat-x`.
4. **Nav desktop** — fondo blanco, links centrados con `justifyContent: center`, 15px, activo con `borderBottom: 2px solid #611232`.
5. **Nav móvil** — hamburguesa con nombre de página activa visible, dropdown con topLinks en franja `#2d2d2d`.

**topLinks con URLs correctas:**
```js
{ label: 'Participa',     href: 'https://www.chiapas.gob.mx/participa/' }
{ label: 'Trámites',      href: 'https://www.chiapas.gob.mx/tramites/' }
{ label: 'Gobierno',      href: 'https://www.chiapas.gob.mx/tramites/' }
{ label: 'Transparencia', href: 'https://chiapas.gob.mx' }
```

---

## PaginaInicio.jsx

Secciones en orden:

1. **Hero** — `#611232`, título, descripción, botones Radio y Canal 10, card "Al aire ahora" con programa actual y estaciones activas como pills dorados.
2. **Franja dorada** — `#A57F2C` 4px.
3. **Acerca** — `white`, grid 2 columnas: texto institucional + 4 cards con letra inicial en caja guinda (M, V, R, T).
4. **Canal 10** — `#f8f9fa`, card horizontal con placeholder `C10` + info del programa al aire.
5. **Radio** — `white`, grid `auto-fill minmax(220px)` con `PlayerRadio` (sin emoji, con dial circular y ondas).

**PlayerRadio** características:
- Fondo blanco, borde dorado cuando está playing
- Nombre corto + frecuencia en dorado (si el nombre tiene " - ")
- Dial circular decorativo (en lugar de emoji 📻)
- 24 barras de onda con animación
- `height: 100%` + `marginTop: auto` en botón para cards uniformes

**Datos eliminados:** stats (77.36%, 11 frecuencias, etc.) porque no se confirmaron como oficiales. Sección de Noticias eliminada del inicio.

---

## PaginaRadio.jsx

Secciones en orden:

1. **Hero** — `#611232` + franja dorada 4px
2. **Players** — `#111`, grid con estación destacada (col-span-2) + resto en columna
3. **Cards programación** — `#1a1a1a`, grid 2/4 cols, iniciales en caja semitransparente (sin emojis)
4. **Tabla programación del día** — `#f8f9fa`, filtros por estación en pills guinda/blanco
5. **Posters de programas** — `white`, grid `auto-fill minmax(180px)`, proporción `2/3` (poster vertical)

**PlayerRadio** en esta página tiene variante `destacado={true}` con más altura y ondas.

**ModalPrograma** — iniciales del programa en lugar de emoji 📻.

**ModalPoster** — modal separado para los posters del CMS. Muestra imagen + nombre + conductor + horario + descripción.

**Nota:** `getPosters()` está comentado hasta que el backend lo implemente.

---

## PaginaCanal10.jsx

Secciones en orden:

1. **Hero** — `#611232` + badge "EN VIVO AHORA" si activa + franja dorada
2. **Player + sidebar** — `#111`, player 16:9 (video o placeholder `C10`), sidebar con "Al aire ahora" y "A continuación"
3. **Cards programación** — `#1a1a1a`, igual que Radio pero con iniciales `C`
4. **Tabla programación completa** — `#f8f9fa`
5. **Posters de programas** — `white`, misma estructura que Radio

---

## Reglas de diseño acordadas

- **Sin emojis** en placeholders — se usan iniciales del programa/canal en cajas con fondo semitransparente
- **Sin stats** con datos no verificados (se quitaron los porcentajes de cobertura)
- **Sin sección de noticias** en PaginaInicio
- **Imágenes externas** siempre con `onError` para fallar silenciosamente
- **Nav** siempre en inline styles, no clases Tailwind, para evitar colores heredados inesperados
- **Franja dorada** de 4px separa siempre el hero guinda del resto del contenido
- Todo el código usa **inline styles** para lo crítico de color/layout, Tailwind solo para utilidades simples (padding, grid, flex)