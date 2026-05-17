import { useEffect, useState } from 'react'
import { getPaginas, getUploadUrl } from '../services/api'

const ICONOS_TRAMITE = {
  documento: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/>
    </svg>
  ),
  escudo: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  usuarios: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  balanza: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
      <path d="M7 21h10"/><path d="M12 3v18"/>
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
    </svg>
  ),
  edificio: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="18" height="13" rx="1"/>
      <path d="M8 9V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4"/>
      <line x1="9" y1="14" x2="9" y2="18"/><line x1="15" y1="14" x2="15" y2="18"/>
      <line x1="12" y1="14" x2="12" y2="18"/>
    </svg>
  ),
  estrella: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
}

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

function procesarMediaUrl(lineaRaw) {
  const linea = lineaRaw.trim()
  if (!linea) return null
  if (linea.startsWith('##')) return { tipo: 'header', titulo: linea.replace('##', '').trim() }

  const partes = linea.split('|')
  const url = partes[0].trim()
  const tituloAdmin = partes.length > 1 ? partes[1].trim() : null
  const u = url.toLowerCase()

  let nombreArchivo = 'Enlace adjunto'
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const lastPart = pathParts[pathParts.length - 1]
    if (lastPart && !lastPart.includes('view') && !lastPart.includes('edit')) {
      nombreArchivo = decodeURIComponent(lastPart).replace(/[-_]/g, ' ').replace(/\.pdf$/i, '')
    } else if (u.includes('drive.google')) nombreArchivo = 'Documento en Google Drive'
  } catch { /* url inválida */ }

  const tituloFinal = tituloAdmin || nombreArchivo

  if (u.includes('youtube.com') || u.includes('youtu.be')) {
    try {
      const parsed = new URL(url)
      const id = parsed.searchParams.get('v') || (parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : null)
      if (id) return { tipo: 'youtube', src: `https://www.youtube.com/embed/${id}?rel=0`, titulo: tituloFinal }
    } catch { /* ignorar */ }
  }
  if (u.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/)) return { tipo: 'imagen', src: getUploadUrl(url), titulo: tituloFinal }
  if (u.includes('.pdf') || u.includes('/pdf'))       return { tipo: 'pdf',    src: url, titulo: tituloFinal }
  if (u.includes('drive.google.com'))                 return { tipo: 'drive',  src: url, titulo: tituloFinal }
  return { tipo: 'link', src: url, titulo: tituloFinal }
}

function RenderMediaItem({ item }) {
  if (!item) return null
  switch (item.tipo) {
    case 'header':
      return (
        <div className="flex items-center gap-2 mt-5 mb-2 first:mt-0">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#A57F2C] px-2 whitespace-nowrap">
            {item.titulo}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-200 to-transparent" />
        </div>
      )
    case 'youtube':
      return (
        <div className="mb-4 rounded-2xl overflow-hidden shadow-md"
          style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#000' }}>
          <iframe src={item.src} title={item.titulo} allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
        </div>
      )
    case 'imagen':
      return (
        <div className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img src={item.src} alt={item.titulo} className="w-full h-auto block" />
        </div>
      )
    case 'pdf':
    case 'drive':
    case 'link': {
      const meta = {
        pdf:   { label: 'PDF',            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>, color: 'text-orange-500', bg: 'bg-orange-50' },
        drive: { label: 'Google Drive',   icon: '☁️', color: 'text-blue-500',   bg: 'bg-blue-50'   },
        link:  { label: 'Enlace Externo', icon: '🔗', color: 'text-indigo-500', bg: 'bg-indigo-50' },
      }[item.tipo]
      return (
        <a href={item.src} target="_blank" rel="noopener noreferrer"
          className="group mb-2 flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-[#611232] hover:bg-[#611232] transition-all duration-200 shadow-sm hover:shadow-lg">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg ${meta.bg} ${meta.color} group-hover:bg-white/20 group-hover:text-white transition-colors`}>
            {meta.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-800 group-hover:text-white truncate capitalize leading-tight transition-colors">{item.titulo}</p>
            <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-white/70 mt-0.5 transition-colors">{meta.label}</p>
          </div>
          <span className="text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0"><IconArrow /></span>
        </a>
      )
    }
    default: return null
  }
}

function TramiteCard({ tramite }) {
  const tienePortada = !!tramite.imagenportada

  // Si tiene portada arranca cerrado, sino abierto
  const [open, setOpen] = useState(!tienePortada)

  const icono           = ICONOS_TRAMITE[tramite.icono] || ICONOS_TRAMITE.documento
  const accent          = tramite.accentColor || '#A57F2C'
  const tieneCards      = tramite.cards      && tramite.cards.length > 0
  const tieneRequisitos = tramite.requisitos && tramite.requisitos.length > 0
  const tieneContacto   = tramite.contacto  && (tramite.contacto.email || tramite.contacto.direccion)
  const tieneLink       = tramite.link      && tramite.link.href

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header — siempre visible, muestra título y subtítulo */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {icono}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-extrabold text-gray-900 leading-tight">{tramite.titulo}</h3>
          {tramite.subtitulo && (
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">
              {tramite.subtitulo}
            </p>
          )}
        </div>
        {/* Hint de imagen cuando está cerrado */}
        {tienePortada && !open && (
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest hidden sm:block shrink-0 mr-2">
            📷 ver imagen
          </span>
        )}
        <span
          className="text-gray-300 shrink-0 transition-transform duration-300"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <IconChevron />
        </span>
      </button>

      {/* Cuerpo expandible */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '9999px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="border-t border-gray-50">

          {/* Imagen de portada DENTRO del acordeón, tamaño natural */}
          {tienePortada && (
            <div className="w-full overflow-hidden">
              <img
                src={getUploadUrl(tramite.imagenportada)}
                alt={tramite.titulo}
                className="w-full h-auto block"
              />
            </div>
          )}

          <div className="px-6 pb-6 pt-4 space-y-5">

            {tramite.descripcion && (
              <p className="text-sm text-gray-600 leading-relaxed">{tramite.descripcion}</p>
            )}

            {tieneCards && (
              <div className={`grid gap-3 ${
                tramite.cards.length === 1 ? 'grid-cols-1'
                : tramite.cards.length === 2 ? 'grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-3'
              }`}>
                {tramite.cards.map((card, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">{card.label}</p>
                    <p className="text-sm font-semibold text-gray-700 leading-snug">{card.value}</p>
                  </div>
                ))}
              </div>
            )}

            {tieneRequisitos && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tramite.requisitos.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100 list-none">
                    <span
                      className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: '#611232' }}
                    >{i + 1}</span>
                    <span className="text-xs text-gray-600 leading-snug font-medium">{req}</span>
                  </li>
                ))}
              </ul>
            )}

            {tieneLink && (
              <a href={tramite.link.href} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity"
                style={{ color: '#611232' }}>
                {tramite.link.label || 'Ver más'} <IconArrow />
              </a>
            )}

            {tieneContacto && (
              <div
                className="rounded-2xl p-5 space-y-3 border"
                style={{ backgroundColor: `${accent}08`, borderColor: `${accent}20` }}
              >
                <p
                  className="text-[10px] font-extrabold uppercase tracking-widest border-b pb-2 mb-1"
                  style={{ color: accent, borderColor: `${accent}20` }}
                >
                  📬 Ventanilla de Recepción
                </p>
                {tramite.contacto.email && (
                  <div className="flex items-start gap-3">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" className="mt-0.5 shrink-0">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <a href={`mailto:${tramite.contacto.email}`}
                      className="text-sm font-semibold hover:underline break-all" style={{ color: accent }}>
                      {tramite.contacto.email}
                    </a>
                  </div>
                )}
                {tramite.contacto.direccion && (
                  <div className="flex items-start gap-3">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" className="mt-0.5 shrink-0">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="text-sm text-gray-600 font-medium leading-snug">{tramite.contacto.direccion}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Skeleton({ lines = 3 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-100 rounded-full" style={{ width: `${85 + (i % 3) * 5}%` }} />
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
export default function PaginaCine() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    getPaginas()
      .then(res => { if (res?.cine) setData(res.cine) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const parrafos = data?.contenido?.trim()
    ? data.contenido.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    : []

  const mediaItems = data?.multimedia?.trim()
    ? data.multimedia.split('\n').map(procesarMediaUrl).filter(Boolean)
    : []

  const tramites = (() => {
    if (!data?.tramites) return []
    if (Array.isArray(data.tramites)) return data.tramites
    if (typeof data.tramites === 'string') {
      try { return JSON.parse(data.tramites) } catch { return [] }
    }
    return []
  })()

  const totalDocs     = mediaItems.filter(i => ['pdf', 'drive', 'link'].includes(i.tipo)).length
  const heroBadge     = data?.herobadge       || ''
  const heroDesc      = data?.herodescripcion || ''
  const seccionLabel  = data?.seccionlabel    || ''
  const seccionTitulo = data?.secciontitulo   || ''
  const tituloHero    = data?.titulo           || (loading ? 'Cargando...' : '')
  const imagenPortada = data?.imagenportada || data?.imagen_portada || ''

  return (
    <>
      {/* ══ HERO — mismo tamaño compacto que PaginaEtica ══ */}
      <div style={{ backgroundColor: '#611232' }} className="relative text-white py-12 overflow-hidden">
        {/* Patrón de puntos sutil */}
        <svg className="absolute inset-0 opacity-[0.04] pointer-events-none" width="100%" height="100%">
          <defs>
            <pattern id="hero-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="2.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-widest uppercase opacity-60 mb-2">
            🎬 {heroBadge}
          </p>
          <h1 className="text-3xl font-bold">
            {loading
              ? <span className="inline-block w-48 h-8 bg-white/10 rounded-xl animate-pulse" />
              : tituloHero}
          </h1>
          <p className="opacity-70 text-sm mt-2">{heroDesc}</p>
        </div>
      </div>

      {/* Línea dorada */}
      <div style={{ backgroundColor: '#A57F2C', height: '4px' }} />

      {/* ══ CUERPO ══ */}
      <div className="bg-[#f8f8f6] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-10">

          {/* ── 1. SECCIÓN INTRODUCTORIA CON ESTILO EDITORIAL ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
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
              
              <div className="flex flex-col gap-6 text-gray-600 text-sm md:text-base leading-relaxed">
                {parrafos.map((p, i) => (
                  <p key={i}>
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Imagen de Portada con Marco Desplazado */}
            {!loading && imagenPortada && (
              <div className="order-1 lg:order-2 relative px-4 py-4">
                {/* Marco desplazado institucional */}
                <div className="absolute top-0 right-0 w-[90%] h-[90%] border-2 border-[#A57F2C] rounded-3xl translate-x-4 -translate-y-4 opacity-30"></div>
                
                <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-8 border-white bg-white group">
                  <img
                    src={getUploadUrl(imagenPortada)}
                    alt={seccionTitulo || tituloHero}
                    className="w-full h-auto min-h-[300px] max-h-[500px] object-contain block transition-transform duration-1000 group-hover:scale-110"
                  />
                  {/* Overlay de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                {/* Badge minimalista */}
                <div className="absolute -bottom-2 right-10 bg-[#611232] px-4 py-2 rounded-xl shadow-lg border border-white/20 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#A57F2C] animate-pulse"></div>
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">Contenido Destacado</span>
                </div>
              </div>
            )}
          </section>

          {/* ── 3. GRID: TRÁMITES + DOCUMENTOS ── */}
          {(loading || tramites.length > 0 || mediaItems.length > 0) && (
            <div className={`grid gap-8 items-start ${
              tramites.length > 0 && mediaItems.length > 0
                ? 'grid-cols-1 lg:grid-cols-[1fr_380px]'
                : 'grid-cols-1'
            }`}>

              {/* TRÁMITES */}
              {(loading || tramites.length > 0) && (
                <div className="space-y-4">
                  {!loading && tramites.length > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-extrabold text-gray-900">Trámites Oficiales</h2>
                      <span className="text-xs text-gray-400 font-medium">— haz clic para expandir</span>
                    </div>
                  )}
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-gray-100" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-100 rounded w-2/3" />
                              <div className="h-3 bg-gray-50 rounded w-1/3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    tramites.map((tramite, i) => <TramiteCard key={i} tramite={tramite} />)
                  )}
                </div>
              )}

              {/* DOCUMENTOS */}
              {(loading || mediaItems.length > 0) && (
                <div className="lg:sticky lg:top-6 self-start">
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 pt-6 pb-4 border-b border-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#611232' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <h3 className="text-base font-extrabold text-gray-900">Documentos</h3>
                        </div>
                        {totalDocs > 0 && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#A57F2C' }}>
                            {totalDocs} recursos
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">Toca cualquier archivo para abrirlo en pestaña nueva.</p>
                    </div>

                    <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: '520px' }}>
                      {loading ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />
                          ))}
                        </div>
                      ) : mediaItems.length > 0 ? (
                        <div className="flex flex-col">
                          {mediaItems.map((item, idx) => <RenderMediaItem key={idx} item={item} />)}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-gray-100">📁</div>
                          <p className="font-extrabold text-sm text-gray-700 mb-1">Repositorio en construcción</p>
                          <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">Próximamente disponibles todos los documentos.</p>
                        </div>
                      )}
                    </div>

                    {mediaItems.length > 4 && (
                      <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                        <p className="text-[10px] text-gray-400 text-center font-medium tracking-wide">
                          ↕ Desplázate para ver todos los recursos
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </>
  )
}