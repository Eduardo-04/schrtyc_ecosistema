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

function TarjetaTramite({ tramite }) {
  const [abierta, setAbierta] = useState(false)
  const icono = ICONOS_TRAMITE[tramite.icono] || '📄'
  const acento = tramite.accentColor ? `#${tramite.accentColor}` : '#611232'
  const tieneCards = tramite.cards?.length > 0
  const tieneReqs  = tramite.requisitos?.length > 0
  const tieneInfo  = tieneCards || tieneReqs || tramite.descripcion || tramite.link?.href || tramite.contacto?.email

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
      {tramite.imagenportada && (
        <div style={{ height: 160, overflow: 'hidden' }}>
          <img src={getUploadUrl(tramite.imagenportada)} alt={tramite.titulo} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <button onClick={() => tieneInfo && setAbierta(a => !a)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '20px 24px', background: 'none', border: 'none',
        cursor: tieneInfo ? 'pointer' : 'default', textAlign: 'left',
        borderBottom: abierta ? '1px solid #f3f4f6' : 'none',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, backgroundColor: `${acento}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {icono}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {tramite.subtitulo && <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#A57F2C', margin: '0 0 3px' }}>{tramite.subtitulo}</p>}
          <p style={{ fontSize: 16, fontWeight: 800, color: '#1f2937', margin: 0, lineHeight: 1.2 }}>{tramite.titulo}</p>
        </div>
        {tieneInfo && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={acento} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, transition: 'transform 0.3s', transform: abierta ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {abierta && tieneInfo && (
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tramite.descripcion && <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.75, margin: 0 }}>{tramite.descripcion}</p>}
          {tieneCards && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {tramite.cards.map((card, i) => (
                <div key={i} style={{ backgroundColor: '#f9fafb', borderRadius: 10, padding: '12px 14px', border: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#9ca3af', margin: '0 0 4px' }}>{card.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', margin: 0 }}>{card.value}</p>
                </div>
              ))}
            </div>
          )}
          {tieneReqs && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tramite.requisitos.map((req, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#374151' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: `${acento}1a`, color: acento, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                  {req}
                </li>
              ))}
            </ul>
          )}
          {tramite.link?.href && (
            <a href={tramite.link.href} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: 'white', backgroundColor: acento, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              {tramite.link.label || 'Ver más'}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          )}
          {(tramite.contacto?.email || tramite.contacto?.direccion) && (
            <div style={{ backgroundColor: '#f8f9fa', borderRadius: 12, padding: '14px 16px', border: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', margin: '0 0 8px' }}>Contacto</p>
              {tramite.contacto.email     && <p style={{ fontSize: 13, color: '#374151', margin: '0 0 4px' }}>📧 {tramite.contacto.email}</p>}
              {tramite.contacto.direccion && <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>📍 {tramite.contacto.direccion}</p>}
            </div>
          )}
        </div>
      )}
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

export default function PaginaTransparencia() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    getPaginas()
      .then(res => { if (res?.transparencia) setData(res.transparencia) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const titulo        = data?.titulo          || 'Transparencia'
  const heroBadge     = data?.herobadge       || 'Gobierno abierto'
  const heroDesc      = data?.herodescripcion || 'Información pública, marco jurídico y rendición de cuentas del SCHRTyC.'
  const seccionLabel  = data?.seccionlabel    || 'Documentos'
  const seccionTitulo = data?.secciontitulo   || 'Marco Jurídico'
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

      <div className="bg-[#f8f9fa] py-14">
        <div className="max-w-7xl mx-auto px-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A57F2C] to-transparent hidden lg:block"></div>
              
              <div className="flex flex-col gap-6 text-gray-600 text-sm md:text-base leading-relaxed pl-4">
                {parrafos.map((p, i) => (
                  <p key={i}>
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {imagenPortada && (
              <div className="order-1 lg:order-2 relative px-4 py-4">
                {/* Marco desplazado */}
                <div className="absolute top-0 right-0 w-[90%] h-[90%] border-2 border-[#A57F2C] rounded-3xl translate-x-4 -translate-y-4 opacity-30"></div>
                
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-white group">
                  <img src={imagenPortada} alt={titulo} className="w-full h-auto min-h-[300px] max-h-[500px] object-contain block transition-transform duration-1000 group-hover:scale-110" />
                </div>
                
                {/* Badge minimalista */}
                <div className="absolute -bottom-2 right-10 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-50 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#A57F2C] animate-pulse"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contenido Destacado</span>
                </div>
              </div>
            )}
          </div>

          {tramites.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {tramites.map((t, i) => <TarjetaTramite key={i} tramite={t} />)}
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#A57F2C' }}>{seccionLabel}</p>
            <h2 className="text-2xl font-extrabold mb-8" style={{ color: '#611232' }}>{seccionTitulo}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              {mediaItems.length > 0 ? (
                mediaItems.map((item, i) => {
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
                })
              ) : (
                <p className="text-sm text-gray-400 italic">No hay documentos disponibles en esta sección.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}