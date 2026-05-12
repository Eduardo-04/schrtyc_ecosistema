const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3005/api'

// Helper para construir URL absoluta de uploads
export const getUploadUrl = (ruta) => {
  if (!ruta) return ''
  if (ruta.startsWith('http')) return ruta
  const apiBase = BASE_URL.replace('/api', '')
  return `${apiBase}${ruta}`
}



// ── Auth ──────────────────────────────────────────────────────
export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json
}

export const verificarToken = async () => {
  const token = localStorage.getItem('schrtyc_token')
  if (!token) throw new Error('Sin token')
  const res = await fetch(`${BASE_URL}/auth/verificar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json
}

// ── Programación (base) ───────────────────────────────────────
export const fetchProgramacion = async (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString()
  const res = await fetch(`${BASE_URL}/programacion${params ? `?${params}` : ''}`)
  if (!res.ok) throw new Error('Error al cargar programación')
  const json = await res.json()
  return json.data
}

export const fetchEstaciones = async () => {
  const res = await fetch(`${BASE_URL}/estaciones`)
  if (!res.ok) throw new Error('Error al cargar estaciones')
  const json = await res.json()
  return json.data
}

export const fetchNoticias = async () => {
  const res = await fetch(`${BASE_URL}/noticias`)
  if (!res.ok) throw new Error('Error al cargar noticias')
  const json = await res.json()
  return json.data
}

// ── Portal Web (Radio y Canal 10) ─────────────────────────────
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export const getEstaciones = () => fetchEstaciones()

export const getProgramacionHoy = () => {
  const hoy = DIAS[new Date().getDay()]
  return fetchProgramacion({ dia: hoy })
}

// ── Headers con token (Helper) ────────────────────────────────
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('schrtyc_token')}`
})

// ── Noticias CRUD ─────────────────────────────────────────────
export const getNoticias = async (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString()
  const res = await fetch(`${BASE_URL}/noticias${params ? `?${params}` : ''}`)
  const json = await res.json()
  return json.data
}

export const crearNoticia = async (datos) => {
  const res = await fetch(`${BASE_URL}/noticias`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

export const editarNoticia = async (id, datos) => {
  const res = await fetch(`${BASE_URL}/noticias/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

export const eliminarNoticia = async (id) => {
  const res = await fetch(`${BASE_URL}/noticias/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json
}

// ── Programación CRUD ─────────────────────────────────────────
export const crearPrograma = async (datos) => {
  const res = await fetch(`${BASE_URL}/programacion`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

export const editarPrograma = async (id, datos) => {
  const res = await fetch(`${BASE_URL}/programacion/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

export const eliminarPrograma = async (id) => {
  const res = await fetch(`${BASE_URL}/programacion/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json
}

// ── Estaciones CRUD ───────────────────────────────────────────
export const getEstacionesCRUD = async (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString()
  const res = await fetch(`${BASE_URL}/estaciones${params ? `?${params}` : ''}`)
  const json = await res.json()
  return json.data
}

export const crearEstacion = async (datos) => {
  const res = await fetch(`${BASE_URL}/estaciones`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

export const editarEstacion = async (id, datos) => {
  const res = await fetch(`${BASE_URL}/estaciones/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

export const eliminarEstacion = async (id) => {
  const res = await fetch(`${BASE_URL}/estaciones/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json
}

// ── Programas (catálogo con poster) ──────────────────────────
export const getProgramas = async (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString()
  const res = await fetch(`${BASE_URL}/programas${params ? `?${params}` : ''}`)
  const json = await res.json()
  return json.data
}

export const crearProgramaCatalogo = async (datos) => {
  const res = await fetch(`${BASE_URL}/programas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

export const editarProgramaCatalogo = async (id, datos) => {
  const res = await fetch(`${BASE_URL}/programas/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

export const eliminarProgramaCatalogo = async (id) => {
  const res = await fetch(`${BASE_URL}/programas/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json
}

// ── Páginas Institucionales (NUEVO) ───────────────────────────
export const getPaginas = async () => {
  const res = await fetch(`${BASE_URL}/paginas`)
  if (!res.ok) throw new Error('Error al cargar páginas institucionales')
  const json = await res.json()
  // Retorna el objeto directamente, no envuelto en .data, según el diseño de la API mock
  return json
}

export const editarPagina = async (slug, datos) => {
  const res = await fetch(`${BASE_URL}/paginas/${slug}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.mensaje || json.message)
  return json.pagina
}

// ── Galería de Arte ──────────────────────────────────────────
export const getGaleria = async () => {
  const res = await fetch(`${BASE_URL}/galeria`)
  if (!res.ok) throw new Error('Error al cargar galería')
  return await res.json()
}

export const crearGaleriaItem = async (datos) => {
  const res = await fetch(`${BASE_URL}/galeria`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.mensaje || json.message)
  return json.item
}

export const editarGaleriaItem = async (id, datos) => {
  const res = await fetch(`${BASE_URL}/galeria/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.mensaje || json.message)
  return json.item
}

export const eliminarGaleriaItem = async (id) => {
  const res = await fetch(`${BASE_URL}/galeria/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.mensaje || json.message)
  return json
}

// ── Filtros de Galería ───────────────────────────────────────
export const getGaleriaFiltros = async () => {
  const res = await fetch(`${BASE_URL}/galeria/filtros`)
  if (!res.ok) throw new Error('Error al cargar filtros')
  return await res.json()
}

export const crearGaleriaFiltro = async (nombre) => {
  const res = await fetch(`${BASE_URL}/galeria/filtros`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ nombre })
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.mensaje || json.message)
  return json.filtros
}

export const eliminarGaleriaFiltro = async (nombre) => {
  const res = await fetch(`${BASE_URL}/galeria/filtros/${nombre}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.mensaje || json.message)
  return json.filtros
}

// ── Configuración ──────────────────────────────────────────
export const getConfiguracion = async () => {
  const res = await fetch(`${BASE_URL}/configuracion`)
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

export const actualizarConfiguracion = async (config) => {
  const res = await fetch(`${BASE_URL}/configuracion`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(config)
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

// ── Archivero (Descubrimiento de archivos) ───────────────────
export const getArchivero = async () => {
  const res = await fetch(`${BASE_URL}/archivero`, {
    headers: getHeaders()
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json.data
}

export const subirArchivo = async (file, oldPath = null) => {
  const formData = new FormData()
  formData.append('file', file)

  let url = `${BASE_URL}/archivero/upload`
  if (oldPath) url += `?replace=${encodeURIComponent(oldPath)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('schrtyc_token')}`
      // Nota: No poner Content-Type, el navegador lo pone con el boundary
    },
    body: formData
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return { ...json, ruta: getUploadUrl(json.ruta) }
}