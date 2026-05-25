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

function TarjetaSeccion({ tramite }) {
  const icono = ICONOS_TRAMITE[tramite.icono] || '📄'
  return (
    <div className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition bg-gray-50/30">
      <div style={{ backgroundColor: 'white', width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0 }}
        className="flex items-center justify-center text-xl shadow-sm border border-gray-50">
        {icono}
      </div>
      <div className="flex-1">
        {tramite.imagenportada && (
          <div className="w-full h-32 overflow-hidden rounded-xl mb-4 bg-gray-100 shadow-inner">
            <img src={getUploadUrl(tramite.imagenportada)} className="w-full h-full object-cover" alt="" />
          </div>
        )}
        <h3 className="font-bold text-sm mb-1" style={{ color: '#611232' }}>{tramite.titulo}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">{tramite.descripcion}</p>
        
        {tramite.link?.href && (
          <a href={tramite.link.href} target="_blank" rel="noreferrer" 
            className="text-[10px] font-extrabold uppercase tracking-widest text-[#A57F2C] hover:underline">
            {tramite.link.label || 'Ver más'} →
          </a>
        )}
      </div>
    </div>
  )
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

export default function PaginaPrivacidad() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    getPaginas()
      .then(res => { if (res?.['aviso-privacidad']) setData(res['aviso-privacidad']) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const titulo        = data?.titulo          || 'Avisos de Privacidad'
  const heroBadge     = data?.herobadge       || 'Legal'
  const heroDesc      = data?.herodescripcion || 'Tratamiento de datos personales conforme a la normativa vigente.'
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A57F2C] to-transparent hidden md:block"></div>
              
              <div className="flex flex-col gap-6 text-gray-600 text-sm md:text-base leading-relaxed pl-4">
                {parrafos.map((p, i) => (
                  <p key={i}>
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {imagenPortada && (
              <div className="order-1 md:order-2 relative px-4 py-4">
                {/* Marco desplazado */}
                <div className="absolute top-0 right-0 w-[90%] h-[90%] border-2 border-[#A57F2C] rounded-3xl translate-x-4 -translate-y-4 opacity-30"></div>
                
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-white group">
                  <img src={getUploadUrl(imagenPortada)} alt={titulo} className="w-full h-auto min-h-[300px] max-h-[500px] object-contain block transition-transform duration-1000 group-hover:scale-110" />
                </div>
                
                {/* Badge minimalista */}
                <div className="absolute -bottom-2 right-10 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-50 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#A57F2C] animate-pulse"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contenido Destacado</span>
                </div>
              </div>
            )}
          </div>

          {tramites.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start mb-12">
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4" style={{ color: '#611232' }}>Trámites y Servicios</h3>
                {tramites.map((item, i) => <TarjetaSeccion key={i} tramite={item} />)}
              </div>

              <div className="w-full sticky top-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#A57F2C' }}>Documentación Oficial</p>
                  <h2 className="text-xl font-extrabold mb-6" style={{ color: '#611232' }}>Avisos de Privacidad</h2>
                  
                  <div className="flex flex-col gap-2">
                    {mediaItems.length > 0 ? (
                      mediaItems.map((item, i) => {
                        if (item.tipo === 'header') return (
                          <div key={i} className="mt-6 first:mt-0 mb-2">
                            <h4 className="text-[10px] font-extrabold text-[#611232] uppercase tracking-widest border-b border-gray-100 pb-1">{item.titulo}</h4>
                          </div>
                        )
                        return (
                          <a key={i} href={item.src} target="_blank" rel="noreferrer"
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#f8f9fa] transition group">
                            <span className="text-lg flex-shrink-0">📄</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-700 group-hover:text-[#611232] truncate transition">{item.titulo}</p>
                            </div>
                            <span className="text-gray-300 group-hover:text-[#611232] transition flex-shrink-0">↗</span>
                          </a>
                        )
                      })
                    ) : (
                      <p className="text-sm text-gray-400 italic">No hay documentos disponibles en esta sección.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            mediaItems.length > 0 && (
              <div className="mb-12">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-5xl mx-auto">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-center mb-1" style={{ color: '#A57F2C' }}>Documentación Oficial</p>
                  <h2 className="text-2xl font-extrabold text-center mb-8" style={{ color: '#611232' }}>Avisos de Privacidad</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    {mediaItems.map((item, i) => {
                      if (item.tipo === 'header') return (
                        <div key={i} className="col-span-full mt-6 first:mt-0 mb-2">
                          <h4 className="text-[10px] font-extrabold text-[#611232] uppercase tracking-widest border-b border-gray-100 pb-1">{item.titulo}</h4>
                        </div>
                      )
                      return (
                        <a key={i} href={item.src} target="_blank" rel="noreferrer"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f8f9fa] transition group">
                          <span className="text-lg flex-shrink-0">📄</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-700 group-hover:text-[#611232] truncate transition">{item.titulo}</p>
                          </div>
                          <span className="text-gray-300 group-hover:text-[#611232] transition flex-shrink-0">↗</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          )}

        </div>
      </div>
    </>
  )
}