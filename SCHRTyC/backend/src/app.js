const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { initDB } = require('./db')

const programacionRoutes = require('./routes/programacion')
const noticiasRoutes     = require('./routes/noticias')
const estacionesRoutes   = require('./routes/estaciones')
const authRoutes         = require('./routes/auth')
const importarRoutes     = require('./routes/importar')
const programasRoutes    = require('./routes/programas')
const paginasRoutes      = require('./routes/paginas')
const galeriaRoutes      = require('./routes/galeria')
const configuracionRoutes = require('./routes/configuracion')
const registrosRoutes    = require('./routes/registros') // Ruta de prueba MariaDB
const archiveroRoutes    = require('./routes/archivero')
const usuariosRoutes     = require('./routes/usuarios')

const app  = express()
const PORT = process.env.PORT || 3001

// ── Seguridad HTTP ───────────────────────────────────────────
app.use(helmet())

// CORS: whitelist configurable por variable de entorno
const CORS_WHITELIST = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (curl, Postman, servidores) y localhost en desarrollo
    if (!origin) return callback(null, true)
    if (process.env.NODE_ENV !== 'production') return callback(null, true)
    const permitidos = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      ...CORS_WHITELIST
    ]
    if (permitidos.some(o => origin.startsWith(o))) {
      callback(null, true)
    } else {
      callback(new Error(`CORS bloqueado para origin: ${origin}`))
    }
  },
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(cookieParser())

// Servir archivos de la carpeta uploads
app.use('/uploads', express.static('uploads'))

// Rate limit para el login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limitar cada IP a 100 peticiones por ventana
  message: { ok: false, message: 'Demasiados intentos desde esta IP, por favor intente de nuevo más tarde' }
})

// Rutas
app.get('/api', (req, res) => {
  res.json({ 
    ok: true, 
    mensaje: 'API SCHRTyC activa 🚀',
    documentacion: 'Consulta CONTEXTO7.md para más detalles',
    endpoints: [
      '/api/auth',
      '/api/programacion',
      '/api/noticias',
      '/api/estaciones',
      '/api/programas',
      '/api/paginas',
      '/api/galeria',
      '/api/configuracion',
      '/api/health'
    ]
  })
})

app.use('/api/auth',         authLimiter, authRoutes)
app.use('/api/programacion', programacionRoutes)
app.use('/api/noticias',     noticiasRoutes)
app.use('/api/estaciones',   estacionesRoutes)
app.use('/api/importar',     importarRoutes)
app.use('/api/programas',    programasRoutes)
app.use('/api/paginas',      paginasRoutes)
app.use('/api/galeria',      galeriaRoutes)
app.use('/api/configuracion', configuracionRoutes)
app.use('/api/registros',    registrosRoutes) // Prueba MariaDB
app.use('/api/archivero',    archiveroRoutes)
app.use('/api/usuarios',     usuariosRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'SCHRTyC API corriendo ✅', fecha: new Date() })
})

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend SCHRTyC corriendo en http://localhost:${PORT}`)
  })
})