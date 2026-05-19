const BASE_URL = import.meta.env.VITE_API_URL ?? 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `${window.location.protocol}//${window.location.host}/api`
    : 'http://localhost:3005/api')

// Variable en memoria para el token (Seguridad)
let accessToken = null
export const setAccessToken = (token) => { accessToken = token }

// Helper para construir URL absoluta de uploads
export const getUploadUrl = (ruta) => {
  if (!ruta) return ''
  if (ruta.startsWith('http')) return ruta
  const apiBase = BASE_URL.replace('/api', '')
  return `${apiBase}${ruta}`
}

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

// ── Base Fetch Wrapper ────────────────────────────────────────
const request = async (endpoint, options = {}, _isRetry = false) => {
  const url = `${BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    ...options.headers,
  }

  // Si enviamos FormData, dejamos que el navegador ponga el Content-Type (con boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Obligatorio para enviar cookies de Refresh Token
  })

  const json = await response.json()
  
  if (!response.ok) {
    // Si el token expiró y no es un reintento, intentamos el auto-refresh silencioso
    if (json.code === 'TOKEN_EXPIRED' && !_isRetry && endpoint !== '/auth/refresh') {
      try {
        if (!isRefreshing) {
          isRefreshing = true
          // Realizar la petición de refresh (que envía la cookie HttpOnly)
          const refreshRes = await authRefresh()
          accessToken = refreshRes.token
          isRefreshing = false
          onRefreshed(refreshRes.token)
        }

        // Si ya hay un refresh en curso, esperamos a que termine
        const nuevoToken = await new Promise((resolve) => {
          subscribeTokenRefresh((token) => resolve(token))
        })

        // Reintentar la petición original con el nuevo token
        return request(endpoint, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${nuevoToken}`
          }
        }, true)
      } catch (refreshErr) {
        isRefreshing = false
        refreshSubscribers = []
        // Si el refresh también falla, propagamos el error de expiración original para desloguear
        const error = new Error(json.message || 'Error en la petición')
        error.status = response.status
        error.code = json.code
        throw error
      }
    }

    const error = new Error(json.message || 'Error en la petición')
    error.status = response.status
    error.code = json.code
    throw error
  }

  return json
}

// ── Auth ──────────────────────────────────────────────────────
export const authLogin = (email, password) => 
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const authRefresh = () => 
  request('/auth/refresh', { method: 'POST' })

export const authLogout = () => 
  request('/auth/logout', { method: 'POST' })

export const authVerificar = () => 
  request('/auth/verificar')

// ── Usuarios CRUD (Admin Only) ────────────────────────────────
export const getUsuarios = () => request('/usuarios')
export const crearUsuario = (datos) => request('/usuarios', { method: 'POST', body: JSON.stringify(datos) })
export const editarUsuario = (id, datos) => request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
export const eliminarUsuario = (id) => request(`/usuarios/${id}`, { method: 'DELETE' })

// ── Noticias ──────────────────────────────────────────────────
export const getNoticias = (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString()
  return request(`/noticias${params ? `?${params}` : ''}`).then(j => j.data)
}
export const crearNoticia = (datos) => request('/noticias', { method: 'POST', body: JSON.stringify(datos) }).then(j => j.data)
export const editarNoticia = (id, datos) => request(`/noticias/${id}`, { method: 'PUT', body: JSON.stringify(datos) }).then(j => j.data)
export const eliminarNoticia = (id) => request(`/noticias/${id}`, { method: 'DELETE' })

// ── Páginas Institucionales ───────────────────────────────────
export const getPaginas = () => request('/paginas')
export const editarPagina = (slug, datos) => request(`/paginas/${slug}`, { method: 'PUT', body: JSON.stringify(datos) }).then(j => j.pagina)

// ── Programación ──────────────────────────────────────────────
export const fetchProgramacion = (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString()
  return request(`/programacion${params ? `?${params}` : ''}`).then(j => j.data)
}
export const fetchEstaciones = () => request('/estaciones').then(j => j.data)
export const fetchProgramas = (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString()
  return request(`/programas${params ? `?${params}` : ''}`).then(j => j.data)
}

export const crearPrograma = (datos) => request('/programacion', { method: 'POST', body: JSON.stringify(datos) }).then(j => j.data)
export const editarPrograma = (id, datos) => request(`/programacion/${id}`, { method: 'PUT', body: JSON.stringify(datos) }).then(j => j.data)
export const eliminarPrograma = (id) => request(`/programacion/${id}`, { method: 'DELETE' })

export const crearEstacion = (datos) => request('/estaciones', { method: 'POST', body: JSON.stringify(datos) }).then(j => j.data)
export const editarEstacion = (id, datos) => request(`/estaciones/${id}`, { method: 'PUT', body: JSON.stringify(datos) }).then(j => j.data)
export const eliminarEstacion = (id) => request(`/estaciones/${id}`, { method: 'DELETE' })

export const crearProgramaCatalogo = (datos) => request('/programas', { method: 'POST', body: JSON.stringify(datos) }).then(j => j.data)
export const editarProgramaCatalogo = (id, datos) => request(`/programas/${id}`, { method: 'PUT', body: JSON.stringify(datos) }).then(j => j.data)
export const eliminarProgramaCatalogo = (id) => request(`/programas/${id}`, { method: 'DELETE' })

// ── Importación ──────────────────────────────────────────────
export const previewImportar = (formData) => request('/importar/preview', { 
  method: 'POST', 
  body: formData,
  // Para FormData no debemos enviar Content-Type application/json
  headers: {} 
}).then(j => j)

export const guardarImportar = (formData) => request('/importar/guardar', { 
  method: 'POST', 
  body: formData,
  headers: {}
}).then(j => j)

export const limpiarProgramacion = (estacion = null) => {
  const endpoint = estacion ? `/programacion?estacion=${encodeURIComponent(estacion)}` : '/programacion'
  return request(endpoint, { method: 'DELETE' })
}

// ── Galería ───────────────────────────────────────────────────
export const getGaleria = () => request('/galeria')
export const crearGaleriaItem = (datos) => request('/galeria', { method: 'POST', body: JSON.stringify(datos) }).then(j => j.item)
export const editarGaleriaItem = (id, datos) => request(`/galeria/${id}`, { method: 'PUT', body: JSON.stringify(datos) }).then(j => j.item)
export const eliminarGaleriaItem = (id) => request(`/galeria/${id}`, { method: 'DELETE' })

export const getGaleriaFiltros = () => request('/galeria/filtros')
export const crearGaleriaFiltro = (nombre) => request('/galeria/filtros', { method: 'POST', body: JSON.stringify({ nombre }) }).then(j => j.filtros)
export const eliminarGaleriaFiltro = (nombre) => request(`/galeria/filtros/${nombre}`, { method: 'DELETE' }).then(j => j.filtros)

// ── Configuración ─────────────────────────────────────────────
export const getConfiguracion = () => request('/configuracion').then(j => j.data)
export const actualizarConfiguracion = (config) => request('/configuracion', { method: 'PUT', body: JSON.stringify(config) }).then(j => j.data)

// ── Archivero ─────────────────────────────────────────────────
export const getArchivero = () => request('/archivero').then(j => j.data)
export const subirArchivo = async (file, oldPath = null) => {
  const formData = new FormData()
  formData.append('file', file)

  let url = `/archivero/upload`
  if (oldPath) url += `?replace=${encodeURIComponent(oldPath)}`

  const headers = { 'Authorization': `Bearer ${accessToken}` }
  
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include'
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.message)
  return json
}

export const eliminarArchivo = (filename) => request(`/archivero/${encodeURIComponent(filename)}`, { method: 'DELETE' })