import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getConfiguracion } from '../../services/api'
import LOGO_HQT from '../../assets/logo-hqt.png'

export default function Footer() {
  const [redes, setRedes] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: ''
  })

  useEffect(() => {
    getConfiguracion()
      .then(res => {
        // La API devuelve { ok: true, data: { redes: { ... } } }
        if (res && res.ok && res.data && res.data.redes) {
          setRedes(res.data.redes)
        } else if (res && res.redes) {
          setRedes(res.redes)
        }
      })
      .catch(err => {
        console.error('Error al obtener la configuración de redes en el Footer:', err)
      })
  }, [])

  // Iconos SVG estilizados de redes sociales
  const socialIcons = {
    facebook: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M9 8H7v3h2v9h3v-9h3l.5-3H12V6.5C12 5.8 12.3 5 13.5 5H15V2h-2.5C9.8 2 9 3.8 9 5.8V8z" />
      </svg>
    ),
    instagram: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    twitter: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    youtube: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    tiktok: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.18.94 1.13 2.27 1.9 3.73 2.19v3.91c-1.81-.03-3.56-.63-5.02-1.72-.03 2.37-.02 4.74-.03 7.11-.06 2.05-.72 4.13-2.07 5.72-1.68 1.99-4.22 3.14-6.83 3.12-2.52.06-5.06-1-6.73-2.91-1.74-1.92-2.51-4.57-2.19-7.14C.91 9.8 2.76 7.48 5.37 6.64c.94-.31 1.94-.44 2.93-.38V10.3c-.87-.27-1.84-.13-2.61.38-.85.53-1.39 1.48-1.47 2.49-.12 1.34.61 2.71 1.77 3.39.81.49 1.79.58 2.67.24 1.02-.37 1.77-1.28 1.94-2.35.03-2.22.02-4.44.02-6.66-.02-2.48-.02-4.96-.02-7.44-.01-.1-.02-.2-.02-.3z" />
      </svg>
    )
  }

  return (
    <footer>
      {/* Cuerpo principal — gris oscuro #333333 */}
      <div style={{ backgroundColor: '#333333' }} className="text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Col 1 — Logo Oficial del Gobierno de Chiapas y descripción */}
          <div className="flex flex-col gap-4">
            <img
              src={LOGO_HQT}
              alt="Humanismo que Transforma - Gobierno de Chiapas"
              className="w-56"
            />
            <p className="text-xs opacity-60 leading-relaxed mt-2">
              Sistema Chiapaneco de Radio, Televisión y Cinematografía.
            </p>
          </div>

          {/* Col 2 — Acerca de */}
          <div>
            <h4 className="text-sm font-semibold mb-3 pb-2 text-white/95"
              style={{ borderBottom: '2px solid #611232' }}>
              Acerca de
            </h4>
            <ul className="space-y-3 mt-4">
              {[
                { n: 'Misión', h: '/transparencia' },
                { n: 'Visión', h: '/transparencia' }
              ].map(item => (
                <li key={item.n} className="flex items-center justify-between border-b border-white/10 pb-2">
                  <Link to={item.h} className="text-sm opacity-60 hover:opacity-100 hover:text-[#A57F2C] transition">
                    {item.n}
                  </Link>
                  <span className="opacity-40 text-xs">›</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Recursos */}
          <div>
            <h4 className="text-sm font-semibold mb-3 pb-2 text-white/95"
              style={{ borderBottom: '2px solid #611232' }}>
              Recursos
            </h4>
            <ul className="space-y-3 mt-4">
              {[
                { n: 'Acerca del Portal', h: '/transparencia' },
                { n: 'Avisos de Privacidad', h: '/privacidad' }
              ].map(item => (
                <li key={item.n} className="flex items-center justify-between border-b border-white/10 pb-2">
                  <Link to={item.h} className="text-sm opacity-60 hover:opacity-100 hover:text-[#A57F2C] transition">
                    {item.n}
                  </Link>
                  <span className="opacity-40 text-xs">›</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contáctanos */}
          <div>
            <h4 className="text-sm font-semibold mb-3 pb-2 text-white/95"
              style={{ borderBottom: '2px solid #611232' }}>
              Contáctanos
            </h4>
            <address className="not-italic text-sm opacity-60 leading-relaxed mt-4">
              Libramiento Norte Poniente s/n,<br />
              Colonia San Jorge C.P. 29039<br />
              Tuxtla Gutiérrez, Chiapas.<br />
              <span className="mt-2 block font-medium">
                Conmutador: (961) 61 705-00 Ext. 57000
              </span>
            </address>
          </div>

        </div>
      </div>

      {/* Barra inferior — más oscura (#1e1e1e) con enlaces oficiales */}
      <div style={{ backgroundColor: '#1e1e1e' }} className="text-white text-xs border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Enlaces a trámites oficiales de Chiapas */}
          <div className="flex flex-col gap-2">
            <div className="opacity-55 flex flex-wrap gap-x-2 gap-y-1 items-center">
              <span className="font-bold text-[11px] text-white/90">Trámites y Servicios:</span>
              {[
                { n: 'Buscar servicios', h: 'https://www.chiapas.gob.mx/servicios/buscar' },
                { n: 'Pago de Derechos', h: 'https://www.haciendachiapas.gob.mx/servicios-linea/derechos/servicios-linea.asp' },
                { n: 'Servicios por Entidad', h: 'https://www.chiapas.gob.mx/servicios/por-entidad' },
                { n: 'Servicios por Internet', h: 'https://www.chiapas.gob.mx/servicios/por-internet' }
              ].map((s, i, arr) => (
                <span key={s.n} className="inline-flex items-center">
                  <a href={s.h} target="_blank" rel="noreferrer" className="hover:opacity-100 hover:text-white transition">{s.n}</a>
                  {i < arr.length - 1 && <span className="mx-2 opacity-30">|</span>}
                </span>
              ))}
            </div>

            {/* Mantente Informado */}
            <div className="opacity-55 flex flex-wrap gap-x-2 gap-y-1 items-center">
              <span className="font-bold text-[11px] text-white/90">Mantente informado:</span>
              {[
                { n: 'TV', h: '/canal10', isLink: true },
                { n: 'Radio', h: '/radio', isLink: true },
                { n: 'Prensa', h: '/notas', isLink: true },
                { n: 'Redes sociales', h: '#', isLink: false }
              ].map((s, i, arr) => (
                <span key={s.n} className="inline-flex items-center">
                  {s.isLink ? (
                    <Link to={s.h} className="hover:opacity-100 hover:text-white transition">{s.n}</Link>
                  ) : (
                    <a href={s.h} className="hover:opacity-100 hover:text-white transition">{s.n}</a>
                  )}
                  {i < arr.length - 1 && <span className="mx-2 opacity-30">|</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Botones de Redes Sociales Dinámicos del Gestor */}
          <div className="flex gap-3 items-center">
            {Object.entries(redes).map(([name, url]) => {
              // Si la red social tiene enlace configurado en el gestor, se dibuja
              if (!url || url.trim() === '') return null
              
              return (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  title={name.toUpperCase()}
                  style={{ backgroundColor: '#333333', width: '32px', height: '32px' }}
                  className="rounded-lg flex items-center justify-center text-white/80 opacity-70 hover:opacity-100 hover:bg-[#611232] hover:scale-105 transition-all duration-300 shadow-sm"
                >
                  {socialIcons[name] || name[0].toUpperCase()}
                </a>
              )
            })}
          </div>

        </div>
      </div>
    </footer>
  )
}