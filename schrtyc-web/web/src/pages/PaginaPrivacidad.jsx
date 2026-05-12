import { useState, useEffect } from 'react'
import { getPaginas } from '../services/api'

const parseTramites = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    if (!val.trim()) return []
    try { return JSON.parse(val) } catch { return [] }
  }
  return []
}

const ICONOS_TRAMITE = {
  documento: '📄', escudo: '🛡️', usuarios: '👥',
  balanza: '⚖️', edificio: '🏛️', estrella: '⭐',
}

function TarjetaSeccion({ tramite }) {
  const acento = tramite.accentColor ? `#${tramite.accentColor}` : '#611232'
  const icono = ICONOS_TRAMITE[tramite.icono] || '📄'
  const tieneCards = tramite.cards?.length > 0
  const tieneReqs  = tramite.requisitos?.length > 0

  return (
    <div style={{ backgroundColor: '#f8f9fa', borderRadius: 20, padding: '32px', border: '1px solid #f1f3f5' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{icono}</span>
        <h2 className="text-lg font-extrabold" style={{ color: '#611232', margin: 0 }}>
          {tramite.titulo}
        </h2>
      </div>
      
      {tramite.descripcion && (
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {tramite.descripcion}
        </p>
      )}

      {tieneCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {tramite.cards.map((card, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">{card.label}</p>
              <p className="text-sm font-semibold text-gray-700">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {tieneReqs && (
        <ul className="space-y-3 mb-6">
          {tramite.requisitos.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
              <span style={{ color: '#A57F2C' }} className="flex-shrink-0 mt-0.5 font-bold">✓</span>
              {item}
            </li>
          ))}
        </ul>
      )}

      {(tramite.contacto?.email || tramite.contacto?.direccion) && (
        <div style={{ backgroundColor: 'white', borderRadius: 12, padding: '16px', border: '1px solid #f3f4f6' }}>
          {tramite.contacto.email     && <p className="text-xs text-gray-500 mb-1">📧 {tramite.contacto.email}</p>}
          {tramite.contacto.direccion && <p className="text-xs text-gray-500 m-0">📍 {tramite.contacto.direccion}</p>}
        </div>
      )}

      {tramite.link?.href && (
        <a href={tramite.link.href} target="_blank" rel="noopener noreferrer"
          className="inline-block mt-6 text-xs font-bold hover:underline" style={{ color: '#611232' }}>
          {tramite.link.label || 'Ver más oficial'} →
        </a>
      )}
    </div>
  )
}

export default function PaginaPrivacidad() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    getPaginas()
      .then(res => { if (res?.['aviso-privacidad']) setData(res['aviso-privacidad']) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const titulo        = data?.titulo          || 'Avisos de Privacidad'
  const heroBadge     = data?.herobadge       || 'Legal'
  const heroDesc      = data?.herodescripcion || 'Tratamiento de datos personales conforme a la normativa vigente.'
  const contenido     = data?.contenido       || ''
  const imagenPortada = data?.imagenportada || data?.imagen_portada || ''

  const tramites = parseTramites(data?.tramites)
  const parrafos = contenido.split('\n\n').map(p => p.trim()).filter(Boolean)

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#611232]"></div>
    </div>
  )

  return (
    <>
      <div style={{ backgroundColor: '#611232' }} className="text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-widest uppercase opacity-60 mb-2">{heroBadge}</p>
          <h1 className="text-3xl font-bold">{titulo}</h1>
          <p className="opacity-70 text-sm mt-2">{heroDesc}</p>
        </div>
      </div>
      <div style={{ backgroundColor: '#A57F2C', height: '4px' }} />

      <div className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A57F2C] to-transparent hidden md:block"></div>
              
              <div className="flex flex-col gap-6 text-gray-600 text-sm md:text-base leading-relaxed pl-4">
                {parrafos.map((p, i) => (
                  <p key={i}>
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {imagenPortada && (
              <div className="order-1 md:order-2 relative px-4 py-4">
                {/* Marco desplazado */}
                <div className="absolute top-0 right-0 w-[90%] h-[90%] border-2 border-[#A57F2C] rounded-3xl translate-x-4 -translate-y-4 opacity-30"></div>
                
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-white group">
                  <img src={imagenPortada} alt={titulo} className="w-full h-auto min-h-[300px] max-h-[500px] object-contain block transition-transform duration-1000 group-hover:scale-110" />
                </div>
                
                {/* Badge minimalista */}
                <div className="absolute -bottom-2 right-10 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-50 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#A57F2C] animate-pulse"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contenido Destacado</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-10">
            {tramites.length > 0 && (
              <div className="flex flex-col gap-6">
                {tramites.map((t, i) => <TarjetaSeccion key={i} tramite={t} />)}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}