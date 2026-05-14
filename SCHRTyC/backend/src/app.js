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

app.use(cors({
  origin: true,
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())

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