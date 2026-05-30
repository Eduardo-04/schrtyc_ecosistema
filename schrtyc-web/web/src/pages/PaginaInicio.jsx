import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEstaciones, getProgramacionHoy, getUploadUrl, getConfiguracion } from '../services/api'
import { estaEnVivo } from '../utils/date'
import IMG_TV from '../assets/tv_studio.png'
import IMG_ESTUDIO from '../assets/radio_studio.png'
import LOGO_SCHRTYC from '../assets/logo_sistema.jpg'

// ── Estaciones dinámicas cargadas desde el backend ──────────────

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
  const tieneImagen = !!est.imagen
  const bg = tieneImagen ? getUploadUrl(est.imagen) : LOGO_SCHRTYC

  return (
    <Link to="/radio" className="radio-card-v3 lift">
      <div className="radio-img-container">
        <img
          src={bg}
          alt={est.nombre}
          className="radio-img"
          style={{
            objectFit: 'contain',
            backgroundColor: 'white',
            padding: tieneImagen ? '0' : '20px'
          }}
        />
        {/* Se quita radio-img-overlay para no oscurecer el logo */}
        {est.activo && (
          <div className="live-badge-floating">
            <span className="hero-date-dot" style={{ width: '6px', height: '6px' }} />
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'white', textTransform: 'uppercase' }}>Vivo</span>
          </div>
        )}
      </div>
      <div style={{ padding: '0 8px' }}>
        <h3 style={{ margin: '0 0 4px', color: '#333333', fontSize: '15px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{est.nombre}</h3>
        <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>{est.tipo === 'TV' ? 'Televisión' : 'Frecuencia Estatal'}</p>
        <Bars color={est.activo ? 'var(--gold)' : 'rgba(165,127,44,0.2)'} n={18} />
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
  const [banners, setBanners] = useState([])
  const [configuracion, setConfiguracion] = useState(null)

  useEffect(() => {
    getEstaciones().then(setEstaciones).catch(console.error)
    getProgramacionHoy().then(setProgramas).catch(console.error)
    getConfiguracion().then(conf => {
      setConfiguracion(conf)
      if (conf?.sistema?.banners) {
        setBanners(conf.sistema.banners.filter(b => b.activo))
      }
    }).catch(console.error)
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
                  { n: estaciones.filter(e => e.tipo === 'Radio' && e.activo).length, l: 'Frecuencias Activas' },
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
                  {progActual.conductor && progActual.conductor.toLowerCase() !== 'sin asignar' && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', fontWeight: '500' }}>con {progActual.conductor}</p>}
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
                      📻
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
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '30px' }}>
                El Sistema Chiapaneco de Radio, Televisión y Cinematografía es un organismo descentralizado del Gobierno del Estado de Chiapas, encargado de operar las estaciones de Radio y Televisión, así como de promover locaciones para producciones de proyectos audiovisuales.
              </p>

              <div className="mvr-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                <div className="mvr-card lift" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                  <h4 style={{ margin: '0 0 8px', fontWeight: '800', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#fff1f2', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>M</div>
                    Misión
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Ser un Organismo descentralizado del Gobierno del Estado, que tiene la meta de producir, coproducir y transmitir programas informativos, culturales y educativos y atraer empresas que realicen filmaciones audiovisuales, para la población de habla hispana y lenguas indígenas, desarrollando contenidos que impulsen el desarrollo humano de los Chiapanecos, a través de la Radio, Televisión y la difusión de las factibles locaciones cinematográficas.
                  </p>
                </div>
                <div className="mvr-card lift" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                  <h4 style={{ margin: '0 0 8px', fontWeight: '800', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#fff1f2', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>V</div>
                    Visión
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Ser el Sistema de Comunicación Audiovisual reconocido a nivel nacional e internacional, que promueva la calidad de nuestros programas radiofónicos y televisivos y la diversidad de locaciones factibles para el mercado cinematográfico, que sirva para contribuir al desarrollo social y económico del Estado de Chiapas.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <a href="https://www.chiapas.gob.mx/funcionarios/estatal/ejecutivo/sistema-chiapaneco" target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '14px 28px', backgroundColor: 'var(--brand)', color: 'white', borderRadius: '12px', fontSize: '14px', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>Directorio</a>
                <Link to="/transparencia" className="btn-secondary" style={{ padding: '14px 28px', border: '2px solid #eee', color: 'var(--text-main)', borderRadius: '12px', fontSize: '14px', textDecoration: 'none' }}>Transparencia</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Gold />

      {/* ══ UBICACIÓN Y BANNERS ══════════════════════════════════════════ */}
      <section className="location-section" style={{ backgroundColor: '#f9fafb', padding: '80px 0' }}>
        <style>{`
          .map-banners-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 40px;
            align-items: start;
          }
          @media (min-width: 992px) {
            .map-banners-grid {
              grid-template-columns: 2.5fr 1fr;
            }
          }
        `}</style>
        <div className="page-container">
          <div className="map-banners-grid">

            {/* IZQUIERDA: Mapa */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <Eyebrow t="Contacto y Ubicación" />
                </div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '900', color: '#1a1a1a', margin: '0 0 16px', lineHeight: 1.1 }}>
                  Encuéntranos en <span style={{ color: 'var(--brand)' }}>Tuxtla Gutiérrez</span>
                </h2>
                <p style={{ color: '#6b7280', fontSize: '15px', maxWidth: '600px', margin: '0' }}>
                  Libramiento Norte Poniente s/n, Colonia San Jorge C.P. 29039 Tuxtla Gutiérrez, Chiapas.
                </p>
              </div>

              <div className="map-container lift" style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', height: '450px', backgroundColor: '#e5e7eb', position: 'relative' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1910.0380607850318!2d-93.128136!3d16.772888!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ecd8dd2e2135bd%3A0xe826e3314ff2d8b!2sSistema%20Chiapaneco%20de%20Radio%20y%20Televisi%C3%B3n!5e0!3m2!1sen!2smx!4v1779763460251!5m2!1sen!2smx"
                  width="100%"
                  height="100%"
                  style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación del Sistema Chiapaneco"
                ></iframe>

                <div style={{ position: 'absolute', bottom: '24px', left: '24px', backgroundColor: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fff1f2', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px' }}>Conmutador y Teléfono</p>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', margin: '0 0 2px 0' }}>(961) 61 705-00 Ext. 57000</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <a href="http://www.radiotvycine.chiapas.gob.mx" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', border: '1px solid #e5e7eb', color: '#4b5563', borderRadius: '8px', fontSize: '11px', fontWeight: '700', textDecoration: 'none' }}>
                      www.radiotvycine.chiapas.gob.mx
                    </a>
                    <a href="https://maps.app.goo.gl/D5SfQbvNaZyXXqbm6" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', backgroundColor: 'var(--brand)', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}>
                      Abrir en Google Maps
                    </a>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '60px' }}>
                <div style={{ marginBottom: '32px' }}>
                  <Eyebrow t="Documentos Oficiales" />
                  <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '900', color: '#1a1a1a', margin: '0' }}>
                    Marco <span style={{ color: 'var(--brand)' }}>Jurídico</span>
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {(configuracion?.sistema?.documentos || []).map((doc, i) => (
                    <a key={doc.id || i} href={doc.url?.startsWith('http') ? doc.url : getUploadUrl(doc.url)} target="_blank" rel="noreferrer" className="hover:scale-[1.02] transition-transform" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '12px', textDecoration: 'none', border: '1px solid #f3f4f6' }}>
                      <div style={{ minWidth: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fff1f2', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#374151', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.nombre}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* DERECHA: Banners */}
            {banners.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignContent: 'start', justifyContent: 'center' }}>
                  {banners.map(b => (
                    <a key={b.id} href={b.url || '#'} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', maxWidth: '300px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', transition: 'transform 0.2s', backgroundColor: 'white' }} className="hover:scale-[1.03] lift">
                      <img src={getUploadUrl(b.imagen)} alt="Banner promocional" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      <Gold />



      {/* ══ RADIO ═════════════════════════════════════════════ */}
      <section className="radio-section">
        <div className="page-container">
          <div className="section-header">
            <div>
              <Eyebrow t="Radio" />
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '900', color: 'var(--brand)', margin: '0 0 12px' }}>Frecuencias Estatales</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Sintoniza nuestras estaciones en vivo desde cualquier lugar.</p>
            </div>
            <Link to="/radio" className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(97, 18, 50, 0.15)', color: 'var(--brand)', fontSize: '14px' }}>
              Ver todas <Arr />
            </Link>
          </div>

          <div className="radio-grid">
            {estaciones.filter(e => e.tipo === 'Radio').map(e => <RadioCard key={e.id} e={e} />)}
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
                    {progTV.conductor && progTV.conductor.toLowerCase() !== 'sin asignar' && <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 16px' }}>con {progTV.conductor}</p>}
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