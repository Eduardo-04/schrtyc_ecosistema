import { useState, useEffect } from 'react'
import { getPaginas, getUploadUrl } from '../services/api'

const parseTramites = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    if (!val.trim()) return []
    try { return JSON.parse(val) } catch { return [] }
  }
  return []
}

const ICONOS_TRAMITE = {
  documento: '📄', escudo: '🛡️', usuarios: '👥',
  balanza: '⚖️', edificio: '🏛️', estrella: '⭐',
}

function procesarMediaUrl(lineaRaw) {
  const linea = lineaRaw.trim()
  if (!linea) return null
  if (linea.startsWith('▶') || (!linea.startsWith('http') && !linea.includes('.') && !linea.startsWith('/uploads'))) {
    return { tipo: 'header', titulo: linea.replace('▶', '').trim() }
  }
  const partes = linea.includes('|') ? linea.split('|') : linea.split(' ')
  const url = partes[0].trim()
  const tituloAdmin = partes.length > 1 ? (linea.includes('|') ? partes[1].trim() : partes.slice(1).join(' ').trim()) : null
  const u = url.toLowerCase()
  let nombreArchivo = 'Enlace adjunto'
  try {
    const urlObj = new URL(url.startsWith('/') ? `http://localhost${url}` : url)
    const pathParts = urlObj.pathname.split('/')
    const lastPart = pathParts[pathParts.length - 1]
    if (lastPart && !lastPart.includes('view') && !lastPart.includes('edit'))
      nombreArchivo = decodeURIComponent(lastPart.replace(/-/g, ' ').replace(/\.pdf$/i, ''))
    else if (u.includes('drive.google')) nombreArchivo = 'Documento en Google Drive'
  } catch {}
  return { tipo: 'link', src: getUploadUrl(url), titulo: tituloAdmin || nombreArchivo }
}

export default function PaginaEtica() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    getPaginas()
      .then(res => { if (res?.['comite-etica']) setData(res['comite-etica']) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const titulo        = data?.titulo          || 'Comité de Ética'
  const heroBadge     = data?.herobadge       || 'Integridad'
  const heroDesc      = data?.herodescripcion || 'Integridad, conducta y valores del personal del SCHRTyC.'
  const seccionLabel  = data?.seccionlabel    || '¿Qué es?'
  const seccionTitulo = data?.secciontitulo   || 'Comité de Ética e Integridad'
  const contenido     = data?.contenido       || ''
  const imagenPortada = data?.imagenportada || data?.imagen_portada || ''

  const tramites = parseTramites(data?.tramites)
  const mediaItems = data?.multimedia ? data.multimedia.split('\n').map(procesarMediaUrl).filter(Boolean) : []
  const parrafos = contenido.split('\n\n').map(p => p.trim()).filter(Boolean)

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#611232]"></div>
    </div>
  )

  return (
    <>
      <div style={{ backgroundColor: '#611232' }} className="text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-widest uppercase opacity-60 mb-2">{heroBadge}</p>
          <h1 className="text-3xl font-bold">{titulo}</h1>
          <p className="opacity-70 text-sm mt-2">{heroDesc}</p>
        </div>
      </div>
      <div style={{ backgroundColor: '#A57F2C', height: '4px' }} />

      <div className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-6">

          {/* 1. Intro Split Layout - Estilo Editorial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 lg:order-1 relative">
              {/* Línea decorativa lateral */}
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A57F2C] to-transparent hidden lg:block"></div>
              
              {seccionLabel && (
                <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-4 text-[#A57F2C] flex items-center gap-3">
                  <span className="w-8 h-px bg-[#A57F2C]"></span>
                  {seccionLabel}
                </p>
              )}
              
              <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight" style={{ color: '#611232' }}>
                {seccionTitulo}
              </h2>
              
              <div className="flex flex-col gap-6 text-gray-600 text-sm md:text-base leading-relaxed border-l-4 lg:border-l-0 border-gray-100 pl-6 lg:pl-0">
                {parrafos.map((p, i) => (
                  <p key={i}>
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {imagenPortada && (
              <div className="order-1 lg:order-2 relative px-4 py-4">
                {/* Marco desplazado institucional */}
                <div className="absolute top-0 right-0 w-[90%] h-[90%] border-2 border-[#A57F2C] rounded-3xl translate-x-4 -translate-y-4 opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[#611232]/5 rounded-full blur-3xl"></div>
                
                <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-8 border-white bg-white group">
                  <img 
                    src={getUploadUrl(imagenPortada)} 
                    alt={titulo} 
                    className="w-full h-auto min-h-[300px] max-h-[500px] object-contain block transition-transform duration-1000 group-hover:scale-110" 
                  />
                  {/* Overlay de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                {/* Pequeño detalle técnico inferior */}
                <div className="absolute -bottom-2 right-10 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-50 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#A57F2C] animate-pulse"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contenido Destacado</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Trámites y Recursos */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#611232' }}>Trámites y Servicios</h3>
              {tramites.map((item, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition bg-gray-50/30">
                  <div style={{ backgroundColor: 'white', width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0 }}
                    className="flex items-center justify-center text-xl shadow-sm border border-gray-50">
                    {ICONOS_TRAMITE[item.icono] || '⚖️'}
                  </div>
                  <div className="flex-1">
                    {item.imagenportada && (
                      <div className="w-full h-32 overflow-hidden rounded-xl mb-4 bg-gray-100 shadow-inner">
                        <img src={getUploadUrl(item.imagenportada)} className="w-full h-full object-cover" alt="" />
                      </div>
                    )}
                    <h3 className="font-bold text-sm mb-1" style={{ color: '#611232' }}>{item.titulo}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.descripcion}</p>
                    
                    {item.link?.href && (
                      <a href={item.link.href} target="_blank" rel="noreferrer" 
                        className="text-[10px] font-extrabold uppercase tracking-widest text-[#A57F2C] hover:underline">
                        {item.link.label || 'Ver más'} →
                      </a>
                    )}
                    
                    {(item.contacto?.email || item.contacto?.direccion) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1">
                        {item.contacto.email && <span className="text-[10px] text-gray-400">📧 {item.contacto.email}</span>}
                        {item.contacto.direccion && <span className="text-[10px] text-gray-400">📍 {item.contacto.direccion}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-8">
              {mediaItems.length > 0 && (
                <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest mb-6 text-gray-400">Documentos y Recursos</p>
                  <div className="flex flex-col gap-2">
                    {mediaItems.map((doc, i) => (
                      <a key={i} href={doc.src} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition border border-transparent hover:border-gray-100 group shadow-sm bg-white/50">
                        <span className="text-lg">📄</span>
                        <span className="text-xs font-bold text-gray-600 group-hover:text-[#611232] truncate">{doc.titulo}</span>
                        <span className="ml-auto text-gray-300 group-hover:text-[#611232]">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}