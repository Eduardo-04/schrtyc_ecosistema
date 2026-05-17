import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getNoticias, getUploadUrl } from '../services/api'

/* ── Embed helpers ───────────────────────────────────────────── */
function getEmbedUrl(url) {
  try {
    const u    = new URL(url.trim())
    const host = u.hostname.replace('www.', '')
    if (host === 'youtube.com' || host === 'youtu.be') {
      let id = u.searchParams.get('v')
        || (host === 'youtu.be' ? u.pathname.slice(1) : null)
        || (u.pathname.includes('/shorts/') ? u.pathname.split('/shorts/')[1] : null)
      if (id) return `https://www.youtube.com/embed/${id}?rel=0`
    }
    if (host === 'facebook.com' && u.pathname.includes('/videos/'))
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`
    if (host === 'tiktok.com') {
      const m = u.pathname.match(/\/video\/(\d+)/)
      if (m) return `https://www.tiktok.com/embed/v2/${m[1]}`
    }
    if (url.includes('spotify')) {
      if (url.includes('googleusercontent')) return url
      if (u.pathname.includes('/embed/')) return url
      const match = u.pathname.match(/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/)
      if (match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`
      return url
    }
  } catch { /* noop */ }
  return null
}

const isVideo = url => !!getEmbedUrl(url)

function VideoEmbed({ url }) {
  const src       = getEmbedUrl(url)
  const isTikTok  = url.includes('tiktok.com')
  const isSpotify = url.includes('spotify')
  if (!src) return null
  if (isSpotify) {
    return (
      <div style={{ width:'100%', borderRadius:'14px', overflow:'hidden' }}>
        <iframe src={src} title="Spotify Embed" width="100%" height="152" frameBorder="0"
          allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          style={{ border:'none', display:'block' }} />
      </div>
    )
  }
  return (
    <div style={{ position:'relative', width:'100%',
                  paddingBottom: isTikTok ? '177%' : '56.25%',
                  borderRadius:'14px', overflow:'hidden', backgroundColor:'#000' }}>
      <iframe src={src} title="media" allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }} />
    </div>
  )
}

/* ── Lightbox ────────────────────────────────────────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose, prev, next])

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.92)',
      zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <img src={getUploadUrl(images[idx])} alt={`Imagen ${idx+1}`} onClick={e => e.stopPropagation()}
        style={{ maxWidth:'90vw', maxHeight:'88vh', objectFit:'contain',
                 borderRadius:'10px', boxShadow:'0 24px 80px rgba(0,0,0,0.8)', userSelect:'none' }} />
      <button onClick={onClose} style={{ position:'fixed', top:'20px', right:'24px',
        background:'rgba(255,255,255,0.12)', border:'none', borderRadius:'50%', width:'40px', height:'40px',
        color:'white', fontSize:'20px', cursor:'pointer', display:'flex', alignItems:'center',
        justifyContent:'center', backdropFilter:'blur(4px)' }}>×</button>
      {images.length > 1 && <>
        <button onClick={e => { e.stopPropagation(); prev() }} style={{ position:'fixed', left:'16px',
          top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.12)', border:'none',
          borderRadius:'50%', width:'46px', height:'46px', color:'white', fontSize:'22px', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>‹</button>
        <button onClick={e => { e.stopPropagation(); next() }} style={{ position:'fixed', right:'16px',
          top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.12)', border:'none',
          borderRadius:'50%', width:'46px', height:'46px', color:'white', fontSize:'22px', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>›</button>
        <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
          background:'rgba(0,0,0,0.5)', borderRadius:'999px', padding:'6px 16px',
          color:'rgba(255,255,255,0.8)', fontSize:'13px', fontWeight:'600', backdropFilter:'blur(4px)' }}>
          {idx+1} / {images.length}
        </div>
        <div style={{ position:'fixed', bottom:'60px', left:'50%', transform:'translateX(-50%)',
          display:'flex', gap:'8px', padding:'8px 12px', background:'rgba(0,0,0,0.4)',
          borderRadius:'12px', backdropFilter:'blur(4px)' }} onClick={e => e.stopPropagation()}>
          {images.map((src, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{ width:'48px', height:'36px',
              borderRadius:'6px', overflow:'hidden', cursor:'pointer',
              border: i === idx ? '2px solid white' : '2px solid transparent',
              opacity: i === idx ? 1 : 0.5, transition:'all .2s' }}>
              <img src={getUploadUrl(src)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          ))}
        </div>
      </>}
    </div>
  )
}

/* ── Imagen de galería clicable ──────────────────────────────── */
function GaleriaImg({ src, alt, onClick }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <div onClick={onClick} style={{ borderRadius:'12px', overflow:'hidden', aspectRatio:'4/3',
      backgroundColor:'#f0f0f0', boxShadow:'0 2px 8px rgba(0,0,0,.08)',
      cursor:'pointer', position:'relative', transition:'transform .2s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 20px rgba(0,0,0,.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.08)' }}>
      <img src={getUploadUrl(src)} alt={alt}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .35s' }}
        onError={() => setOk(false)}
        onMouseEnter={e => e.target.style.transform='scale(1.05)'}
        onMouseLeave={e => e.target.style.transform='scale(1)'} />
    </div>
  )
}

/* ── Renderer de contenido ───────────────────────────────────── */
function ContenidoRenderer({ texto, imagenesGaleria, onImageClick }) {
  if (!texto?.trim()) return null
  const bloques = texto.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean)
  const partes  = bloques.length > 1 ? bloques : texto.split('\n').map(b => b.trim()).filter(Boolean)
  return (
    <div>
      {partes.map((bloque, i) => {
        const matchImg = bloque.match(/^\[imagen:(\d+)\]$/i)
        if (matchImg) {
          const n   = parseInt(matchImg[1], 10) - 1
          const url = imagenesGaleria[n]
          if (!url || isVideo(url)) return null
          return (
            <div key={i} style={{ margin:'28px 0', borderRadius:'14px', overflow:'hidden',
              cursor:'pointer', boxShadow:'0 4px 16px rgba(0,0,0,.1)' }}
              onClick={() => onImageClick(n)}>
              <img src={getUploadUrl(url)} alt={`Imagen ${n+1}`}
                style={{ width:'100%', maxHeight:'420px', objectFit:'cover', display:'block', transition:'transform .4s' }}
                onMouseEnter={e => e.target.style.transform='scale(1.02)'}
                onMouseLeave={e => e.target.style.transform='scale(1)'}
                onError={e => e.target.parentElement.style.display='none'} />
            </div>
          )
        }
        return (
          <p key={i} style={{ fontSize:'16px', color:'#374151', lineHeight:1.9, margin:'0 0 22px' }}>
            {bloque}
          </p>
        )
      })}
    </div>
  )
}

/* ── Sidebar ─────────────────────────────────────────────────── */
function Sidebar({ noticia, relacionadas, todasNoticias }) {
  const navigate = useNavigate()

  // Últimas 5 noticias publicadas distintas a la actual, ordenadas por fecha desc
  const ultimas = [...todasNoticias]
    .filter(n => !!n.publicada && n.id !== noticia.id)
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
    .slice(0, 5)

  const categorias = todasNoticias
    .filter(n => !!n.publicada)
    .reduce((acc, n) => {
      if (n.categoria) acc[n.categoria] = (acc[n.categoria] || 0) + 1
      return acc
    }, {})

  const irACategoria = (cat) => {
    navigate('/notas', { state: { filtroInicial: cat } })
    window.scrollTo(0, 0)
  }

  const WidgetHeader = ({ color, label }) => (
    <div style={{ backgroundColor: color, padding:'12px 18px', display:'flex',
                  alignItems:'center', gap:'10px', borderRadius:'10px 10px 0 0' }}>
      <span style={{ width:'3px', height:'15px', backgroundColor:'#A57F2C',
                     display:'inline-block', borderRadius:'2px', flexShrink:0 }} />
      <h3 style={{ margin:0, fontSize:'11px', fontWeight:'800', color:'white',
                   textTransform:'uppercase', letterSpacing:'1.2px' }}>
        {label}
      </h3>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
      <div style={{ position:'sticky', top:'20px', display:'flex', flexDirection:'column', gap:'28px' }}>

        {/* ── Relacionadas ── */}
        {relacionadas.length > 0 && (
          <div style={{ borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.07)' }}>
            <WidgetHeader color="#611232" label="Notas relacionadas" />
            <div style={{ backgroundColor:'white', padding:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>
              {relacionadas.map(r => (
                <Link key={r.id} to={`/notas/${r.id}`} style={{ textDecoration:'none' }}
                  onClick={() => window.scrollTo(0, 0)}>
                  <div style={{ display:'flex', gap:'12px', padding:'10px', borderRadius:'8px',
                    backgroundColor:'white', transition:'all .18s', cursor:'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor='#fdf5f7'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(97,18,50,.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor='white'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
                    <div style={{ width:'72px', minWidth:'72px', height:'60px', backgroundColor:'#611232',
                                  borderRadius:'8px', overflow:'hidden', flexShrink:0 }}>
                      {r.imagen
                        ? <img src={getUploadUrl(r.imagen)} alt={r.titulo} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e => e.target.style.display='none'} />
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>📡</div>
                      }
                    </div>
                    <div style={{ minWidth:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:'4px' }}>
                      <p style={{ fontSize:'10px', fontWeight:'700', color:'#A57F2C',
                                  textTransform:'uppercase', letterSpacing:'0.8px', margin:0 }}>
                        {r.categoria}
                      </p>
                      <h4 style={{ fontSize:'12.5px', fontWeight:'700', color:'#1f2937',
                        lineHeight:1.45, margin:0, display:'-webkit-box',
                        WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {r.titulo}
                      </h4>
                      {r.fecha && (
                        <span style={{ fontSize:'10px', color:'#9ca3af' }}>
                          {new Date(r.fecha.split(' ')[0].split('T')[0] + 'T12:00:00').toLocaleDateString('es-MX',
                            { day:'2-digit', month:'short', year:'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Últimas noticias — con imagen de portada ── */}
        {ultimas.length > 0 && (
          <div style={{ borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.07)' }}>
            <WidgetHeader color="#1f2937" label="Últimas noticias" />
            <div style={{ backgroundColor:'white', padding:'10px 14px 14px' }}>
              {ultimas.map((n, i) => (
                <Link key={n.id} to={`/notas/${n.id}`} style={{ textDecoration:'none' }}
                  onClick={() => window.scrollTo(0, 0)}>
                  <div style={{
                    display:'flex', gap:'12px', alignItems:'flex-start',
                    padding:'10px 8px',
                    borderBottom: i < ultimas.length - 1 ? '1px solid #f5f5f5' : 'none',
                    borderRadius:'8px', transition:'all .18s', cursor:'pointer',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor='#fdf5f7'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(97,18,50,.07)' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>

                    {/* Thumbnail */}
                    <div style={{
                      width:'64px', minWidth:'64px', height:'52px',
                      borderRadius:'8px', overflow:'hidden', flexShrink:0,
                      backgroundColor:'#611232',
                    }}>
                      {n.imagen
                        ? <img src={getUploadUrl(n.imagen)} alt={n.titulo}
                            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                        : null
                      }
                      <div style={{
                        width:'100%', height:'100%',
                        display: n.imagen ? 'none' : 'flex',
                        alignItems:'center', justifyContent:'center', fontSize:'16px',
                      }}>📡</div>
                    </div>

                    {/* Texto */}
                    <div style={{ minWidth:0, display:'flex', flexDirection:'column', gap:'4px' }}>
                      {n.categoria && (
                        <p style={{ fontSize:'10px', fontWeight:'700', color:'#A57F2C',
                                    textTransform:'uppercase', letterSpacing:'0.8px', margin:0 }}>
                          {n.categoria}
                        </p>
                      )}
                      <h4 style={{ fontSize:'12.5px', fontWeight:'600', color:'#374151',
                        lineHeight:1.45, margin:0, display:'-webkit-box',
                        WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {n.titulo}
                      </h4>
                      {n.fecha && (
                        <span style={{ fontSize:'10px', color:'#9ca3af' }}>
                          {new Date(n.fecha.split(' ')[0].split('T')[0] + 'T12:00:00').toLocaleDateString('es-MX',
                            { day:'2-digit', month:'short', year:'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Categorías — navegan a /notas con filtro ── */}
        {Object.keys(categorias).length > 0 && (
          <div style={{ borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.07)' }}>
            <WidgetHeader color="#374151" label="Categorías" />
            <div style={{ backgroundColor:'white', padding:'4px 14px 10px' }}>
              {Object.entries(categorias).map(([cat, count], i, arr) => (
                <div key={cat}
                  onClick={() => irACategoria(cat)}
                  style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'11px 8px',
                    borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                    borderRadius:'6px', transition:'all .15s', cursor:'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor='#fafafa'; e.currentTarget.style.paddingLeft='14px' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.paddingLeft='8px' }}>
                  <span style={{ fontSize:'13px', fontWeight:'600', color:'#374151',
                                 display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ width:'7px', height:'7px', borderRadius:'50%', flexShrink:0,
                                   backgroundColor: cat === noticia.categoria ? '#611232' : '#d1d5db',
                                   display:'inline-block' }} />
                    {cat}
                  </span>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:'white', padding:'2px 9px',
                    borderRadius:'999px',
                    backgroundColor: cat === noticia.categoria ? '#611232' : '#9ca3af' }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

/* ── Componente Principal ─────────────────────────────────────── */
export default function PaginaNotaDetalle() {
  const { id } = useParams()
  const [noticia,       setNoticia]  = useState(null)
  const [loading,       setLoading]  = useState(true)
  const [error,         setError]    = useState(null)
  const [relacionadas,  setRel]      = useState([])
  const [todasNoticias, setTodas]    = useState([])
  const [lightbox,      setLightbox] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    getNoticias()
      .then(data => {
        const encontrada = data.find(n => String(n.id) === String(id))
        if (!encontrada || !encontrada.publicada) {
          setError('Noticia no encontrada o no disponible.')
          return
        }
        setNoticia(encontrada)
        setTodas(data.filter(n => !!n.publicada))
        setRel(data.filter(n =>
          !!n.publicada && n.id !== encontrada.id && n.categoria === encontrada.categoria
        ).slice(0, 4))
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      <div style={{ textAlign:'center', color:'#9ca3af' }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid #f0f0f0',
                      borderTop:'3px solid #611232', borderRadius:'50%',
                      animation:'spin .8s linear infinite', margin:'0 auto 14px' }} />
        <p style={{ margin:0, fontSize:'14px' }}>Cargando noticia...</p>
      </div>
    </div>
  )

  if (error || !noticia) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', padding:'40px' }}>
        <p style={{ fontSize:'48px', marginBottom:'16px' }}>📭</p>
        <h2 style={{ fontSize:'20px', fontWeight:'700', color:'#1f2937', marginBottom:'12px' }}>
          {error || 'Noticia no disponible'}
        </h2>
        <Link to="/notas" style={{ color:'#611232', fontWeight:'600', fontSize:'14px', textDecoration:'none' }}>
          ← Volver a noticias
        </Link>
      </div>
    </div>
  )

  let mediaItems = []
  try {
    let raw = []
    if (noticia.imagenes) {
      if (Array.isArray(noticia.imagenes))             raw = noticia.imagenes
      else if (noticia.imagenes.trim().startsWith('[')) raw = JSON.parse(noticia.imagenes)
      else raw = noticia.imagenes.split('\n').map(u => u.trim()).filter(Boolean)
    }
    mediaItems = raw.map(url => {
      const isSpotify = url.toLowerCase().includes('spotify')
      if (isSpotify) return { type:'audio', url }
      return { type: isVideo(url) ? 'video' : 'image', url }
    })
  } catch { mediaItems = [] }

  const soloImagenes = mediaItems.filter(m => m.type === 'image').map(m => m.url)
  const soloAudios   = mediaItems.filter(m => m.type === 'audio')
  const soloVideos   = mediaItems.filter(m => m.type === 'video')

  const usaImagenesInline = noticia.contenido ? /\[imagen:\d+\]/i.test(noticia.contenido) : false
  const openLightbox = (index) => setLightbox({ images: soloImagenes, index })

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .nota-fade { animation: fadeUp .35s ease both }
        .btn-volver:hover { background-color: rgba(97,18,50,.07) !important }

        .nota-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 52px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .nota-grid { grid-template-columns: 1fr; gap: 40px; }
        }
      `}</style>

      {lightbox && (
        <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}

      {/* ── Breadcrumb ── */}
      <div style={{ backgroundColor:'#611232', padding:'18px 0' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px',
                        fontSize:'12px', color:'rgba(255,255,255,.5)', flexWrap:'wrap' }}>
            <Link to="/"      style={{ color:'rgba(255,255,255,.5)', textDecoration:'none' }}>Inicio</Link>
            <span>/</span>
            <Link to="/notas" style={{ color:'rgba(255,255,255,.5)', textDecoration:'none' }}>Noticias</Link>
            <span>/</span>
            <span style={{ color:'rgba(255,255,255,.85)' }}>{noticia.categoria}</span>
          </div>
        </div>
      </div>
      <div style={{ background:'linear-gradient(90deg,#611232,#A57F2C,#611232)', height:'3px' }} />

      <div style={{ backgroundColor:'white', padding:'48px 0 80px' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 24px' }}>
          <div className="nota-fade">

            {/* ── Encabezado fuera del grid ── */}
            <div style={{ marginBottom:'32px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'16px' }}>
                {noticia.categoria && (
                  <span style={{ backgroundColor:'#611232', color:'white', padding:'4px 14px',
                                 borderRadius:'999px', fontSize:'11px', fontWeight:'700',
                                 textTransform:'uppercase', letterSpacing:'1px' }}>
                    {noticia.categoria}
                  </span>
                )}
                {noticia.fecha && (
                  <span style={{ fontSize:'13px', color:'#9ca3af' }}>
                    📅 {new Date(noticia.fecha.split(' ')[0].split('T')[0] + 'T12:00:00').toLocaleDateString('es-MX',
                      { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
                  </span>
                )}
                {noticia.autor && (
                  <span style={{ fontSize:'13px', color:'#9ca3af' }}>✍️ {noticia.autor}</span>
                )}
              </div>
              <h1 style={{ fontSize:'clamp(24px,4vw,38px)', fontWeight:'800', color:'#1f2937',
                           lineHeight:1.2, margin:0 }}>
                {noticia.titulo}
              </h1>
            </div>

            {/* ── Grid: contenido + sidebar ── */}
            <div className="nota-grid">

              <main>
                {/* Imagen de portada */}
                {noticia.imagen && (
                  <div style={{
                    marginBottom:'32px', borderRadius:'16px', overflow:'hidden',
                    boxShadow:'0 4px 24px rgba(0,0,0,.10)', backgroundColor:'#f5f5f5', lineHeight:0,
                  }}>
                    <img
                      src={getUploadUrl(noticia.imagen)}
                      alt={noticia.titulo}
                      style={{
                        width:'100%', height:'auto', maxHeight:'520px',
                        objectFit:'contain', objectPosition:'center',
                        display:'block', backgroundColor:'#f5f5f5',
                      }}
                      onError={e => e.target.parentElement.style.display='none'}
                    />
                  </div>
                )}

                {/* Contenido */}
                {noticia.contenido?.trim() && (
                  <div style={{ marginBottom:'40px' }}>
                    <ContenidoRenderer
                      texto={noticia.contenido}
                      imagenesGaleria={soloImagenes}
                      onImageClick={openLightbox}
                    />
                  </div>
                )}

                {/* Galería */}
                {soloImagenes.length > 0 && (
                  <div style={{ marginBottom:'44px' }}>
                    <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#1f2937',
                                 marginBottom:'4px', display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ width:'4px', height:'18px', backgroundColor:'#611232',
                                     display:'inline-block', borderRadius:'2px' }} />
                      Galería de imágenes
                    </h3>
                    {usaImagenesInline && (
                      <p style={{ fontSize:'12px', color:'#9ca3af', margin:'4px 0 14px' }}>
                        Algunas imágenes aparecen integradas en el texto. Aquí puedes verlas todas.
                      </p>
                    )}
                    {!usaImagenesInline && <div style={{ marginBottom:'14px' }} />}

                    {soloImagenes.length === 1 && (
                      <div onClick={() => openLightbox(0)} style={{ borderRadius:'14px', overflow:'hidden',
                        boxShadow:'0 2px 12px rgba(0,0,0,.1)', cursor:'pointer' }}>
                        <img src={getUploadUrl(soloImagenes[0])} alt="Galería"
                          style={{ width:'100%', height:'420px', objectFit:'cover', display:'block', transition:'transform .4s' }}
                          onMouseEnter={e => e.target.style.transform='scale(1.02)'}
                          onMouseLeave={e => e.target.style.transform='scale(1)'}
                          onError={e => e.target.parentElement.style.display='none'} />
                      </div>
                    )}
                    {soloImagenes.length === 2 && (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                        {soloImagenes.map((url, i) => <GaleriaImg key={i} src={url} alt={`Imagen ${i+1}`} onClick={() => openLightbox(i)} />)}
                      </div>
                    )}
                    {soloImagenes.length === 3 && (
                      <div style={{ display:'grid', gap:'12px' }}>
                        <div onClick={() => openLightbox(0)} style={{ borderRadius:'14px', overflow:'hidden', height:'280px', boxShadow:'0 2px 8px rgba(0,0,0,.08)', cursor:'pointer' }}>
                          <img src={getUploadUrl(soloImagenes[0])} alt="Imagen 1" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .4s' }} onMouseEnter={e => e.target.style.transform='scale(1.02)'} onMouseLeave={e => e.target.style.transform='scale(1)'} onError={e => e.target.parentElement.style.display='none'} />
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                          {soloImagenes.slice(1).map((url, i) => <GaleriaImg key={i} src={url} alt={`Imagen ${i+2}`} onClick={() => openLightbox(i+1)} />)}
                        </div>
                      </div>
                    )}
                    {soloImagenes.length === 4 && (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                        {soloImagenes.map((url, i) => <GaleriaImg key={i} src={url} alt={`Imagen ${i+1}`} onClick={() => openLightbox(i)} />)}
                      </div>
                    )}
                    {soloImagenes.length >= 5 && (
                      <div style={{ display:'grid', gap:'12px' }}>
                        <div onClick={() => openLightbox(0)} style={{ borderRadius:'14px', overflow:'hidden', height:'320px', boxShadow:'0 2px 8px rgba(0,0,0,.08)', cursor:'pointer' }}>
                          <img src={getUploadUrl(soloImagenes[0])} alt="Imagen 1" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .4s' }} onMouseEnter={e => e.target.style.transform='scale(1.02)'} onMouseLeave={e => e.target.style.transform='scale(1)'} onError={e => e.target.parentElement.style.display='none'} />
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'12px' }}>
                          {soloImagenes.slice(1).map((url, i) => <GaleriaImg key={i} src={url} alt={`Imagen ${i+2}`} onClick={() => openLightbox(i+1)} />)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Audios */}
                {soloAudios.length > 0 && (
                  <div style={{ marginBottom:'44px' }}>
                    <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#1f2937',
                                 marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ width:'4px', height:'18px', backgroundColor:'#1db954', display:'inline-block', borderRadius:'2px' }} />
                      Audios y Podcasts
                    </h3>
                    <div style={{ display:'grid', gridTemplateColumns: soloAudios.length === 1 ? '1fr' : '1fr 1fr', gap:'16px', alignItems:'start' }}>
                      {soloAudios.map((m, i) => <VideoEmbed key={i} url={m.url} />)}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {soloVideos.length > 0 && (
                  <div style={{ marginBottom:'44px' }}>
                    <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#1f2937',
                                 marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ width:'4px', height:'18px', backgroundColor:'#dc2626', display:'inline-block', borderRadius:'2px' }} />
                      Videos
                    </h3>
                    <div style={{ display:'grid', gridTemplateColumns: soloVideos.length === 1 ? '1fr' : '1fr 1fr', gap:'16px', alignItems:'start' }}>
                      {soloVideos.map((m, i) => <VideoEmbed key={i} url={m.url} />)}
                    </div>
                  </div>
                )}

                {/* Footer nota */}
                <div style={{ borderTop:'1px solid #f0f0f0', paddingTop:'28px',
                              display:'flex', alignItems:'center', justifyContent:'space-between',
                              flexWrap:'wrap', gap:'14px' }}>
                  <Link to="/notas" className="btn-volver" style={{
                    display:'inline-flex', alignItems:'center', gap:'8px', color:'#611232',
                    fontSize:'13px', fontWeight:'700', textDecoration:'none', padding:'10px 20px',
                    border:'1.5px solid #611232', borderRadius:'10px', transition:'background-color .2s' }}>
                    ← Volver a noticias
                  </Link>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'12px', color:'#9ca3af' }}>Compartir:</span>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(noticia.titulo)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer"
                      style={{ padding:'7px 14px', borderRadius:'8px', backgroundColor:'#000', color:'white', fontSize:'12px', fontWeight:'600', textDecoration:'none' }}>𝕏</a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer"
                      style={{ padding:'7px 14px', borderRadius:'8px', backgroundColor:'#1877f2', color:'white', fontSize:'12px', fontWeight:'600', textDecoration:'none' }}>Facebook</a>
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(noticia.titulo + ' ' + window.location.href)}`} target="_blank" rel="noreferrer"
                      style={{ padding:'7px 14px', borderRadius:'8px', backgroundColor:'#25d366', color:'white', fontSize:'12px', fontWeight:'600', textDecoration:'none' }}>WhatsApp</a>
                  </div>
                </div>
              </main>

              <aside>
                <Sidebar noticia={noticia} relacionadas={relacionadas} todasNoticias={todasNoticias} />
              </aside>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}