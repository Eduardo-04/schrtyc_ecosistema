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

const parseIntegrantes = (val) => {
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

function TarjetaIntegrante({ p }) {
  const [expandida, setExpandida] = useState(false)
  const tieneBio = p.bio && p.bio.trim().length > 0

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>

      {/* Foto sin texto encima */}
      <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'linear-gradient(135deg, #611232, #8a1a45)', flexShrink: 0 }}>
        {p.foto
          ? <img src={getUploadUrl(p.foto)} alt={p.nombre} loading="lazy"
              onError={e => e.target.style.display = 'none'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 64, opacity: 0.25 }}>
                {p.nombre?.charAt(0)?.toUpperCase()}
              </span>
            </div>
        }
      </div>

      {/* Nombre y cargo siempre legibles debajo */}
      <div style={{ padding: '14px 16px', borderTop: '3px solid #611232', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {p.cargo && (
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#A57F2C', margin: 0 }}>
            {p.cargo}
          </p>
        )}
        <p style={{ fontSize: 14, fontWeight: 800, color: '#1f2937', margin: 0, lineHeight: 1.3 }}>
          {p.nombre}
        </p>

        {tieneBio && (
          <>
            <p style={{
              fontSize: 11, color: '#6b7280', lineHeight: 1.7,
              margin: '6px 0 0', borderTop: '1px solid #f3f4f6', paddingTop: 8,
              display: '-webkit-box',
              WebkitLineClamp: expandida ? 'unset' : 3,
              WebkitBoxOrient: 'vertical',
              overflow: expandida ? 'visible' : 'hidden',
            }}>
              {p.bio}
            </p>
            <button
              onClick={() => setExpandida(e => !e)}
              style={{
                alignSelf: 'flex-start', marginTop: 4,
                fontSize: 10, fontWeight: 700, color: '#611232',
                background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', letterSpacing: '0.5px',
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}>
              {expandida ? 'Ver menos ↑' : 'Leer más ↓'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function SeccionIntegrantes({ integrantes }) {
  if (!integrantes || integrantes.length === 0) return null
  return (
    <div style={{ backgroundColor: '#f8f9fa', padding: '56px 0' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#A57F2C', marginBottom: 6 }}>
            Consejo Ciudadano de Radio y Televisión
          </p>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#611232', margin: 0 }}>Integrantes</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
          {integrantes.map((p, i) => (
            <TarjetaIntegrante key={i} p={p} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PaginaParticipacion() {
  const [data,     setData]     = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getPaginas()
      .then(todas => setData(todas?.participacion || null))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  const tramites    = parseTramites(data?.tramites)
  const integrantes = parseIntegrantes(data?.integrantes)

  const titulo        = data?.titulo          || (cargando ? 'Cargando...' : '')
  const heroBadge     = data?.herobadge       || ''
  const heroDesc      = data?.herodescripcion || ''
  const seccionLabel  = data?.seccionlabel    || ''
  const seccionTitulo = data?.secciontitulo   || ''
  const contenido     = data?.contenido       || ''
  const imagenPortada = data?.imagenportada || data?.imagen_portada || ''

  const parrafos = contenido.split('\n\n').map(p => p.trim()).filter(Boolean)
  const mediaItems = data?.multimedia ? data.multimedia.split('\n').map(procesarMediaUrl).filter(Boolean) : []

  if (cargando) return (
    <>
      <div style={{ backgroundColor: '#611232' }} className="text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ height: 12, width: 80,  backgroundColor: 'rgba(255,255,255,0.2)',  borderRadius: 6, marginBottom: 10 }} />
          <div style={{ height: 32, width: 300, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, marginBottom: 10 }} />
          <div style={{ height: 14, width: 260, backgroundColor: 'rgba(255,255,255,0.1)',  borderRadius: 6 }} />
        </div>
      </div>
      <div style={{ backgroundColor: '#A57F2C', height: 4 }} />
      <div className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[1,2,3].map(i => <div key={i} style={{ borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, height: 140, backgroundColor: '#f9fafb' }} />)}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Encabezado */}
      <div style={{ backgroundColor: '#611232' }} className="text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-widest uppercase opacity-60 mb-2">{heroBadge}</p>
          <h1 className="text-3xl font-bold">{titulo}</h1>
          {heroDesc && <p className="opacity-70 text-sm mt-2">{heroDesc}</p>}
        </div>
      </div>
      <div style={{ backgroundColor: '#A57F2C', height: 4 }} />

      {(parrafos.length > 0 || seccionTitulo || imagenPortada) && (
        <div className="bg-white py-14">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A57F2C] to-transparent hidden lg:block"></div>
                
                {(seccionLabel || seccionTitulo) && (
                  <div style={{ marginBottom: 24 }} className="pl-4">
                    {seccionLabel  && <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: '#A57F2C', marginBottom: 8 }}>{seccionLabel}</p>}
                    {seccionTitulo && <h2 style={{ fontSize: 32, fontWeight: 900, color: '#611232', margin: 0 }}>{seccionTitulo}</h2>}
                  </div>
                )}
                
                {parrafos.length > 0 && (
                  <div className="flex flex-col gap-6 pl-4">
                    {parrafos.map((p, i) => (
                      <p key={i} style={{ fontSize: 16, color: '#374151', lineHeight: 1.8, margin: 0 }}>
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {imagenPortada && (
                <div className="order-1 lg:order-2 relative px-4 py-4">
                  {/* Marco desplazado */}
                  <div className="absolute top-0 right-0 w-[90%] h-[90%] border-2 border-[#A57F2C] rounded-3xl translate-x-4 -translate-y-4 opacity-30"></div>
                  
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-white group">
                    <img src={getUploadUrl(imagenPortada)} alt={titulo} loading="lazy"
                      className="w-full h-auto min-h-[300px] max-h-[500px] object-contain block transition-transform duration-1000 group-hover:scale-110" />
                  </div>
                  
                  {/* Badge minimalista */}
                  <div className="absolute -bottom-2 right-10 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#A57F2C] animate-pulse"></div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contenido Destacado</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenedor principal para Trámites y Documentos */}
      <div className="bg-[#f8f9fa] py-14">
        <div className="max-w-7xl mx-auto px-6">
          {tramites.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start mb-12">
              <div className="space-y-6">
                <h3 className="text-lg font-bold" style={{ color: '#611232' }}>¿En qué podemos apoyarte?</h3>
                <div className="flex flex-col gap-4">
                  {tramites.map((t, i) => <TarjetaTramite key={i} tramite={t} />)}
                </div>
              </div>
              
              <div className="w-full sticky top-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#A57F2C' }}>Documentación Oficial</p>
                  <h2 className="text-xl font-extrabold mb-6" style={{ color: '#611232' }}>Archivos y Convocatorias</h2>
                  
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
                      <p className="text-sm text-gray-400 italic">No hay documentos disponibles.</p>
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
                  <h2 className="text-2xl font-extrabold text-center mb-8" style={{ color: '#611232' }}>Archivos y Convocatorias</h2>
                  
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

      {/* Integrantes siempre debajo de trámites y documentos */}
      <SeccionIntegrantes integrantes={integrantes} />

      {/* Si no hay trámites ni integrantes, no mostrar el bloque estático anterior */}
    </>
  )
}