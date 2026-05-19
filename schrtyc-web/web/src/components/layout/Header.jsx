import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { label: 'Inicio',                  href: '/' },
  { label: 'Radio Chiapas',           href: '/radio' },
  { label: 'Canal 10.1',              href: '/canal10' },
  { label: 'Cine',                    href: '/cine' },
  { label: 'Galería de Arte',         href: '/galeria' },
  { label: 'Notas',                   href: '/notas' },
  { label: 'Participación Ciudadana', href: '/participacion' },
  { label: 'Transparencia',           href: '/transparencia' },
  { label: 'Avisos de Privacidad',    href: '/privacidad' },
  { label: 'Comité de Ética',         href: '/etica' },
]

const topLinks = [
  { label: 'Participa',     href: 'https://www.chiapas.gob.mx/participa/' },
  { label: 'Trámites',      href: 'https://www.chiapas.gob.mx/tramites/' },
  { label: 'Gobierno',      href: 'https://www.chiapas.gob.mx/tramites/' },
  { label: 'Transparencia', href: 'https://chiapas.gob.mx' },
]

export default function Header() {
  const { pathname } = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [topMenuAbierto, setTopMenuAbierto] = useState(false)

  return (
    <header style={{
      width: '100%', maxWidth: '100%',
      overflow: 'hidden', boxSizing: 'border-box',
      border: 'none', margin: 0, padding: 0
    }}>

      {/* ── Barra top ── */}
      <div style={{ backgroundColor: '#333333', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-y-2">
          
          {/* Left Corner: Escudo + chiapas.gob.mx */}
          <div className="flex items-center gap-2.5">
            <a href="https://chiapas.gob.mx" target="_blank" rel="noreferrer"
               style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img 
                src="http://radiotvycine.chiapas.gob.mx/assets/logo/escudo-icono.png" 
                alt="Escudo de Chiapas" 
                style={{ height: '26px', width: 'auto', display: 'block' }}
              />
            </a>
            <a href="https://chiapas.gob.mx" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '1px', textDecoration: 'none' }}>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '300', fontSize: '16px' }}>chiapas</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: '16px' }}>.gob.mx</span>
            </a>
          </div>

          {/* Right Corner: Nav Links + Search Icon + Hamburger for top links */}
          <div className="flex items-center gap-1.5">
            <a href="https://www.chiapas.gob.mx/busquedas/" target="_blank" rel="noreferrer"
               aria-label="Buscar"
               style={{
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 padding: '6px', borderRadius: '6px', textDecoration: 'none',
                 color: 'rgba(255,255,255,0.85)', transition: 'background-color 0.2s',
               }}
               onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
               onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                 <circle cx="11" cy="11" r="8"></circle>
                 <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
               </svg>
            </a>

            {/* Toggle button for governmental links on mobile */}
            <button
              onClick={() => setTopMenuAbierto(!topMenuAbierto)}
              className="md:hidden flex items-center justify-center p-1.5 rounded-lg text-white/85 hover:bg-white/12 transition-colors cursor-pointer"
              aria-label="Enlaces institucionales"
              style={{ background: 'none', border: 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {topMenuAbierto ? (
                  <path d="M18 6L6 18M6 6l12 12" style={{ stroke: 'currentColor' }} />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="1.5" style={{ fill: 'currentColor' }}></circle>
                    <circle cx="19" cy="12" r="1.5" style={{ fill: 'currentColor' }}></circle>
                    <circle cx="5" cy="12" r="1.5" style={{ fill: 'currentColor' }}></circle>
                  </>
                )}
              </svg>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {topLinks.map(item => (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
                  style={{
                    fontSize: '14.5px', color: 'rgba(255,255,255,0.85)',
                    textDecoration: 'none', fontWeight: '400',
                    padding: '4px 10px', borderRadius: '6px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          
          {/* Mobile Government Links Dropdown */}
          {topMenuAbierto && (
            <div className="w-full md:hidden flex flex-col gap-0.5 pt-2 pb-1 border-t border-white/10" style={{ boxSizing: 'border-box' }}>
              {topLinks.map(item => (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
                  style={{
                    fontSize: '14px', color: 'rgba(255,255,255,0.85)',
                    textDecoration: 'none', fontWeight: '400',
                    padding: '8px 12px', borderRadius: '6px',
                    transition: 'background-color 0.2s',
                    display: 'block'
                  }}
                  onClick={() => setTopMenuAbierto(false)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  {item.label}
                </a>
              ))}
            </div>
          )}
          
        </div>
      </div>

      {/* ── Banner SCHRTyC ── */}
      <div style={{
        backgroundColor: '#fff',
        lineHeight: 0,
        fontSize: 0,
        width: '100%',
        margin: 0,
        padding: 0,
        border: 'none'
      }}>
        <img
          src="http://radiotvycine.chiapas.gob.mx/assets/img/banner.jpg"
          alt="Sistema Chiapaneco de Radio, Televisión y Cinematografía"
          style={{
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: 0,
            padding: 0,
            border: 'none'
          }}
          onError={e => { e.target.style.display = 'none' }}
        />
      </div>

      {/* ── Franja textil ── xd */}

      {/* ── Nav desktop ── */}
      <div style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        margin: 0,
        padding: 0,
        borderTop: 'none'
      }} className="hidden md:block">
        <div style={{
          maxWidth: '80rem', margin: '0 auto',
          padding: '0 16px', overflowX: 'auto',
          boxSizing: 'border-box',
        }}>
          <nav style={{ display: 'flex', justifyContent: 'center' }}>
            {navLinks.map(item => {
              const activo = pathname === item.href
              return (
                <Link key={item.href} to={item.href} style={{
                  display: 'inline-block', padding: '14px 15px',
                  fontSize: '15px', textDecoration: 'none', whiteSpace: 'nowrap',
                  color: activo ? '#611232' : '#374151',
                  fontWeight: activo ? '600' : '400',
                  borderBottom: activo ? '2px solid #611232' : '2px solid transparent',
                  transition: 'color 0.2s', boxSizing: 'border-box',
                }}>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ── Nav móvil ── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', margin: 0, padding: 0 }} className="md:hidden">
        <div style={{
          padding: '0 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#611232', padding: '14px 0' }}>
            {navLinks.find(n => n.href === pathname)?.label ?? 'Menú'}
          </span>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px',
            }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: '22px', height: '2px',
                borderRadius: '2px', backgroundColor: '#611232',
                opacity: menuAbierto && i === 1 ? 0 : 1,
                transition: 'all 0.3s ease',
                transform: menuAbierto
                  ? i === 0 ? 'rotate(45deg) translate(5px, 5px)'
                  : i === 2 ? 'rotate(-45deg) translate(5px, -5px)'
                  : 'none'
                  : 'none',
              }} />
            ))}
          </button>
        </div>

        {menuAbierto && (
          <div style={{ borderTop: '1px solid #f0f0f0', width: '100%', boxSizing: 'border-box' }}>
            {navLinks.map(item => {
              const activo = pathname === item.href
              return (
                <Link key={item.href} to={item.href}
                  onClick={() => setMenuAbierto(false)}
                  style={{
                    display: 'block', padding: '13px 16px',
                    fontSize: '15px', textDecoration: 'none',
                    color: activo ? '#611232' : '#374151',
                    fontWeight: activo ? '600' : '400',
                    backgroundColor: activo ? '#fdf2f5' : 'white',
                    borderLeft: activo ? '3px solid #611232' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                  }}>
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>

    </header>
  )
}