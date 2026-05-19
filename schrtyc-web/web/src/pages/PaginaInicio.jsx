import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEstaciones, getProgramacionHoy } from '../services/api'
import { estaEnVivo } from '../utils/date'
import IMG_TV from '../assets/tv_studio.png'
import IMG_ESTUDIO from '../assets/radio_studio.png'

// ── Estaciones fijas ──────────────────────────────────────────
const ESTACIONES_FIJAS = [
  { id: 's1', nombre: 'Canal de AudioStreaming', ciudad: '', freq: '', am: false, activa: true },
  { id: 's2', nombre: 'Tuxtlan', ciudad: 'Tuxtla Gutiérrez', freq: '92.5', am: false, activa: true },
  { id: 's3', nombre: 'Uno', ciudad: 'San Cristóbal', freq: '760', am: true, activa: true },
  { id: 's4', nombre: 'Frecuencia V Norte', ciudad: 'Pichucalco', freq: '102.1', am: false, activa: true },
  { id: 's5', nombre: 'Digital', ciudad: 'Tonalá', freq: '89.5', am: false, activa: true },
  { id: 's6', nombre: 'K-in', ciudad: 'Ocosingo', freq: '600', am: true, activa: true },
  { id: 's7', nombre: 'Palenque', ciudad: 'Palenque', freq: '1040', am: true, activa: true },
  { id: 's8', nombre: 'Brisas De Montebello', ciudad: 'Trinitaria', freq: '89.9', am: false, activa: true },
]

const SEEDS = {
  s1: 'studiomix', s2: 'tuxtlan', s3: 'sancristobal', s4: 'pichucalco',
  s5: 'tonala', s6: 'ocosingo', s7: 'palenque', s8: 'montebello'
}

// ── Íconos ────────────────────────────────────────────────────
const Arr = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────
const Gold = () => <div className="gold-separator" />
const Eyebrow = ({ t }) => <p className="eyebrow">{t}</p>

const Bars = ({ n = 14, color = '#611232' }) => (
  <div className="bars-container">
    {Array.from({ length: n }).map((_, i) => (
      <div 
        key={i} 
        className="bar"
        style={{
          backgroundColor: color,
          height: `${20 + Math.abs(Math.sin(i * .9)) * 80}%`,
          animation: `barA ${.4 + (i % 5) * .08}s ease-in-out ${i * .03}s infinite`,
        }} 
      />
    ))}
  </div>
)

// ── RadioCard ─────────────────────────────────────────────────
function RadioCard({ e: est }) {
  const bg = `https://picsum.photos/seed/${SEEDS[est.id] || est.id}/400/220`
  const badge = est.freq ? `${est.freq} ${est.am ? 'AM' : 'FM'}` : null

  return (
    <Link to="/radio" className="radio-card-v3 lift">
      <div className="radio-img-container">
        <img src={bg} alt={est.nombre} className="radio-img" />
        <div className="radio-img-overlay" />
        {est.activa && (
          <div className="live-badge-floating">
            <span className="hero-date-dot" style={{ width: '6px', height: '6px' }} />
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'white', textTransform: 'uppercase' }}>Vivo</span>
          </div>
        )}
        {badge && (
          <div className="freq-badge-floating">
            <span style={{ fontSize: '11px', fontWeight: '900', color: 'white' }}>{badge}</span>
          </div>
        )}
      </div>
      <div style={{ padding: '0 8px' }}>
        <h3 style={{ margin: '0 0 4px', color: '#333333', fontSize: '15px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{est.nombre}</h3>
        <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>{est.ciudad || 'Chiapas'}</p>
        <Bars color={est.activa ? 'var(--gold)' : 'rgba(165,127,44,0.2)'} n={18} />
      </div>
    </Link>
  )
}

// ════════════════════════════════════════════════════════════
// PaginaInicio
// ════════════════════════════════════════════════════════════
export default function PaginaInicio() {
  const [estaciones, setEstaciones] = useState([])
  const [programas, setProgramas] = useState([])
  const [ahora, setAhora] = useState(new Date())
  const [horaStr, setHoraStr] = useState('')

  useEffect(() => {
    getEstaciones().then(setEstaciones).catch(console.error)
    getProgramacionHoy().then(setProgramas).catch(console.error)
    const tick = () => {
      const n = new Date(); setAhora(n)
      setHoraStr(n.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const t = setInterval(tick, 60000)
    return () => clearInterval(t)
  }, [])

  const progActual = programas.find(p => estaEnVivo(p.hora_inicio, p.hora_fin))
  const progTV = programas.find(p => p.tipo === 'TV' && estaEnVivo(p.hora_inicio, p.hora_fin))
  const activas = estaciones.filter(e => e.activa)

  const mvrt = [
    { l: 'M', t: 'Misión', d: 'Producir y transmitir programas informativos, culturales y educativos para la población chiapaneca.' },
    { l: 'V', t: 'Visión', d: 'Ser el sistema audiovisual reconocido a nivel nacional e internacional.' },
    { l: 'R', t: 'Radio', d: 'Frecuencias FM y AM con cobertura en la geografía estatal de Chiapas.' },
    { l: 'T', t: 'Televisión', d: 'Canal 10, señal abierta con amplia cobertura en el territorio chiapaneco.' },
  ]

  return (
    <>
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="hero-mesh">
        <div className="hero-bg-float-1" />
        <div className="hero-bg-float-2" />

        <div className="page-container hero-content">
          <div className="hero-grid">
            
            <div className="hero-text">
              <div className="hi0 hero-date-badge">
                <span className="hero-date-dot" />
                <span className="hero-date-text">
                  {ahora.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>

              <h1 className="hi1 hero-title">
                Conectando a<br />
                <span style={{ color: 'var(--gold-light)', display: 'block' }}>Chiapas</span>
                <span style={{ opacity: 0.4, fontSize: '0.7em' }}>con el Mundo</span>
              </h1>

              <p className="hi2 hero-subtitle">
                Somos la voz institucional y el medio público que promueve la cultura, educación y el desarrollo de nuestro estado a través de señales que llegan a cada rincón.
              </p>

              <div className="hi2 hero-actions">
                <Link to="/radio" className="btn-primary">
                  Escuchar Radio <Arr />
                </Link>
                <Link to="/canal10" className="btn-secondary">
                  Ver Canal 10 <Arr />
                </Link>
              </div>

              <div className="hi3 hero-stats">
                {[
                  { n: ESTACIONES_FIJAS.length, l: 'Frecuencias Activas' },
                  { n: '1', l: 'Canal de TV Digital' },
                  { n: '12', l: 'Regiones Cubiertas' },
                ].map(s => (
                  <div key={s.l} className="stat-item">
                    <h4>{s.n}</h4>
                    <p>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hi2 hero-glass-card">
              <p style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '20px' }}>Al aire ahora</p>
              {progActual ? (
                <div style={{ marginBottom: '24px' }}>
                  <div className="live-badge-mini">
                    <span className="live-dot" />
                    <span className="live-text-mini">DIRECTO</span>
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white', margin: '0 0 8px', lineHeight: 1.1 }}>{progActual.nombre}</h3>
                  {progActual.conductor && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', fontWeight: '500' }}>con {progActual.conductor}</p>}
                  <div className="tv-time-badge" style={{ fontSize: '12px' }}>
                    {progActual.estacion} · {progActual.hora_inicio}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}>Programación automática</p>
              )}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', marginBottom: '24px' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>Estaciones Destacadas</p>
                {activas.slice(0, 3).map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--gold-light)', fontWeight: '900' }}>
                      {e.freq.split('.')[0] || 'FM'}
                    </div>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>{e.nombre}</span>
                  </div>
                ))}
              </div>

              <Link to="/radio" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '13px', backgroundColor: 'var(--brand)', color: 'white', justifyContent: 'center' }}>
                Ver todas las estaciones <Arr />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Gold />

      {/* ══ INSTITUCIÓN ═══════════════════════════════════════ */}
      <section className="institutional-section">
        <div className="page-container">
          <div className="institutional-grid">
            
            <div className="editorial-frame hi0">
              <img src={IMG_ESTUDIO} alt="Estudio" className="editorial-img" />
              <div className="editorial-floating-box">
                <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--gold-light)', margin: '0 0 10px' }}>Institución</p>
                <p style={{ fontSize: '16px', fontWeight: '700', lineHeight: 1.4, margin: 0 }}>Comprometidos con la difusión cultural en Chiapas.</p>
              </div>
            </div>

            <div>
              <Eyebrow t="Acerca del Sistema" />
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '900', color: 'var(--brand)', margin: '0 0 24px', lineHeight: 1.1 }}>
                Medios Públicos al Servicio de la Sociedad
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.8, marginBottom: '40px' }}>
                El Sistema Chiapaneco de Radio, Televisión y Cinematografía es un organismo descentralizado del Gobierno del Estado de Chiapas, encargado de operar los medios públicos con una visión educativa y social.
              </p>
              
              <div className="mvr-grid">
                {mvrt.slice(0, 2).map(c => (
                  <div key={c.t} className="mvr-card lift">
                    <div className="mvr-icon">{c.l}</div>
                    <h4 style={{ margin: '0 0 8px', fontWeight: '800', color: 'var(--brand)' }}>{c.t}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.d}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <Link to="/transparencia" className="btn-primary" style={{ padding: '14px 28px', backgroundColor: 'var(--brand)', color: 'white', borderRadius: '12px', fontSize: '14px' }}>Transparencia</Link>
                <a href="https://www.chiapas.gob.mx" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '14px 28px', border: '2px solid #eee', color: 'var(--text-main)', borderRadius: '12px', fontSize: '14px' }}>Portal de Gobierno</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Gold />

      {/* ══ RADIO ═════════════════════════════════════════════ */}
      <section className="radio-section">
        <div className="page-container">
          <div className="section-header">
            <div>
              <Eyebrow t="Radio Chiapas" />
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '900', color: 'var(--brand)', margin: '0 0 12px' }}>Frecuencias Estatales</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Sintoniza nuestras estaciones en vivo desde cualquier lugar.</p>
            </div>
            <Link to="/radio" className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(97, 18, 50, 0.15)', color: 'var(--brand)', fontSize: '14px' }}>
              Ver todas <Arr />
            </Link>
          </div>

          <div className="radio-grid">
            {ESTACIONES_FIJAS.map(e => <RadioCard key={e.id} e={e} />)}
          </div>
        </div>
      </section>

      <Gold />

      {/* ══ CANAL 10 ══════════════════════════════════════════ */}
      <section className="tv-section">
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(97,18,50,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div className="page-container">
          <div className="section-header" style={{ marginBottom: '48px' }}>
            <div>
              <Eyebrow t="Televisión Pública" />
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '900', color: '#1a1a1a', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
                Canal 10 <span style={{ color: 'var(--brand)' }}>en Vivo</span>
              </h2>
              <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--gold)', borderRadius: '2px' }} />
            </div>
            <Link to="/canal10" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--brand)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(97,18,50,0.1)' }}>
              Programación completa <Arr />
            </Link>
          </div>

          <div className="tv-card lift">
            <div className="tv-card-img-container" style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
              <img src={IMG_TV} alt="Estudio" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Link to="/canal10" className="tv-play-btn">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                </Link>
              </div>
            </div>

            <div className="tv-content-glass">
              <div className="tv-badge-live">
                <span className="hero-date-dot" style={{ width: '8px', height: '8px' }} />
                En Vivo Ahora
              </div>

              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Al aire</p>
                {progTV ? (
                  <>
                    <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#611232', margin: '0 0 8px', lineHeight: 1.1 }}>{progTV.nombre}</h3>
                    {progTV.conductor && <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 16px' }}>con {progTV.conductor}</p>}
                    <div className="tv-time-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                      {progTV.hora_inicio} — {progTV.hora_fin}
                    </div>
                  </>
                ) : (
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#9ca3af', margin: 0 }}>Programación no disponible</h3>
                )}
              </div>

              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, margin: '0 0 32px' }}>Disfruta de la mejor televisión pública de Chiapas con contenidos culturales y educativos.</p>

              <Link to="/canal10" className="btn-primary" style={{ backgroundColor: 'var(--brand)', color: 'white', borderRadius: '16px', padding: '16px 32px', fontSize: '15px', justifyContent: 'center' }}>
                Sintonizar ahora <Arr />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}