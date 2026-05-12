/**
 * Verifica si una URL es válida y usa protocolos HTTP/HTTPS.
 * @param {string} url 
 * @returns {boolean}
 */
export const esUrlValida = (url = '') => {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Detecta el tipo de plataforma de una URL de medio.
 * @param {string} url 
 * @returns {string} 'youtube' | 'facebook' | 'soundcloud' | 'spotify' | 'generic'
 */
export const detectarTipoMedia = (url = '') => {
  if (!esUrlValida(url)) return 'generic'
  const u = url.toLowerCase()
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  if (u.includes('facebook.com')) return 'facebook'
  if (u.includes('soundcloud.com')) return 'soundcloud'
  if (u.includes('spotify.com')) return 'spotify'
  return 'generic'
}

/**
 * Obtiene la miniatura de un video de YouTube.
 * @param {string} url 
 * @returns {string|null}
 */
export const getYoutubeThumbnail = (url) => {
  if (!url) return null
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

/**
 * Normaliza una URL para su uso en iframes.
 * @param {string} url 
 * @returns {string}
 */
export const normalizarEmbedUrl = (url) => {
  if (!url) return url
  const tipo = detectarTipoMedia(url)
  
  if (tipo === 'youtube') {
    if (url.includes('/embed/')) return url
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : url
  }
  
  if (tipo === 'spotify') {
    // Elimina el intl y parámetros extra
    return url.replace(/\/intl-[a-z]+\//, '/').replace(/\?.*$/, '')
  }
  
  return url
}
