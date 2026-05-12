import { useEffect, useState, useRef } from 'react'
import { getEstaciones, getProgramacionHoy, getProgramas } from '../services/api'
import { estaEnVivo, esFuturo, getIniciales } from '../utils/date'
import { esUrlValida, detectarTipoMedia, getYoutubeThumbnail, normalizarEmbedUrl } from '../utils/media'

// ── Helpers Específicos ───────────────────────────────────────
const colorEmbed = (url) => ({
  youtube:    { bg: '#FF0000', label: 'YT' },
  facebook:   { bg: '#1877F2', label: 'FB' },
  soundcloud: { bg: '#FF5500', label: 'SC' },
  spotify:    { bg: '#1DB954', label: 'SP' },
  generic:    { bg: '#611232', label: 'EM' },
}[detectarTipoMedia(url)])

const alturaEmbed = (url) => {
  if (detectarTipoMedia(url) === 'soundcloud') return 166
  return null
}

const tipoLabelSpotify = (url) => {
  const m = url.match(/spotify\.com(?:\/intl-[a-z]+)?\/(track|episode|show|playlist|album)\//)
  const map = { track: 'Canción', episode: 'Episodio', show: 'Podcast', playlist: 'Playlist', album: 'Álbum' }
  return m ? (map[m[1]] || 'Contenido') : 'Contenido'
}

const getCardImage = (prog) => {
  if (prog.imagen) return prog.imagen
  const yt = (prog.embeds || []).find(e => detectarTipoMedia(e.url) === 'youtube')
  if (yt) return getYoutubeThumbnail(yt.url)
  return null
}

// ── SVG íconos ────────────────────────────────────────────────
const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
)

const IconPause = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="3" width="4" height="18" rx="1" />
    <rect x="15" y="3" width="4" height="18" rx="1" />
  </svg>
)

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

// ── Barras de sonido ──────────────────────────────────────────
function SoundBars({ playing }) {
  const bars = [
    { anim: 'bar1', dur: '0.9s', delay: '0s' },
    { anim: 'bar2', dur: '0.7s', delay: '0.15s' },
    { anim: 'bar3', dur: '1.0s', delay: '0.05s' },
    { anim: 'bar4', dur: '0.8s', delay: '0.25s' },
    { anim: 'bar5', dur: '0.75s', delay: '0.1s' },
  ]
  return (
    <div className="sound-bars">
      {bars.map((b, i) => (
        <div key={i} className="sound-bar" style={{
          height: playing ? undefined : '4px',
          animation: playing ? `${b.anim} ${b.dur} ease-in-out ${b.delay} infinite` : 'none',
          willChange: playing ? 'height, transform' : 'auto'
        }} />
      ))}
    </div>
  )
}

// ── Onda de audio ─────────────────────────────────────────────
function AudioWave({ playing }) {
  if (!playing) return null
  return (
    <div className="audio-wave-container">
      <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="audio-wave-svg">
        <path style={{ animation: 'wave 3s ease-in-out infinite', fill: '#A57F2C' }}
          d="M0,20 C20,20 20,5 40,5 C60,5 60,35 80,35 C100,35 100,10 120,10 C140,10 140,30 160,30 C180,30 180,15 200,15 L200,50 L0,50 Z" />
      </svg>
      <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="audio-wave-svg">
        <path style={{ animation: 'wave2 4.5s ease-in-out infinite', fill: '#A57F2C', opacity: 0.6 }}
          d="M0,30 C20,30 20,15 40,15 C60,15 60,38 80,38 C100,38 100,12 120,12 C140,12 140,35 160,35 C180,35 180,22 200,22 L200,50 L0,50 Z" />
      </svg>
      <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="audio-wave-svg">
        <path style={{ animation: 'wave3 2.8s ease-in-out infinite', fill: '#611232', opacity: 0.5 }}
          d="M0,22 C20,22 20,38 40,38 C60,38 60,10 80,10 C100,10 100,30 120,30 C140,30 140,14 160,14 C180,14 180,36 200,36 L200,50 L0,50 Z" />
      </svg>
    </div>
  )
}

// ── Spotify Card ──────────────────────────────────────────────
function SpotifyCard({ embed }) {
  const url   = normalizarEmbedUrl(embed.url)
  const label = tipoLabelSpotify(embed.url)

  const abrir = (e) => {
    e.stopPropagation()
    e.preventDefault()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onClick={abrir}
      role="link"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && abrir(e)}
      className="spotify-card"
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="#1DB954" style={{ flexShrink: 0 }}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#1DB954', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 3px' }}>
          Spotify · {label}
        </p>
        <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {embed.titulo || 'Abrir en Spotify'}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '2px 0 0' }}>
          Toca para abrir en Spotify
        </p>
        </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1DB954" strokeWidth="2" style={{ flexShrink: 0 }}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
      </svg>
    </div>
  )
}

// ── EmbedItem ─────────────────────────────────────────────────
function EmbedItem({ embed }) {
  if (!esUrlValida(embed.url)) return null

  const tipo    = detectarTipoMedia(embed.url)
  const c       = colorEmbed(embed.url)
  const urlNorm = normalizarEmbedUrl(embed.url)
  const altura  = alturaEmbed(embed.url)
  const esSpotify = tipo === 'spotify'

  return (
    <div className="embed-card">
      <div className="embed-header" style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.bg, flexShrink: 0 }} />
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {embed.titulo || (esSpotify ? 'Audio / Podcast' : 'Video / YouTube')}
        </span>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {esSpotify
          ? <SpotifyCard embed={embed} />
          : (
            <iframe 
              src={urlNorm} 
              style={{ width: '100%', height: altura ? `${altura}px` : 'auto', aspectRatio: altura ? 'auto' : '16/9', display: 'block', border: 'none', backgroundColor: '#000' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={embed.titulo || 'Embed'} 
            />
          )
        }
      </div>
    </div>
  )
}

// ── Modal Programación del día ────────────────────────────────
function ModalPrograma({ programa, onClose }) {
  if (!programa) return null
  const vivo = estaEnVivo(programa.hora_inicio, programa.hora_fin)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
        onClick={e => e.stopPropagation()}>
        {programa.imagen
          ? <img src={programa.imagen} alt={programa.nombre} className="w-full h-48 object-cover" />
          : <div style={{ background: 'linear-gradient(135deg, #611232 0%, #A57F2C 100%)', height: '160px' }}
              className="flex flex-col items-center justify-center text-white p-6 gap-3">
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>{getIniciales(programa.nombre)}</span>
              </div>
              <p className="font-bold text-lg text-center">{programa.nombre}</p>
              {vivo && <span className="text-xs bg-red-500 px-3 py-1 rounded-full animate-pulse">EN VIVO AHORA</span>}
            </div>
        }
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
            <div className="rounded-xl overflow-hidden mb-4 bg-black" style={{ aspectRatio: '16/9' }}>
              <iframe 
                src={programa.youtube_url.replace('watch?v=', 'embed/')}
                className="w-full h-full" 
                allowFullScreen 
                title={programa.nombre}
                loading="lazy"
              />
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

// ── Modal Catálogo ────────────────────────────────────────────
function ModalCatalogo({ prog, onClose }) {
  if (!prog) return null
  const embeds    = (prog.embeds || []).filter(e => e.url)
  const imgSrc    = getCardImage(prog)
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

          {/* Video / YouTube Section */}
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

// ── Radio Player ──────────────────────────────────────────────
function RadioPlayer({ radios, seleccionada, setSeleccionada }) {
  const [playing, setPlaying]           = useState(false)
  const [error, setError]               = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!seleccionada) return
    setPlaying(false)
    setError(false)
    const audio = audioRef.current
    if (audio) audio.pause()
  }, [seleccionada?.id])

  const toggle = async () => {
    if (!seleccionada?.streamUrl || !seleccionada?.activo) return
    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
      return
    }
    setError(false)
    const audio = audioRef.current
    audio.pause()
    audio.src = seleccionada.streamUrl.replace(/\/?$/, '/;')
    audio.load()
    try {
      await audio.play()
      setPlaying(true)
    } catch (err) {
      console.error('Stream error:', err)
      setPlaying(false)
      setError(true)
    }
  }

  if (!radios.length) return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '40px', textAlign: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>No hay estaciones de radio configuradas.</p>
    </div>
  )

  const actual          = seleccionada || radios[0]
  const secundarias     = radios.filter(r => r.id !== actual?.id)
  const puedeReproducir = actual?.activo && actual?.streamUrl

  return (
    <div className="radio-player-container">
      <audio
        ref={audioRef}
        preload="none"
        style={{ display: 'none' }}
        onPause={() => setPlaying(false)}
        onPlay={()  => setPlaying(true)}
        onError={(e) => {
          if (!e.target.src || e.target.src === window.location.href) return
          setPlaying(false)
          setError(true)
        }}
      />

      {/* Player principal */}
      <div className={`player-main ${playing ? 'playing' : 'paused'}`}>
        {playing && (
          <>
            <div className="pulse-ring pulse-ring-1" />
            <div className="pulse-ring pulse-ring-2" />
          </>
        )}

        <AudioWave playing={playing} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            {actual?.imagen
              ? <img src={actual.imagen} alt={actual.nombre}
                  style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }}
                  onError={e => e.target.style.display = 'none'} />
              : <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>{getIniciales(actual?.nombre, 'RC')}</span>
                </div>
            }
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: actual?.activo ? '#A57F2C' : 'rgba(255,255,255,0.28)', marginBottom: '4px' }}>
                {actual?.activo ? 'En vivo' : 'Offline'}
              </p>
              <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0, lineHeight: 1.1 }}>{actual?.nombre}</h3>
                </div>
          </div>
          {actual?.descripcion && (
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '20px' }}>
              {actual.descripcion}
            </p>
          )}
        </div>

        {error && (
          <p style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: '#A57F2C', backgroundColor: 'rgba(165,127,44,0.1)', border: '1px solid rgba(165,127,44,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
            ⚠️ No se pudo conectar al stream. Puede que el servidor esté caído o el formato no sea compatible.
          </p>
        )}

        {puedeReproducir ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
            <button onClick={toggle} className={`play-toggle-btn ${playing ? 'playing' : 'paused'}`}>
              {playing ? <IconPause /> : <IconPlay />}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontWeight: '700', fontSize: '15px', margin: 0 }}>
                {playing ? 'Reproduciendo ahora' : 'Listo para escuchar'}
              </p>
              {playing
                ? <SoundBars playing={playing} />
                : <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0 }}>{actual.nombre}</p>
              }
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)', position: 'relative', zIndex: 1 }}>
            {!actual?.activo ? 'Estación inactiva' : 'Sin URL de stream configurada'}
          </p>
        )}
      </div>

      {/* Lista estaciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="station-list-container">
          <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#A57F2C', marginBottom: '14px' }}>
            Red de frecuencias
          </p>
          {secundarias.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>Solo hay una estación configurada.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {secundarias.map((e, i) => (
                <button key={e.id} onClick={() => setSeleccionada(e)} className="station-btn">
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', fontVariantNumeric: 'tabular-nums' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '13px', margin: '0 0 2px', lineHeight: 1.2 }}>{e.nombre}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                      {e.activo && e.streamUrl ? 'Stream disponible' : 'Sin stream'}
                    </p>
                  </div>
                  <span style={{ fontSize: '11px' }}>
                    {e.activo && e.streamUrl ? '🔴' : '—'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Acordeón Programación ─────────────────────────────────────
function ProgramacionAcordeon({ programas, estaciones = [], onVerPrograma, estacionFiltroInicial }) {
  const [abierto, setAbierto]         = useState(false)
  const [estacionFiltro, setEstacion] = useState('Todas')

  // ✅ Sincronizar el filtro cuando cambia la estación en el reproductor
  useEffect(() => {
    if (estacionFiltroInicial) {
      setEstacion(estacionFiltroInicial);
    }
  }, [estacionFiltroInicial]);

  // ✅ Función para normalizar y evitar que los acentos o mayúsculas rompan el filtro
  const normalizarTexto = (txt = "") =>
    txt
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  // ✅ Construimos los filtros usando la lista de estaciones de la API
  const nombresEstaciones = [
    "Todas",
    ...estaciones.map(e => e.nombre).filter(Boolean)
  ];

  // ✅ Filtramos comparando los textos ya normalizados
  const filtrados =
    estacionFiltro === "Todas"
      ? programas
      : programas.filter(
          (p) =>
            normalizarTexto(p.estacion) === normalizarTexto(estacionFiltro)
        );

  const programaEnVivo = programas.find(p => estaEnVivo(p.hora_inicio, p.hora_fin))

  return (
    <div className="program-accordion">
      {/* Cabecera — siempre visible */}
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
              Programación del Día
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <span style={{
              fontSize: '12px', fontWeight: '700',
              backgroundColor: abierto ? 'rgba(255,255,255,0.18)' : '#f3f4f6',
              color: abierto ? 'white' : '#6b7280',
              padding: '3px 10px', borderRadius: '999px',
            }}>
              {filtrados.length} programa{filtrados.length !== 1 ? 's' : ''}
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

      {/* Cuerpo */}
      {abierto && (
        <div className="accordion-body">
          {nombresEstaciones.length > 1 && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {nombresEstaciones.map(n => (
                <button key={n} onClick={() => setEstacion(n)}
                  style={{ padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: estacionFiltro === n ? '#611232' : '#f9fafb', color: estacionFiltro === n ? '#fff' : '#374151', border: estacionFiltro === n ? 'none' : '1px solid #e5e7eb' }}>
                  {n}
                </button>
              ))}
            </div>
          )}

          {filtrados.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>Sin programación de radio para hoy.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horario</th>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Programa</th>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estación</th>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conductor</th>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="hidden md:table-cell">Descripción</th>
                    <th style={{ padding: '10px 20px' }} />
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(p => {
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
                            <span className="animate-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px', fontSize: '10px', fontWeight: '700', color: 'white', backgroundColor: '#dc2626', padding: '2px 8px', borderRadius: '999px' }}>
                              EN VIVO
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontWeight: '700', fontSize: '13px', color: '#1f2937' }}>{p.nombre}</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>{p.estacion}</td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>{p.conductor}</td>
                        <td style={{ padding: '14px 20px', fontSize: '12px', color: '#9ca3af' }} className="hidden md:table-cell">
                          {p.descripcion ? p.descripcion.slice(0, 60) + (p.descripcion.length > 60 ? '…' : '') : '—'}
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
export default function PaginaRadio() {
  const [estaciones, setEstaciones] = useState([])
  const [programas, setProgramas]   = useState([])
  const [catalogo, setCatalogo]     = useState([])
  const [modal, setModal]           = useState(null)
  const [modalCat, setModalCat]     = useState(null)
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null)

  useEffect(() => {
    getEstaciones().then(setEstaciones).catch(console.error)
    getProgramacionHoy().then(setProgramas).catch(console.error)
    getProgramas().then(setCatalogo).catch(console.error)
  }, [])

  const radios = estaciones.filter(e => e.tipo === 'Radio')
  
  useEffect(() => {
    if (!estacionSeleccionada && radios.length > 0) {
      setEstacionSeleccionada(radios.find(r => r.activo && r.streamUrl) || radios[0])
    }
  }, [radios, estacionSeleccionada])

  const programasRadioTodos = programas.filter(p => p.tipo === 'Radio')
  const programasEstacionActual = programasRadioTodos.filter(p => !estacionSeleccionada || p.estacion === estacionSeleccionada.nombre)
  
  const programaEnVivo = programasEstacionActual.find(p => estaEnVivo(p.hora_inicio, p.hora_fin))
  
  const proximos = programasEstacionActual
    .filter(p => esFuturo(p.hora_inicio))
    .sort((a, b) => {
      const [hA, mA] = a.hora_inicio.split(':').map(Number)
      const [hB, mB] = b.hora_inicio.split(':').map(Number)
      return (hA * 60 + mA) - (hB * 60 + mB)
    })
    .slice(0, 4)
    
  const catalogoRadio = catalogo.filter(p => p.tipo === 'Radio' && p.activo !== false)

  return (
    <>
      <ModalPrograma programa={modal}  onClose={() => setModal(null)} />
      <ModalCatalogo prog={modalCat}   onClose={() => setModalCat(null)} />

      {/* Hero */}
      <div style={{ backgroundColor: '#611232' }} className="text-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-widest uppercase opacity-60 mb-2">Transmisiones</p>
            <h1 className="text-3xl font-bold">Radio Chiapas</h1>
            <p className="opacity-70 text-sm mt-2">Frecuencias FM con cobertura en la geografía estatal.</p>
          </div>
          {programaEnVivo && (
            <span className="text-sm bg-red-600 text-white px-4 py-2 rounded-full animate-pulse font-semibold">
              🔴 EN VIVO AHORA
            </span>
          )}
        </div>
      </div>
      <div style={{ backgroundColor: '#A57F2C', height: '4px' }} />

      {/* Player */}
      <div style={{ backgroundColor: '#111' }} className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: '#A57F2C' }}>En vivo</p>
          <h2 className="text-2xl font-bold mb-8 text-white">Estaciones de Radio</h2>
          <RadioPlayer 
            radios={radios} 
            seleccionada={estacionSeleccionada}
            setSeleccionada={setEstacionSeleccionada} 
          />
        </div>
      </div>

      {/* Al aire + Próximos */}
      {(programaEnVivo || proximos.length > 0) && (
        <div style={{ backgroundColor: '#0f0f0f' }} className="pb-14">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div style={{ backgroundColor: '#1a1a1a', borderRadius: '16px', border: programaEnVivo ? '1px solid rgba(165,127,44,0.3)' : '1px solid rgba(255,255,255,0.06)', padding: '20px', color: 'white' }}>
                <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#A57F2C', marginBottom: '12px' }}>Al aire ahora</p>
                {programaEnVivo ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '999px', backgroundColor: '#f87171' }} className="animate-pulse" />
                      <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#A57F2C' }}>EN VIVO</span>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '4px' }}>{programaEnVivo.nombre}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{programaEnVivo.conductor}</p>
                    <p style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>{programaEnVivo.hora_inicio} – {programaEnVivo.hora_fin}</p>
                  </>
                ) : (
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Sin programa activo ahora</p>
                )}
              </div>
              <div className="md:col-span-2" style={{ backgroundColor: '#1a1a1a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', color: 'white' }}>
                <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#A57F2C', marginBottom: '12px' }}>A continuación</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {proximos.map(p => (
                    <div key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                      <p style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>{p.hora_inicio} – {p.hora_fin}</p>
                      <p style={{ fontSize: '13px', fontWeight: '700' }}>{p.nombre}</p>
                      {p.estacion && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{p.estacion}</p>}
                    </div>
                  ))}
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Programación del Día — Acordeón */}
      <div style={{ backgroundColor: '#f8f9fa' }} className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          {programasRadioTodos.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Sin programación de radio para hoy.</p>
          ) : (
            <ProgramacionAcordeon
              programas={programasRadioTodos}
              estaciones={radios}
              onVerPrograma={setModal}
              estacionFiltroInicial={estacionSeleccionada?.nombre}
            />
          )}
        </div>
      </div>

      {/* Catálogo */}
      <div style={{ backgroundColor: 'white' }} className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#A57F2C', marginBottom: '6px' }}>Catálogo</p>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#611232', margin: 0 }}>Programas</h2>
          </div>

          {catalogoRadio.length === 0 ? (
            <div style={{ border: '2px dashed #e5e7eb', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <div className="flex -space-x-3">
                {radios.slice(0, 5).map(r => (
                  <div key={r.id} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #611232', backgroundColor: '#8a1a45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                    {getIniciales(r.nombre)}
                  </div>
                ))}
              </div>
              <p style={{ fontWeight: '700', color: '#611232', marginBottom: '6px' }}>Sin programas publicados</p>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>Los programas aparecerán aquí cuando se agreguen desde el gestor de contenido.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {catalogoRadio.map(prog => {
                const imgSrc    = getCardImage(prog)
                const embedsAct = (prog.embeds || []).filter(e => esUrlValida(e.url))
                return (
                  <button key={prog.id} onClick={() => setModalCat(prog)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '14px', overflow: 'hidden', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                      {imgSrc
                        ? <img src={imgSrc} alt={prog.nombre}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy" 
                            decoding="async"
                            onError={e => e.target.style.display = 'none'} />
                        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #611232, #8a1a46)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>{getIniciales(prog.nombre, 'P')}</span>
                            </div>
                          </div>
                      }
                      {embedsAct.length > 0 && (
                        <div style={{ position: 'absolute', bottom: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                          {embedsAct.slice(0, 3).map((em, i) => {
                            const c = colorEmbed(em.url)
                            return <span key={i} style={{ backgroundColor: c.bg, color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>{c.label}</span>
                          })}
                          {embedsAct.length > 3 && (
                            <span style={{ backgroundColor: '#333', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>+{embedsAct.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px', backgroundColor: 'white', borderTop: '1px solid #f0f0f0' }}>
                      <p style={{ fontWeight: '700', fontSize: '13px', color: '#1f2937', margin: '0 0 3px', lineHeight: '1.3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prog.nombre}</p>
                      {prog.conductor && <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prog.conductor}</p>}
                      {prog.horario   && <p style={{ fontSize: '11px', color: '#A57F2C', margin: 0, fontWeight: '600' }}>{prog.horario}</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}