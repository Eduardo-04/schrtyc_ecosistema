import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNoticias, getUploadUrl } from '../services/api'

export default function PaginaNotas() {
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('Todas')
  const [imageFormats, setImageFormats] = useState({})

  useEffect(() => {
    getNoticias()
      .then(data => {
        const publicadas = data.filter(n => !!n.publicada)
        setNoticias(publicadas)

        publicadas.forEach(n => {
          if (!n.imagen) return
          const img = new Image()
          img.onload = () => {
            const ratio = img.naturalHeight / img.naturalWidth
            let format = 'landscape'
            if (ratio > 1.1) format = 'portrait'
            setImageFormats(prev => ({ ...prev, [n.id]: format }))
          }
          img.onerror = () => {
            setImageFormats(prev => ({ ...prev, [n.id]: 'landscape' }))
          }
          img.src = getUploadUrl(n.imagen)
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const categorias = ['Todas', ...new Set(noticias.map(n => n.categoria).filter(Boolean))]
  const filtradas = filtro === 'Todas' ? noticias : noticias.filter(n => n.categoria === filtro)
  const destacada = filtradas.find(n => !!n.destacada) || filtradas[0]
  const resto = filtradas.filter(n => n.id !== destacada?.id)

  const formatFecha = (fecha) => {
    if (!fecha) return ''
    return new Date(fecha.split(' ')[0].split('T')[0] + 'T12:00:00').toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const renderCard = (n) => {
    const format = imageFormats[n.id] || 'landscape'
    const isPortrait = format === 'portrait'

    if (isPortrait) {
      return (
        <article className="card-radical card-portrait">
          <div className="portrait-media">
            {n.imagen ? (
              <img
                src={getUploadUrl(n.imagen)}
                alt={n.titulo}
                className="radical-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div className="fallback-box">📡</div>
            )}

            {n.categoria && <span className="categoria-rail">{n.categoria}</span>}
          </div>

          <div className="portrait-content">
            <div className="eyebrow">Nota institucional</div>

            <h3 className="card-title portrait-title">{n.titulo}</h3>

            {n.descripcion && (
              <p className="card-desc portrait-desc">{n.descripcion}</p>
            )}

            <div className="meta-wrap">
              {n.fecha && (
                <span className="meta-chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  {formatFecha(n.fecha)}
                </span>
              )}

              {n.autor && (
                <span className="meta-chip" style={{ maxWidth: '100%' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.autor}
                  </span>
                </span>
              )}
            </div>

            <div className="card-footer">
              <span className="cta-line">
                <span className="cta-dot" />
                Ver nota
              </span>

              <span className="circle-cta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </article>
      )
    }

    return (
      <article className="card-radical card-landscape">
        <div className="landscape-media">
          {n.imagen ? (
            <img
              src={n.imagen}
              alt={n.titulo}
              className="radical-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div className="fallback-box">📡</div>
          )}

          <div className="landscape-overlay" />

          <div className="landscape-top">
            {n.categoria && <span className="category-pill">{n.categoria}</span>}
            {n.fecha && <span className="date-pill">{formatFecha(n.fecha)}</span>}
          </div>
        </div>

        <div className="landscape-content">
          <div className="eyebrow">Nota institucional</div>

          <h3 className="card-title">{n.titulo}</h3>

          {n.descripcion && (
            <p className="card-desc">{n.descripcion}</p>
          )}

          <div className="meta-wrap">
            {n.autor && (
              <span className="meta-chip" style={{ maxWidth: '100%' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.autor}
                </span>
              </span>
            )}
          </div>

          <div className="card-footer">
            <span className="cta-line">
              <span className="cta-dot" />
              Ver nota
            </span>

            <span className="circle-cta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    )
  }

  const renderDestacada = () => {
    if (!destacada) return null

    const format = imageFormats[destacada.id] || 'landscape'
    const isPortrait = format === 'portrait'

    if (isPortrait) {
      return (
        <Link
          to={`/notas/${destacada.id}`}
          style={{ textDecoration: 'none', display: 'block', marginBottom: '44px' }}
        >
          <article
            className="card-destacada featured-portrait"
            style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 10px 42px rgba(97,18,50,.14)',
              border: '1px solid rgba(97,18,50,.10)',
              position: 'relative',
              background: 'linear-gradient(160deg, #611232 0%, #4a0d25 100%)',
            }}
          >
            <div className="featured-portrait-inner">
              <div className="featured-portrait-copy">
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  backgroundColor: '#A57F2C',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  boxShadow: '0 4px 16px rgba(0,0,0,.18)',
                  marginBottom: '18px'
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '900',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}>
                    ★ Destacado
                  </span>
                </div>

                <div style={{
                  width: '42px',
                  height: '3px',
                  backgroundColor: '#A57F2C',
                  borderRadius: '2px',
                  marginBottom: '18px'
                }} />

                <h2 className="featured-title">
                  {destacada.titulo}
                </h2>

                {destacada.descripcion && (
                  <p className="featured-desc">
                    {destacada.descripcion}
                  </p>
                )}

                <div className="featured-meta">
                  {destacada.categoria && (
                    <span className="featured-meta-pill featured-meta-category">
                      {destacada.categoria}
                    </span>
                  )}

                  {destacada.fecha && (
                    <span className="featured-meta-pill">
                      {formatFecha(destacada.fecha)}
                    </span>
                  )}

                  {destacada.autor && (
                    <span className="featured-meta-pill">
                      {destacada.autor}
                    </span>
                  )}
                </div>

                <span className="featured-cta">
                  Leer nota completa
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>

              <div className="featured-portrait-media">
                {destacada.imagen ? (
                  <img
                    src={getUploadUrl(destacada.imagen)}
                    alt={destacada.titulo}
                    className="card-img-dest portrait-featured-img"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '72px',
                    background: 'linear-gradient(135deg,#611232,#3a0a1e)',
                    color: 'white'
                  }}>
                    📡
                  </div>
                )}
              </div>
            </div>
          </article>
        </Link>
      )
    }

    return (
      <Link
        to={`/notas/${destacada.id}`}
        style={{ textDecoration:'none', display:'block', marginBottom:'44px' }}
      >
        <article
          className="card-destacada dest-grid"
          style={{
            borderRadius:'22px',
            overflow:'hidden',
            boxShadow:'0 8px 40px rgba(97,18,50,.14)',
            border:'1px solid rgba(97,18,50,.1)',
            position:'relative',
          }}
        >
          <div className="featured-landscape-media">
            {destacada.imagen ? (
              <img
                src={destacada.imagen}
                alt={destacada.titulo}
                className="card-img-dest"
                style={{
                  position:'absolute',
                  inset:0,
                  width:'100%',
                  height:'100%',
                  objectFit:'cover',
                  objectPosition:'center',
                  display:'block',
                }}
              />
            ) : (
              <div style={{
                position:'absolute',
                inset:0,
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontSize:'72px',
                background:'linear-gradient(135deg,#611232,#3a0a1e)'
              }}>
                📡
              </div>
            )}

            <div style={{
              position:'absolute',
              inset:0,
              background:'linear-gradient(to right, rgba(0,0,0,.15) 0%, rgba(0,0,0,.45) 100%)'
            }} />
            <div style={{
              position:'absolute',
              inset:0,
              background:'linear-gradient(to top, rgba(97,18,50,.6) 0%, transparent 45%)'
            }} />

            <div style={{
              position:'absolute',
              top:'20px',
              left:'20px',
              backgroundColor:'#A57F2C',
              padding:'7px 16px',
              borderRadius:'999px',
              boxShadow:'0 4px 16px rgba(0,0,0,.3)'
            }}>
              <span style={{
                fontSize:'10px',
                fontWeight:'900',
                color:'white',
                textTransform:'uppercase',
                letterSpacing:'2px'
              }}>
                ★ Destacado
              </span>
            </div>

            {destacada.categoria && (
              <div style={{
                position:'absolute',
                bottom:'20px',
                left:'20px',
                backgroundColor:'rgba(97,18,50,.88)',
                borderRadius:'7px',
                padding:'5px 14px',
                backdropFilter:'blur(6px)'
              }}>
                <span style={{
                  fontSize:'11px',
                  fontWeight:'800',
                  color:'white',
                  textTransform:'uppercase',
                  letterSpacing:'1.2px'
                }}>
                  {destacada.categoria}
                </span>
              </div>
            )}
          </div>

          <div className="featured-landscape-copy">
            <div style={{
              width:'40px',
              height:'3px',
              backgroundColor:'#A57F2C',
              borderRadius:'2px',
              marginBottom:'18px'
            }} />

            <h2 className="featured-title featured-title-landscape">
              {destacada.titulo}
            </h2>

            {destacada.descripcion && (
              <p className="featured-desc featured-desc-landscape">
                {destacada.descripcion}
              </p>
            )}

            <div className="featured-bottom-meta">
              {destacada.autor && (
                <span className="featured-bottom-item">
                  ✍️ {destacada.autor}
                </span>
              )}
              {destacada.fecha && (
                <span className="featured-bottom-item">
                  📅 {formatFecha(destacada.fecha)}
                </span>
              )}
            </div>

            <span className="featured-cta">
              Leer nota completa
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pill-filter {
          padding: 7px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s ease;
          border: 1px solid transparent;
        }

        .pill-filter:hover:not(.active) {
          background-color: #f3f4f6 !important;
          border-color: #e5e7eb;
          color: #374151 !important;
        }

        .cards-animate > * {
          animation: fadeUp .35s ease both;
        }

        .cards-animate > *:nth-child(1) { animation-delay: .05s; }
        .cards-animate > *:nth-child(2) { animation-delay: .10s; }
        .cards-animate > *:nth-child(3) { animation-delay: .15s; }
        .cards-animate > *:nth-child(4) { animation-delay: .20s; }
        .cards-animate > *:nth-child(5) { animation-delay: .25s; }
        .cards-animate > *:nth-child(6) { animation-delay: .30s; }

        .card-destacada {
          transition: transform .3s ease, box-shadow .3s ease;
        }

        .card-destacada:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 64px rgba(97,18,50,.22) !important;
        }

        .card-destacada:hover .card-img-dest {
          transform: scale(1.04);
        }

        .card-img-dest {
          transition: transform .6s cubic-bezier(0.25,0.46,0.45,0.94);
        }

        .dest-grid {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 430px;
        }

        @media (min-width: 960px) {
          .dest-grid {
            grid-template-columns: 56% 44%;
            min-height: 470px;
          }
        }

        .featured-landscape-media {
          position: relative;
          overflow: hidden;
          background-color: #2a0a17;
          min-height: 290px;
        }

        @media (min-width: 960px) {
          .featured-landscape-media {
            min-height: 470px;
          }
        }

        .featured-landscape-copy {
          background: linear-gradient(160deg, #611232 0%, #4a0d25 100%);
          padding: clamp(24px, 3.2vw, 44px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .featured-portrait {
          padding: clamp(18px, 2.5vw, 30px);
        }

        .featured-portrait-inner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: stretch;
        }

        @media (min-width: 980px) {
          .featured-portrait-inner {
            grid-template-columns: minmax(0, 1.12fr) 330px;
            gap: 24px;
          }
        }

        .featured-portrait-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          padding: 6px;
        }

        .featured-portrait-media {
          position: relative;
          min-height: 300px;
          max-height: 560px;
          border-radius: 18px;
          overflow: hidden;
          background: #2a0a17;
          box-shadow: 0 12px 36px rgba(0,0,0,.18);
        }

        @media (min-width: 768px) {
          .featured-portrait-media {
            min-height: 400px;
          }
        }

        .portrait-featured-img {
          object-position: center top !important;
        }

        .featured-title {
          font-size: clamp(20px, 2.5vw, 31px);
          font-weight: 900;
          color: white;
          line-height: 1.18;
          margin: 0 0 14px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .featured-title-landscape {
          -webkit-line-clamp: 3;
        }

        .featured-desc {
          font-size: clamp(13.5px, 1.2vw, 14.5px);
          color: rgba(255,255,255,.78);
          line-height: 1.75;
          margin: 0 0 20px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 58ch;
        }

        .featured-desc-landscape {
          -webkit-line-clamp: 2;
        }

        .featured-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .featured-meta-pill {
          background-color: rgba(255,255,255,.08);
          color: rgba(255,255,255,.82);
          font-size: 11px;
          font-weight: 700;
          padding: 6px 11px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.10);
        }

        .featured-meta-category {
          background-color: rgba(255,255,255,.11);
          color: white;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .featured-bottom-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,.15);
        }

        .featured-bottom-item {
          font-size: 13px;
          color: rgba(255,255,255,.72);
          font-weight: 600;
        }

        .featured-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          align-self: flex-start;
          background-color: #A57F2C;
          color: white;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .3px;
          padding: 11px 20px;
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(165,127,44,.35);
        }

        .section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #9ca3af;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #efefef;
        }

        .grid-resto {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: stretch;
        }

        @media (min-width: 700px) {
          .grid-resto {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 22px;
          }
        }

        @media (min-width: 1100px) {
          .grid-resto {
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 24px;
          }
        }

        .card-radical {
          background: linear-gradient(180deg, #ffffff 0%, #fcfcfc 100%);
          border: 1px solid #ece8ea;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 28px rgba(17,24,39,.05);
          transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
          height: 100%;
        }

        .card-radical:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 50px rgba(97,18,50,.12);
          border-color: rgba(97,18,50,.16);
        }

        .card-radical:hover .radical-img {
          transform: scale(1.05);
        }

        .radical-img {
          transition: transform .55s cubic-bezier(0.25,0.46,0.45,0.94);
        }

        .card-radical::after {
          content: '';
          position: absolute;
          inset: auto 0 0 0;
          height: 4px;
          background: linear-gradient(90deg, #611232, #A57F2C, #611232);
          opacity: 0;
          transition: opacity .25s ease;
        }

        .card-radical:hover::after {
          opacity: 1;
        }

        .card-portrait {
          display: grid;
          grid-template-columns: 110px 1fr;
          min-height: 230px;
        }

        @media (max-width: 640px) {
          .card-portrait {
            grid-template-columns: 1fr;
            min-height: auto;
          }
        }

        .portrait-media {
          position: relative;
          overflow: hidden;
          background: #611232;
          min-height: 230px;
        }

        @media (max-width: 640px) {
          .portrait-media {
            min-height: 220px;
          }
        }

        .portrait-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          min-width: 0;
          position: relative;
          z-index: 2;
        }

        .categoria-rail {
          position: absolute;
          top: 14px;
          left: 14px;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          background: rgba(97,18,50,.92);
          color: white;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.3px;
          text-transform: uppercase;
          padding: 10px 6px;
          border-radius: 999px;
          box-shadow: 0 8px 18px rgba(97,18,50,.22);
          z-index: 2;
        }

        @media (max-width: 640px) {
          .categoria-rail {
            writing-mode: initial;
            transform: none;
            top: auto;
            bottom: 12px;
            left: 12px;
            font-size: 10px;
            padding: 5px 10px;
            border-radius: 999px;
          }
        }

        .card-landscape {
          display: flex;
          flex-direction: column;
          min-height: 230px;
        }

        .landscape-media {
          position: relative;
          height: 190px;
          overflow: hidden;
          background: #611232;
        }

        @media (max-width: 640px) {
          .landscape-media {
            height: 210px;
          }
        }

        .landscape-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.48), transparent 65%);
        }

        .landscape-top {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 8px;
        }

        .landscape-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .category-pill {
          display: inline-flex;
          align-items: center;
          background: #A57F2C;
          color: white;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 999px;
          box-shadow: 0 6px 16px rgba(0,0,0,.2);
        }

        .date-pill {
          display: inline-flex;
          align-items: center;
          background: rgba(0,0,0,.46);
          color: rgba(255,255,255,.92);
          font-size: 10px;
          font-weight: 700;
          padding: 5px 9px;
          border-radius: 999px;
          backdrop-filter: blur(6px);
        }

        .meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          background: #f8f5f6;
          border: 1px solid #f0e6ea;
          border-radius: 999px;
          padding: 6px 10px;
          max-width: 100%;
        }

        .meta-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: auto;
          margin-bottom: 12px;
        }

        .cta-line {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #611232;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .3px;
          text-transform: uppercase;
        }

        .cta-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #A57F2C;
          box-shadow: 0 0 0 4px rgba(165,127,44,.14);
        }

        .circle-cta {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #611232;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px rgba(97,18,50,.18);
          flex-shrink: 0;
        }

        .eyebrow {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.3px;
          text-transform: uppercase;
          color: #A57F2C;
          margin-bottom: 8px;
        }

        .card-title {
          font-size: clamp(16px, 1.7vw, 18px);
          font-weight: 800;
          color: #111827;
          line-height: 1.32;
          margin: 0 0 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .portrait-title {
          -webkit-line-clamp: 3;
        }

        .card-desc {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.7;
          margin: 0 0 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .portrait-desc {
          -webkit-line-clamp: 3;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding-top: 12px;
          border-top: 1px solid #f2eef0;
        }

        .fallback-box {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: white;
          background: linear-gradient(135deg,#611232,#4a0d25);
        }

        .skeleton-radical {
          display: grid;
          grid-template-columns: 110px 1fr;
          min-height: 230px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #f0f0f0;
          background: white;
        }

        @media (max-width: 640px) {
          .skeleton-radical {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ backgroundColor:'#611232', padding:'48px 0 44px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 32px' }}>
          <p style={{
            fontSize:'10px',
            fontWeight:'700',
            letterSpacing:'2.5px',
            textTransform:'uppercase',
            color:'rgba(255,255,255,.45)',
            margin:'0 0 10px'
          }}>
            Información
          </p>
          <h1 style={{
            fontSize:'clamp(24px,4vw,36px)',
            fontWeight:'800',
            color:'white',
            margin:'0 0 10px',
            lineHeight:1.2
          }}>
            Notas y Noticias
          </h1>
          <p style={{
            color:'rgba(255,255,255,.55)',
            fontSize:'14px',
            margin:0,
            maxWidth:'540px'
          }}>
            Información institucional del Sistema Chiapaneco de Radio, Televisión y Cinematografía.
          </p>
        </div>
      </div>

      <div style={{ background:'linear-gradient(90deg,#611232,#A57F2C,#611232)', height:'3px' }} />

      <div style={{ backgroundColor:'white', minHeight:'60vh', padding:'40px 0 76px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 20px' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'34px' }}>
            {categorias.map(c => (
              <button
                key={c}
                className={`pill-filter ${filtro === c ? 'active' : ''}`}
                onClick={() => setFiltro(c)}
                style={{
                  backgroundColor: filtro === c ? '#611232' : 'transparent',
                  color: filtro === c ? 'white' : '#6b7280',
                  boxShadow: filtro === c ? '0 4px 12px rgba(97,18,50,.2)' : 'none',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid-resto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-radical">
                  <div style={{
                    background:'linear-gradient(90deg,#f5f5f5 25%,#ececec 50%,#f5f5f5 75%)',
                    backgroundSize:'200% 100%',
                    animation:'shimmer 1.5s ease-in-out infinite'
                  }} />
                  <div style={{ padding:'18px', display:'flex', flexDirection:'column', gap:'10px' }}>
                    <div style={{ height:'10px', width:'26%', backgroundColor:'#f0f0f0', borderRadius:'999px' }} />
                    <div style={{ height:'18px', width:'82%', backgroundColor:'#f0f0f0', borderRadius:'6px' }} />
                    <div style={{ height:'18px', width:'64%', backgroundColor:'#f0f0f0', borderRadius:'6px' }} />
                    <div style={{ height:'13px', width:'88%', backgroundColor:'#f0f0f0', borderRadius:'6px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtradas.length === 0 ? (
            <div style={{ textAlign:'center', padding:'84px 0' }}>
              <p style={{ fontSize:'48px', margin:'0 0 16px' }}>📰</p>
              <p style={{ fontSize:'16px', fontWeight:'700', color:'#6b7280', margin:'0 0 6px' }}>
                No hay noticias disponibles
              </p>
              <p style={{ fontSize:'14px', color:'#9ca3af' }}>Prueba con otra categoría</p>
            </div>
          ) : (
            <div className="cards-animate">
              {renderDestacada()}

              {resto.length > 0 && (
                <>
                  <div className="section-title">Más noticias</div>
                  <div className="grid-resto">
                    {resto.map(n => (
                      <Link key={n.id} to={`/notas/${n.id}`} style={{ textDecoration:'none' }}>
                        {renderCard(n)}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}