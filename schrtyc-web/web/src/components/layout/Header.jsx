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

  return (
    <header style={{
      width: '100%', maxWidth: '100%',
      overflow: 'hidden', boxSizing: 'border-box',
      border: 'none', margin: 0, padding: 0
    }}>

      {/* ── Barra top ── */}
      <div style={{ backgroundColor: '#2d2d2d', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center gap-2">
          
          {/* Left Corner: chiapas.gob.mx */}
          <div className="w-full md:w-auto md:flex-1 flex justify-center md:justify-start">
            <a href="https://chiapas.gob.mx" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '300', fontSize: '14px' }}>chiapas</span>
              <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>.gob.mx</span>
            </a>
          </div>

          {/* Center: Nav Links */}
          <nav className="w-full md:w-auto flex justify-center flex-wrap gap-1">
            {topLinks.map(item => (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
                style={{
                  fontSize: '13px', color: 'rgba(255,255,255,0.85)',
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

          {/* Right Corner: Empty space to balance the flex container and keep nav centered */}
          <div className="hidden md:block md:flex-1"></div>
          
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