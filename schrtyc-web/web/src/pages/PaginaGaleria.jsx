import { useState, useEffect, useMemo } from 'react'
import { getPaginas, getGaleria, getGaleriaAutores, getUploadUrl } from '../services/api'

// ── Componente de Tarjeta de Obra ──────────────────────────────────────────
function ObraItem({ obra, onClick, onFiltrarAutor }) {
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
        <p className="text-gray-500 text-sm font-medium mb-1">
          Por{' '}
          <span 
            onClick={(e) => {
              e.stopPropagation()
              onFiltrarAutor(obra.autor)
            }}
            className="hover:text-[#611232] hover:underline cursor-pointer font-semibold"
          >
            {obra.autor || 'Anónimo'}
          </span>
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#A57F2C' }}>
          {obra.año || 'Sin fecha'} • {obra.ciudad || 'Chiapas'}
        </p>
      </div>
    </div>
  )
}

// ── Modal de Detalle (Pantalla Dividida) ──────────────────────────────────
function ModalObraFull({ obra, onClose, onFiltrarAutor }) {
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
            Por{' '}
            <span
              onClick={() => {
                onFiltrarAutor(obra.autor)
                onClose()
              }}
              className="hover:text-[#611232] hover:underline cursor-pointer font-bold"
            >
              {obra.autor || 'Artista no especificado'}
            </span>
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

// ── Modal de Artista (Bio) ─────────────────────────────────────────────────
function ModalArtista({ artista, onClose, onVerCatalogo }) {
  if (!artista) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 font-sans p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 hover:bg-white text-gray-800 transition-all shadow-sm"
        >
          ✕
        </button>
        
        <div className="w-full md:w-2/5 aspect-square md:aspect-auto md:h-auto bg-gray-100 relative">
          {artista.portada ? (
            <img 
              src={getUploadUrl(artista.portada)} 
              alt={artista.nombre} 
              className="w-full h-full object-cover object-center" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#611232] opacity-30 text-6xl">🎨</div>
          )}
        </div>
        
        <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col">
          <h2 className="text-2xl font-black text-[#611232] mb-2">{artista.nombre}</h2>
          <p className="text-xs font-bold text-[#A57F2C] uppercase tracking-widest mb-6">
            Artista Chiapaneco • {artista.obras.length} {artista.obras.length === 1 ? 'obra' : 'obras'}
          </p>
          
          <div className="flex-1 overflow-y-auto mb-8 pr-2">
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {artista.biografia || 'Sin biografía disponible. El artista aún no ha proporcionado su información biográfica.'}
            </p>
          </div>
          
          <button 
            onClick={() => onVerCatalogo(artista.nombre)}
            className="w-full mt-auto py-4 bg-[#611232] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-lg shadow-[#611232]/20"
          >
            Ver Catálogo de Obras
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página Principal Dinámica ──────────────────────────────────────────────
export default function PaginaGaleria() {
  const [data, setData] = useState(null)
  const [items, setItems] = useState([])
  const [autores, setAutores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroTecnica, setFiltroTecnica] = useState('Todas')
  const [obraSeleccionada, setObraSeleccionada] = useState(null)
  const [artistaSeleccionado, setArtistaSeleccionado] = useState(null)
  const [pestanaActiva, setPestanaActiva] = useState('obras')
  const [filtroAutor, setFiltroAutor] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    Promise.all([
      getPaginas().then(res => res?.galeria),
      getGaleria(),
      getGaleriaAutores()
    ]).then(([pageData, galleryItems, authorsList]) => {
      setData(pageData)
      setItems(galleryItems || [])
      setAutores(authorsList || [])
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

  const artistas = useMemo(() => {
    const grupos = {}
    autores.forEach(a => {
      grupos[a.nombre.trim()] = {
        nombre: a.nombre.trim(),
        portada: a.foto || '',
        biografia: a.biografia || '',
        obras: []
      }
    })

    items.forEach(obra => {
      const autorNorm = (obra.autor || 'Artista Anónimo').trim()
      if (!grupos[autorNorm]) {
        grupos[autorNorm] = {
          nombre: autorNorm,
          obras: [],
          portada: obra.imagen,
          biografia: ''
        }
      }
      grupos[autorNorm].obras.push(obra)
      if (!grupos[autorNorm].portada) {
         grupos[autorNorm].portada = obra.imagen
      }
    })
    return Object.values(grupos).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [items, autores])
  
  const filtradas = useMemo(() => {
    return items.filter(o => {
      const matchTecnica = filtroTecnica === 'Todas' || o.tecnica === filtroTecnica
      const matchAutor = !filtroAutor || (o.autor && o.autor.trim() === filtroAutor)
      return matchTecnica && matchAutor
    })
  }, [items, filtroTecnica, filtroAutor])

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#611232]"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white font-sans">
      <ModalObraFull 
        obra={obraSeleccionada} 
        onClose={() => setObraSeleccionada(null)} 
        onFiltrarAutor={(autor) => {
          setFiltroAutor(autor)
          setPestanaActiva('obras')
        }}
      />

      <ModalArtista
        artista={artistaSeleccionado}
        onClose={() => setArtistaSeleccionado(null)}
        onVerCatalogo={(autor) => {
          setArtistaSeleccionado(null)
          setFiltroAutor(autor)
          setPestanaActiva('obras')
        }}
      />

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
          
          {/* Selector de Pestañas (Tabs) Premium */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1.5 bg-gray-50 border border-gray-100 rounded-2xl shadow-inner">
              <button
                onClick={() => setPestanaActiva('obras')}
                className={`px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 ${
                  pestanaActiva === 'obras'
                    ? 'bg-white text-[#611232] shadow-md border border-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Obras (Catálogo)
              </button>
              <button
                onClick={() => setPestanaActiva('artistas')}
                className={`px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 ${
                  pestanaActiva === 'artistas'
                    ? 'bg-white text-[#611232] shadow-md border border-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Artistas (Directorio)
              </button>
            </div>
          </div>

          {pestanaActiva === 'obras' ? (
            <>
              {/* Filtro de Autor Activo */}
              {filtroAutor && (
                <div className="mb-8 flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl max-w-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filtrado por:</span>
                    <span className="bg-[#611232] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                      Artista: {filtroAutor}
                      <button 
                        onClick={() => setFiltroAutor(null)} 
                        className="hover:text-red-300 font-bold ml-1 transition-colors font-sans"
                        title="Quitar filtro"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                  <button
                    onClick={() => setFiltroAutor(null)}
                    className="text-xs font-bold text-[#A57F2C] hover:underline"
                  >
                    Mostrar todo
                  </button>
                </div>
              )}

              {/* Filtros de Técnica */}
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
                  <p className="text-lg font-bold">No se encontraron obras disponibles para los filtros seleccionados.</p>
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-8">
                  {filtradas.map(obra => (
                    <ObraItem 
                      key={obra.id} 
                      obra={obra} 
                      onClick={() => setObraSeleccionada(obra)} 
                      onFiltrarAutor={(autor) => {
                        setFiltroAutor(autor)
                        setPestanaActiva('obras')
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            // Directorio de Artistas
            <>
              <div className="flex justify-between items-end mb-16">
                <div>
                  <h2 className="text-2xl font-black text-[#611232]">Nuestros Creadores</h2>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Directorio de artistas en el acervo</p>
                </div>
                <div className="text-right">
                  <span style={{ color: '#A57F2C' }} className="text-5xl font-black">{artistas.length}</span>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Artistas registrados</p>
                </div>
              </div>

              {artistas.length === 0 ? (
                <div className="py-24 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                  <p className="text-lg font-bold">No se encontraron artistas registrados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {artistas.map(artista => (
                    <div
                      key={artista.nombre}
                      onClick={() => setArtistaSeleccionado(artista)}
                      className="group cursor-pointer bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full font-sans animate-in fade-in slide-in-from-bottom-4 duration-300"
                    >
                      {/* Foto de Portada */}
                      <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center border-b border-gray-100">
                        {artista.portada ? (
                          <img
                            src={getUploadUrl(artista.portada)}
                            alt={artista.nombre}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-[#611232] opacity-30 text-4xl">🎨</div>
                        )}
                        {/* Overlay gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        
                        {/* Badge de cantidad de obras flotando */}
                        <div className="absolute top-4 right-4">
                          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter text-[#611232] shadow-md border border-white">
                            {artista.obras.length} {artista.obras.length === 1 ? 'obra' : 'obras'}
                          </span>
                        </div>
                      </div>

                      {/* Detalle */}
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-black text-[#611232] leading-tight mb-2 group-hover:text-[#A57F2C] transition-colors">
                          {artista.nombre}
                        </h3>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-6">
                          Artista Chiapaneco
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-[#A57F2C] uppercase tracking-widest group-hover:text-[#611232] transition-colors">
                          <span>Ver Catálogo</span>
                          <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">→</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* Footer / CTA */}
      <footer style={{ backgroundColor: '#611232' }} className="py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
           <span className="text-[20vw] font-black text-white pointer-events-none select-none">ARTE</span>
        </div>
        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            {data?.cta_titulo || '¿Eres creador chiapaneco?'}
          </h2>
          <p className="text-white/70 mb-10 text-lg leading-relaxed">
            {data?.cta_descripcion || 'Forma parte del acervo digital del Sistema Chiapaneco de Radio, Televisión y Cinematografía.'}
          </p>
          <a
            href={data?.cta_link || 'mailto:galeria@radiotvycine.chiapas.gob.mx'}
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