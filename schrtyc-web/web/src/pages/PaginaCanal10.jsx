import { useEffect, useRef, useState } from 'react'
import { getProgramacionHoy, getProgramas, getEstaciones } from '../services/api'
import { estaEnVivo, esFuturo, getIniciales } from '../utils/date'
import { detectarTipoMedia, getYoutubeThumbnail } from '../utils/media'

// ── Helpers Específicos ───────────────────────────────────────
const colorEmbed = (url) => ({
  youtube:    '#FF0000',
  facebook:   '#1877F2',
  soundcloud: '#FF5500',
  spotify:    '#1DB954',
  generic:    '#611232',
}[detectarTipoMedia(url)])

const alturaEmbed = (url) => {
  const t = detectarTipoMedia(url)
  if (t === 'soundcloud') return 166
  if (t === 'spotify')    return 152
  return null
}

const getCardImage = (prog) => {
  if (prog.imagen) return { src: prog.imagen, tipo: 'poster' }
  const yt = (prog.embeds || []).find(e => detectarTipoMedia(e.url) === 'youtube')
  if (yt) {
    const thumb = getYoutubeThumbnail(yt.url)
    if (thumb) return { src: thumb, tipo: 'youtube' }
  }
  return null
}

// El STREAM_URL ahora se obtiene dinámicamente de la base de datos de estaciones

// ── IconChevron ───────────────────────────────────────────────
const IconChevron = ({ open }) => (
  <svg
    width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    style={{
      transition: 'transform 0.3s ease',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      flexShrink: 0,
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

// ── HLS Player ────────────────────────────────────────────────
function HLSPlayer({ streamUrl }) {
  const videoRef = useRef(null)
  const hlsRef   = useRef(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !streamUrl) return

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl
    } else {
      import('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js')
        .then(({ default: Hls }) => {
          if (!Hls.isSupported()) { setError(true); return }
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true })
          hlsRef.current = hls
          hls.loadSource(streamUrl)
          hls.attachMedia(video)
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) { setError(true); hls.destroy() }
          })
        })
        .catch(() => setError(true))
    }

    return () => { hlsRef.current?.destroy(); hlsRef.current = null }
  }, [streamUrl])

  if (error) return (
    <div className="hls-player-error">
      <div className="hls-player-error-icon">
        <span style={{ fontWeight: '800', fontSize: '22px', letterSpacing: '-1px' }}>C10</span>
      </div>
      <p style={{ fontWeight: '700', fontSize: '16px' }}>Señal no disponible</p>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Intenta recargar la página.</p>
    </div>
  )

  return (
    <div className="rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
      <video
        ref={videoRef}
        controls autoPlay playsInline muted
        className="w-full h-full object-contain"
        style={{ display: 'block', backgroundColor: '#000' }}
        onError={() => setError(true)}
      />
    </div>
  )
}

// ── Modal Programación ────────────────────────────────────────
function ModalPrograma({ programa, onClose }) {
  if (!programa) return null
  const vivo = estaEnVivo(programa.hora_inicio, programa.hora_fin)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
        onClick={e => e.stopPropagation()}>
        {programa.imagen ? (
          <img src={programa.imagen} alt={programa.nombre} className="w-full h-48 object-cover" />
        ) : (
          <div style={{ background: 'linear-gradient(135deg, #611232 0%, #A57F2C 100%)', height: '160px' }}
            className="flex flex-col items-center justify-center text-white p-6 gap-3">
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>{getIniciales(programa.nombre)}</span>
            </div>
            <p className="font-bold text-lg text-center">{programa.nombre}</p>
            {vivo && <span className="text-xs bg-red-500 px-3 py-1 rounded-full animate-pulse">EN VIVO AHORA</span>}
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#611232' }}>{programa.nombre}</h3>
              <p className="text-sm text-gray-500">{programa.conductor}</p>
            </div>
            <span className="text-xs font-mono text-gray-400 flex-shrink-0 ml-4 mt-1">
              {programa.hora_inicio} – {programa.hora_fin}
            </span>
          </div>
          {programa.descripcion && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{programa.descripcion}</p>
          )}
          {programa.youtube_url && (
            <div className="rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
              <iframe src={programa.youtube_url.replace('watch?v=', 'embed/')}
                className="w-full h-full" allowFullScreen title={programa.nombre} />
            </div>
          )}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #eee' }}>
            <span className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{ backgroundColor: '#f8f9fa', color: '#611232' }}>
              {programa.estacion}
            </span>
            <button onClick={onClose} className="text-sm font-semibold hover:underline"
              style={{ color: '#611232' }}>Cerrar ✕</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── EmbedItem ─────────────────────────────────────────────────
function EmbedItem({ embed }) {
  const tipo    = detectarTipoMedia(embed.url)
  const c       = colorEmbed(embed.url)
  const h       = alturaEmbed(embed.url)
  const esSpot  = tipo === 'spotify'

  return (
    <div className="embed-card">
      <div className="embed-header" style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c, flexShrink: 0 }} />
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {embed.titulo || (esSpot ? 'Audio / Podcast' : 'Video / Contenido')}
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <iframe 
          src={embed.url} 
          style={{ width: '100%', height: h ? `${h}px` : 'auto', aspectRatio: h ? 'auto' : '16/9', display: 'block', border: 'none', backgroundColor: '#000' }} 
          allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen title={embed.titulo || 'Embed'} 
        />
      </div>
    </div>
  )
}

// ── Modal Catálogo ────────────────────────────────────────────
function ModalCatalogo({ prog, onClose }) {
  if (!prog) return null
  const embeds    = (prog.embeds || []).filter(e => e.url)
  const cardImg   = getCardImage(prog)
  const imgSrc    = cardImg?.src
  const tieneDesc = !!(prog.descripcionLarga || prog.descripcion)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        
        <div className="modal-hero">
          {/* Background Blurred Image */}
          <div className="modal-hero-bg">
            {imgSrc ? (
              <img src={imgSrc} alt="" className="modal-hero-bg-img" />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #611232, #8a1a45)' }} />
            )}
            <div className="modal-hero-overlay" />
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          {/* Poster Image (Intelligent Layout) */}
          {imgSrc && (
            <div className="modal-hero-poster">
              <img src={imgSrc} alt={prog.nombre} className="modal-poster-img" />
            </div>
          )}

          {/* Text Content */}
          <div className="modal-hero-info">
            <div className="flex gap-2 mb-4">
              <span className="modal-badge" style={{ backgroundColor: '#A57F2C', marginBottom: 0 }}>{prog.tipo}</span>
              <span className="modal-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 0 }}>{prog.estacion}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '900', lineHeight: 1.1, margin: 0 }}>{prog.nombre}</h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginTop: '16px', opacity: 0.9 }}>
              {prog.conductor && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{prog.conductor}</span>
                </div>
              )}
              {prog.horario && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#f0c060' }}>{prog.horario}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-body">
          {tieneDesc && (
            <div className="modal-description">
              <p>{prog.descripcionLarga || prog.descripcion}</p>
            </div>
          )}

          {/* Spotify Section */}
          {embeds.filter(e => detectarTipoMedia(e.url) === 'spotify').length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#1DB954', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 17.3c-.2.3-.5.4-.8.2-2.5-1.5-5.6-1.8-9.3-.9-.3.1-.6-.1-.7-.4s.1-.6.4-.7c4.1-1 7.6-.6 10.4 1.1.2.2.3.5.1.8l-.1-.1zm1.5-3.3c-.3.4-.8.5-1.2.3-2.8-1.7-7.2-2.2-10.5-1.2-.5.1-1-.2-1.1-.7-.1-.5.2-1 .7-1.1 3.9-1.2 8.7-.6 12 1.4.3.3.4.9.1 1.3zM19 10.3C15.2 8.1 8.8 7.8 5.1 9c-.6.2-1.2-.2-1.4-.8-.2-.6.2-1.2.8-1.4 4.3-1.3 11.4-1 15.8 1.6.5.3.7 1 .4 1.5-.3.5-1 .7-1.5.4z"/></svg>
                Podcast y Episodios
              </p>
              <div className="modal-embed-grid">
                {embeds.filter(e => detectarTipoMedia(e.url) === 'spotify').map((embed, i) => (
                  <EmbedItem key={`spot-${i}`} embed={embed} />
                ))}
              </div>
            </div>
          )}

          {/* Video Section */}
          {embeds.filter(e => detectarTipoMedia(e.url) !== 'spotify').length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#ef4444', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
                Contenido en Video
              </p>
              <div className={`modal-embed-grid ${embeds.filter(e => detectarTipoMedia(e.url) !== 'spotify').length >= 2 ? 'columns-2' : ''}`}>
                {embeds.filter(e => detectarTipoMedia(e.url) !== 'spotify').map((embed, i) => (
                  <EmbedItem key={`vid-${i}`} embed={embed} />
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '24px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#611232', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '10px', fontWeight: '900' }}>S</span>
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>SCHRTyC · Sistema Chiapaneco de Radio, TV y Cine</span>
            </div>
            <button onClick={onClose} style={{ fontSize: '14px', fontWeight: '700', color: '#611232', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff5f5'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Acordeón Programación Completa ────────────────────────────
function ProgramacionAcordeon({ programas, onVerPrograma }) {
  const [abierto, setAbierto] = useState(false)
  const programaEnVivo = programas.find(p => estaEnVivo(p.hora_inicio, p.hora_fin))

  return (
    <div className="program-accordion">
      <button
        onClick={() => setAbierto(v => !v)}
        className="accordion-header"
        style={{ background: abierto ? '#611232' : 'white' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          <div className="accordion-icon-box" style={{ backgroundColor: abierto ? 'rgba(255,255,255,0.15)' : '#f3f4f6' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={abierto ? 'white' : '#611232'} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: abierto ? 'rgba(255,255,255,0.6)' : '#A57F2C', marginBottom: '2px' }}>
              Hoy
            </p>
            <p style={{ fontSize: '16px', fontWeight: '800', color: abierto ? 'white' : '#611232', margin: 0 }}>
              Programación Completa
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <span style={{
              fontSize: '12px', fontWeight: '700',
              backgroundColor: abierto ? 'rgba(255,255,255,0.18)' : '#f3f4f6',
              color: abierto ? 'white' : '#6b7280',
              padding: '3px 10px', borderRadius: '999px',
            }}>
              {programas.length} programa{programas.length !== 1 ? 's' : ''}
            </span>
            {programaEnVivo && (
              <span className="animate-pulse" style={{
                fontSize: '11px', fontWeight: '700',
                backgroundColor: '#dc2626', color: 'white',
                padding: '3px 10px', borderRadius: '999px',
              }}>
                🔴 Al aire
              </span>
            )}
          </div>
        </div>
        <div style={{ color: abierto ? 'white' : '#611232' }}>
          <IconChevron open={abierto} />
        </div>
      </button>

      {abierto && (
        <div className="accordion-body">
          {programas.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>Sin programación de TV para hoy.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horario</th>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Programa</th>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conductor</th>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="hidden md:table-cell">Descripción</th>
                    <th style={{ padding: '10px 20px' }} />
                  </tr>
                </thead>
                <tbody>
                  {programas.map(p => {
                    const vivo = estaEnVivo(p.hora_inicio, p.hora_fin)
                    return (
                      <tr key={p.id}
                        onClick={() => onVerPrograma(p)}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          backgroundColor: vivo ? '#fff5f5' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!vivo) e.currentTarget.style.backgroundColor = '#fafafa' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = vivo ? '#fff5f5' : 'transparent' }}
                      >
                        <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9ca3af' }}>
                            {p.hora_inicio} – {p.hora_fin}
                          </span>
                          {vivo && (
                            <span className="animate-pulse" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '8px', fontSize: '10px', fontWeight: '700', color: 'white', backgroundColor: '#dc2626', padding: '2px 8px', borderRadius: '999px' }}>
                              EN VIVO
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontWeight: '700', fontSize: '13px', color: '#1f2937' }}>{p.nombre}</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>{p.conductor}</td>
                        <td style={{ padding: '14px 20px', fontSize: '12px', color: '#9ca3af' }} className="hidden md:table-cell">
                          {p.descripcion
                            ? p.descripcion.length > 60 ? p.descripcion.slice(0, 60) + '…' : p.descripcion
                            : '—'}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#611232' }}>Ver más →</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Página Principal ──────────────────────────────────────────
export default function PaginaCanal10() {
  const [programas, setProgramas] = useState([])
  const [catalogo, setCatalogo]   = useState([])
  const [modal, setModal]         = useState(null)
  const [modalCat, setModalCat]   = useState(null)

  const [estaciones, setEstaciones] = useState([])

  useEffect(() => {
    getProgramacionHoy().then(setProgramas).catch(console.error)
    getProgramas().then(setCatalogo).catch(console.error)
    getEstaciones().then(setEstaciones).catch(console.error)
  }, [])

  const programasTV    = programas.filter(p => p.tipo === 'TV')
  const programaActual = programasTV.find(p => estaEnVivo(p.hora_inicio, p.hora_fin))

  // Solo traemos los 3 siguientes programas para que quepan bien sin necesidad de scroll
  const proximos = programasTV
    .filter(p => esFuturo(p.hora_inicio))
    .sort((a, b) => {
      const [hA, mA] = a.hora_inicio.split(':').map(Number)
      const [hB, mB] = b.hora_inicio.split(':').map(Number)
      return (hA * 60 + mA) - (hB * 60 + mB)
    })
    .slice(0, 3)

  const tvStation      = estaciones.find(e => e.tipo === 'TV' && e.streamUrl && e.activo)
  const currentStream  = tvStation?.streamUrl || null
  const catalogoTV     = catalogo.filter(p => p.tipo === 'TV' && p.activo !== false)

  return (
    <>
      <ModalPrograma programa={modal}  onClose={() => setModal(null)} />
      <ModalCatalogo prog={modalCat}   onClose={() => setModalCat(null)} />

      {/* Hero */}
      <div style={{ backgroundColor: '#611232' }} className="text-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-widest uppercase opacity-60 mb-2">Televisión</p>
            <h1 className="text-3xl font-bold">Canal 10.1</h1>
            <p className="opacity-70 text-sm mt-2">Señal abierta con amplia cobertura en el territorio chiapaneco.</p>
          </div>
          <span className="text-sm bg-red-600 text-white px-4 py-2 rounded-full animate-pulse font-semibold">
            🔴 EN VIVO AHORA
          </span>
        </div>
      </div>
      <div style={{ backgroundColor: '#A57F2C', height: '4px' }} />

      {/* Player + sidebar */}
      <div style={{ backgroundColor: '#111' }} className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: '#A57F2C' }}>En vivo</p>
          <h2 className="text-2xl font-bold mb-8 text-white">Señal en Vivo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Reproductor: Define la altura del Grid (con su 16/9) */}
            <div className="md:col-span-2">
              <HLSPlayer streamUrl={currentStream} />
            </div>

            {/* Sidebar de programación adaptativa sin scroll */}
            <div className="sidebar-container">
              <div className="sidebar-inner">
                
                {/* Al aire ahora (Altura estática) */}
                <div className={`sidebar-card ${programaActual ? 'active' : ''}`}>
                  <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#A57F2C' }}>Al aire ahora</p>
                  {programaActual ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#A57F2C' }}>EN VIVO</span>
                      </div>
                      <h3 className="text-lg font-bold mb-1 truncate">{programaActual.nombre}</h3>
                      <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{programaActual.conductor}</p>
                      <p className="text-xs mt-2 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {programaActual.hora_inicio} – {programaActual.hora_fin}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sin programa activo ahora</p>
                  )}
                </div>

                {/* A continuación (Ajusta su espacio sin necesidad de barra de desplazamiento) */}
                <div className="sidebar-card next">
                  <p className="text-xs tracking-widest uppercase mb-3 shrink-0" style={{ color: '#A57F2C' }}>A continuación</p>
                  
                  <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                    {proximos.length === 0 ? (
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sin más programas hoy</p>
                    ) : (
                      proximos.map(p => (
                        <div key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="pb-3 last:border-0 last:pb-0">
                          <p className="text-xs font-mono mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {p.hora_inicio} – {p.hora_fin}
                          </p>
                          <p className="text-sm font-semibold truncate">{p.nombre}</p>
                          {p.conductor && (
                            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.conductor}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Programación Completa — Acordeón */}
      <div style={{ backgroundColor: '#f8f9fa' }} className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          {programasTV.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Sin programación de TV para hoy.</p>
          ) : (
            <ProgramacionAcordeon
              programas={programasTV}
              onVerPrograma={setModal}
            />
          )}
        </div>
      </div>

      {/* Catálogo */}
      <div style={{ backgroundColor: 'white' }} className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#A57F2C', marginBottom: '6px' }}>
              Catálogo
            </p>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#611232', margin: 0 }}>Programas</h2>
          </div>

          {catalogoTV.length === 0 ? (
            <div style={{ border: '2px dashed #e5e7eb', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#f8f9fa', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span style={{ fontWeight: '800', fontSize: '18px', color: '#611232' }}>C</span>
              </div>
              <p style={{ fontWeight: '700', color: '#611232', marginBottom: '6px' }}>Sin programas publicados</p>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                Los posters aparecerán aquí cuando se agreguen desde el gestor de contenido.
              </p>
            </div>
          ) : (
            <div className="catalogo-grid">
              {catalogoTV.map(prog => (
                <button key={prog.id} onClick={() => setModalCat(prog)} className="catalogo-item">
                  {prog.imagen ? (
                    <img src={prog.imagen} alt={prog.nombre}
                      style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block', backgroundColor: '#f3f4f6' }}
                      loading="lazy" 
                      decoding="async"
                      onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2/3', background: 'linear-gradient(135deg, #611232, #8a1a46)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>{getIniciales(prog.nombre)}</span>
                      </div>
                    </div>
                  )}
                  <div style={{ padding: '12px', backgroundColor: 'white', borderTop: '1px solid #f0f0f0' }}>
                    <p style={{ fontWeight: '700', fontSize: '13px', color: '#1f2937', margin: '0 0 3px', lineHeight: '1.3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prog.nombre}
                    </p>
                    {prog.conductor && (
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prog.conductor}
                      </p>
                    )}
                    {prog.horario && (
                      <p style={{ fontSize: '11px', color: '#A57F2C', margin: 0, fontWeight: '600' }}>{prog.horario}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}