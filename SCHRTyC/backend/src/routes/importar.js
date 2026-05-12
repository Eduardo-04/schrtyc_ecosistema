const express = require('express')
const router  = express.Router()
const { verificarToken } = require('../middleware/auth')
const multer  = require('multer')
const XLSX    = require('xlsx')

const upload = multer({ storage: multer.memoryStorage() })

function limpiarNombre(nombre) {
  if (!nombre) return ''
  return String(nombre)
    .replace(/\(A\)|\(AA\)/gi, '')
    .replace(/rtx|Tx vv|Tx grab/gi, '')
    .replace(/_[A-Z0-9_]+/g, '')
    .replace(/ESTRENO|Reestreno|1er pase|1er\. Pase/gi, '')
    .replace(/TAL|DW|Canal 44 UDG|Agrosiete|CEPROPIE|CONECULTA/gi, '')
    .replace(/[-–—]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parsearParrilla(filas, estacion) {
  const programas = []
  let filaHeaders = -1
  const colsDias  = {}

  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i]
    const encontrados = {}
    for (let j = 0; j < fila.length; j++) {
      const val     = String(fila[j]).trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const diaBase = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO'].find(d => val === d || val.startsWith(d))
      if (diaBase) {
        const diaNormal = {
          'LUNES':'Lunes','MARTES':'Martes','MIERCOLES':'Miércoles',
          'JUEVES':'Jueves','VIERNES':'Viernes','SABADO':'Sábado','DOMINGO':'Domingo'
        }[diaBase]
        encontrados[diaNormal] = j
      }
    }
    if (Object.keys(encontrados).length >= 5) {
      filaHeaders = i
      Object.assign(colsDias, encontrados)
      break
    }
  }

  if (filaHeaders === -1) return []

  for (let i = filaHeaders + 1; i < filas.length; i++) {
    const fila      = filas[i]
    const celdaHora = String(fila[0] || '').trim()
    const match     = celdaHora.match(/(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})/)
    if (!match) continue

    const hora_inicio = match[1].padStart(5, '0')
    const hora_fin    = match[2].padStart(5, '0')

    for (const [dia, col] of Object.entries(colsDias)) {
      const celda  = String(fila[col] || '').trim()
      if (!celda) continue
      const nombre = limpiarNombre(celda)
      if (!nombre) continue

      programas.push({
        hora_inicio,
        hora_fin,
        dia,
        nombre,
        conductor:   'Sin asignar',
        estacion:    estacion || '',
        descripcion: celda,
        tipo: estacion && estacion.toLowerCase().includes('radio') ? 'Radio' : 'TV'
      })
    }
  }

  return programas
}

router.post('/preview', verificarToken, upload.single('archivo'), async (req, res) => {
  try {
    const { estacion } = req.body
    if (!req.file) return res.status(400).json({ error: 'No se subió archivo' })

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' })
    const hoja     = workbook.Sheets[workbook.SheetNames[0]]
    const filas    = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: '' })

    const programas = parsearParrilla(filas, estacion)
    res.json({ total: programas.length, muestra: programas.slice(0, 20), programas })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/guardar', verificarToken, upload.single('archivo'), async (req, res) => {
  try {
    const { estacion } = req.body
    if (!req.file) return res.status(400).json({ error: 'No se subió archivo' })

    const workbook  = XLSX.read(req.file.buffer, { type: 'buffer' })
    const hoja      = workbook.Sheets[workbook.SheetNames[0]]
    const filas     = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: '' })
    const programas = parsearParrilla(filas, estacion)

    const progRoute = require('./programacion')
    const db        = progRoute.leerDB()
    const getNextId = progRoute.getNextId

    let insertados = 0
    for (const p of programas) {
      db.push({ id: getNextId(db), ...p })
      insertados++
    }
    
    progRoute.guardarDB(db)

    res.json({ ok: true, insertados })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router