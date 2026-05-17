import { useState, useEffect } from 'react'
import { getPaginas, getGaleria, getUploadUrl } from '../services/api'

// ── Componente de Tarjeta de Obra ──────────────────────────────────────────
function ObraItem({ obra, onClick }) {
  return (
    <div 
      className="group cursor-pointer flex flex-col font-sans break-inside-avoid mb-12" 
      onClick={onClick}
    >
      <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-xl mb-4 flex items-center justify-center">
        <img
          src={getUploadUrl(obra.imagen)}
          alt={obra.titulo}
          className="w-full h-auto block transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        
        {/* Badge de Técnica flotante (solo en hover) */}
        <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
           <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter text-[#611232] shadow-lg border border-white">
             {obra.tecnica || 'Obra'}
           </span>
        </div>
      </div>
      
      <div className="px-1">
        <h3 className="text-lg font-black leading-tight mb-1 group-hover:text-[#611232] transition-colors" style={{ color: '#611232' }}>
          {obra.titulo}
        </h3>
        <p className="text-gray-500 text-sm font-medium mb-1">Por {obra.autor || 'Anónimo'}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#A57F2C' }}>
          {obra.año || 'Sin fecha'} • {obra.ciudad || 'Chiapas'}
        </p>
      </div>
    </div>
  )
}

// ── Modal de Detalle (Pantalla Dividida) ──────────────────────────────────
function ModalObraFull({ obra, onClose }) {
  if (!obra) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-white animate-in fade-in zoom-in-95 duration-300 font-sans">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[110] w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all border border-[#611232]/20 text-[#611232] hover:scale-110"
      >
        <span className="text-xl font-bold">✕</span>
      </button>

      <div className="w-full md:w-3/5 h-64 md:h-full bg-neutral-900 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Fondo decorativo difuminado */}
        <img src={getUploadUrl(obra.imagen)} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-150" alt="" />
        <img
          src={getUploadUrl(obra.imagen)}
          alt={obra.titulo}
          className="relative max-w-full max-h-full object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.6)]"
        />
      </div>

      <div className="w-full md:w-2/5 h-full overflow-y-auto p-10 md:p-16 flex flex-col bg-white">
        <div className="mb-10">
          <p style={{ color: '#A57F2C' }} className="text-xs font-black tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
            <span className="w-8 h-px bg-[#A57F2C]"></span>
            {obra.año || 'Sin fecha'}
          </p>
          <h2 style={{ color: '#611232' }} className="text-4xl md:text-5xl font-black leading-tight mb-4">
            {obra.titulo}
          </h2>
          <p className="text-xl text-gray-500 font-semibold italic">
            Por {obra.autor || 'Artista no especificado'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 mb-12">
          <div className="border-l-2 border-gray-100 pl-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Técnica</p>
            <p className="text-gray-800 font-bold text-sm">{obra.tecnica || 'No especificada'}</p>
          </div>
          <div className="border-l-2 border-gray-100 pl-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Formato</p>
            <p className="text-gray-800 font-bold text-sm">{obra.formato || 'No especificado'}</p>
          </div>
          <div className="col-span-2 border-l-2 border-gray-100 pl-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Origen / Ubicación</p>
            <p className="text-gray-800 font-bold text-sm">{obra.ciudad || 'Chiapas, México'}</p>
          </div>
        </div>

        {obra.descripcion && (
          <div className="border-t border-gray-100 pt-10 mb-10">
             <p className="text-gray-600 leading-relaxed">
              {obra.descripcion}
            </p>
          </div>
        )}

        {obra.telefono && (
          <div className="mt-auto pt-10">
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:border-[#A57F2C] transition-colors">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Contacto para adquisición</p>
                <p style={{ color: '#611232' }} className="text-xl font-black">
                  {obra.telefono}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#A57F2C]/10 flex items-center justify-center text-[#A57F2C] group-hover:bg-[#A57F2C] group-hover:text-white transition-all">
                📞
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Página Principal Dinámica ──────────────────────────────────────────────
export default function PaginaGaleria() {
  const [data, setData] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroTecnica, setFiltroTecnica] = useState('Todas')
  const [obraSeleccionada, setObraSeleccionada] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    Promise.all([
      getPaginas().then(res => res?.galeria),
      getGaleria()
    ]).then(([pageData, galleryItems]) => {
      setData(pageData)
      setItems(galleryItems || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const titulo        = data?.titulo          || 'Galería de Arte'
  const heroBadge     = data?.herobadge       || 'Cultura Chiapaneca'
  const heroDesc      = data?.herodescripcion || 'Patrimonio artístico y expresiones visuales.'
  const seccionLabel  = data?.seccionlabel    || 'Exposiciones'
  const seccionTitulo = data?.secciontitulo   || 'Acervo Artístico'
  const contenido     = data?.contenido       || ''
  const imagenPortada = data?.imagenportada || data?.imagen_portada || ''

  const parrafos = contenido.split('\n\n').map(p => p.trim()).filter(Boolean)
  const tecnicas = ['Todas', ...new Set(items.map(o => o.tecnica).filter(Boolean))]
  
  const filtradas = items.filter(o => 
    filtroTecnica === 'Todas' || o.tecnica === filtroTecnica
  )

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#611232]"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white font-sans">
      <ModalObraFull obra={obraSeleccionada} onClose={() => setObraSeleccionada(null)} />

      {/* Header Institucional */}
      <div style={{ backgroundColor: '#611232' }} className="text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs tracking-widest uppercase opacity-60 mb-2">{heroBadge}</p>
          <h1 className="text-3xl font-bold">{titulo}</h1>
          <p className="opacity-70 text-sm mt-2">{heroDesc}</p>
        </div>
      </div>
      <div style={{ backgroundColor: '#A57F2C', height: '4px' }} />

      <main className="max-w-7xl mx-auto px-6 pt-8 pb-24">
        
        {/* 1. Intro Editorial Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-10">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A57F2C] to-transparent hidden lg:block"></div>
            {seccionLabel && (
              <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-4 text-[#A57F2C] flex items-center gap-3">
                <span className="w-8 h-px bg-[#A57F2C]"></span>
                {seccionLabel}
              </p>
            )}
            <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight" style={{ color: '#611232' }}>{seccionTitulo}</h2>
            <div className="flex flex-col gap-6 text-gray-600 text-sm md:text-base leading-relaxed pl-4">
              {parrafos.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>

          {imagenPortada && (
            <div className="order-1 lg:order-2 relative px-4 py-4">
              <div className="absolute top-0 right-0 w-[90%] h-[90%] border-2 border-[#A57F2C] rounded-3xl translate-x-4 -translate-y-4 opacity-30"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-gray-50 flex items-center justify-center">
                <img src={getUploadUrl(imagenPortada)} alt="Galeria" className="w-full h-auto max-h-[500px] object-contain block bg-white" />
              </div>
              <div className="absolute -bottom-2 right-10 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-50 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#A57F2C] animate-pulse"></div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contenido Destacado</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Filtros y Galería */}
        <div className="border-t border-gray-100 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Filtrar por Técnica</p>
              <div className="flex flex-wrap gap-6">
                {tecnicas.map(t => (
                  <button 
                    key={t} 
                    onClick={() => setFiltroTecnica(t)}
                    className={`text-sm font-bold uppercase tracking-widest transition-all pb-2 border-b-2 ${filtroTecnica === t ? 'text-[#611232] border-[#A57F2C]' : 'text-gray-300 border-transparent hover:text-gray-500'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span style={{ color: '#A57F2C' }} className="text-5xl font-black">{filtradas.length}</span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Obras en catálogo</p>
            </div>
          </div>

          {filtradas.length === 0 ? (
            <div className="py-24 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
              <p className="text-lg font-bold">No se encontraron obras disponibles.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-8">
              {filtradas.map(obra => (
                <ObraItem key={obra.id} obra={obra} onClick={() => setObraSeleccionada(obra)} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer / CTA */}
      <footer style={{ backgroundColor: '#611232' }} className="py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
           <span className="text-[20vw] font-black text-white pointer-events-none select-none">ARTE</span>
        </div>
        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">¿Eres creador chiapaneco?</h2>
          <p className="text-white/70 mb-10 text-lg leading-relaxed">
            Forma parte del acervo digital del Sistema Chiapaneco de Radio, Televisión y Cinematografía.
          </p>
          <a
            href="mailto:galeria@radiotvycine.chiapas.gob.mx"
            style={{ backgroundColor: '#A57F2C' }}
            className="inline-block text-white px-10 py-4 text-xs font-black tracking-[0.2em] uppercase rounded-full hover:scale-105 transition-transform shadow-xl"
          >
            Someter mi obra
          </a>
        </div>
      </footer>
    </div>
  )
}