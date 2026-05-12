/**
 * Determina si una programación está actualmente en vivo basándose en su hora de inicio y fin.
 * @param {string} inicio - Hora de inicio en formato "HH:mm"
 * @param {string} fin - Hora de fin en formato "HH:mm"
 * @returns {boolean}
 */
export const estaEnVivo = (inicio, fin) => {
  if (!inicio || !fin) return false
  const [hI, mI] = inicio.split(':').map(Number)
  const [hF, mF] = fin.split(':').map(Number)
  const now = new Date()
  const m = now.getHours() * 60 + now.getMinutes()
  
  // Manejo de horarios que cruzan la medianoche
  const inicioMinutos = hI * 60 + mI
  const finMinutos = hF * 60 + mF
  
  if (finMinutos < inicioMinutos) {
    // Caso: 22:00 a 02:00
    return m >= inicioMinutos || m < finMinutos
  }
  
  return m >= inicioMinutos && m < finMinutos
}

/**
 * Determina si una hora de inicio es en el futuro respecto al momento actual.
 * @param {string} inicio - Hora de inicio en formato "HH:mm"
 * @returns {boolean}
 */
export const esFuturo = (inicio) => {
  if (!inicio) return false
  const [hI, mI] = inicio.split(':').map(Number)
  const now = new Date()
  const m = now.getHours() * 60 + now.getMinutes()
  return (hI * 60 + mI) > m
}

/**
 * Obtiene las iniciales de un nombre (usado para placeholders).
 * @param {string} nombre 
 * @param {string} fallback 
 * @returns {string}
 */
export const getIniciales = (nombre = '', fallback = 'X') => {
  if (!nombre) return fallback
  const words = nombre.split(' ').filter(w => w.length > 2)
  if (words.length === 0) return nombre.charAt(0).toUpperCase() || fallback
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
