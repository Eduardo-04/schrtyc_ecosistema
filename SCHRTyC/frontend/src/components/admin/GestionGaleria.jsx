import { useState, useEffect, useCallback, memo, useMemo } from 'react'
import { Palette, Plus, Pencil, Trash2, Check, RefreshCw, X, Image as ImageIcon, Settings2, Filter, Hash } from 'lucide-react'
import ArchiveroInput from '../shared/ArchiveroInput'
import { 
  getGaleria, crearGaleriaItem, editarGaleriaItem, eliminarGaleriaItem,
  getPaginas, editarPagina,
  getGaleriaFiltros, crearGaleriaFiltro, eliminarGaleriaFiltro
} from '../../services/api'

const FORM_VACIO = { 
  titulo: '', autor: '', tecnica: '', formato: '', 
  ciudad: '', año: '', descripcion: '', imagen: '', telefono: '' 
}

// ── Modal para Añadir/Editar Obra ──────────────────────────────────────────
const ModalGaleria = memo(({ item, onGuardar, onCerrar, tecnicas = [] }) => {
  const [form, setForm] = useState(item || { ...FORM_VACIO, tecnica: tecnicas[0] || '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.imagen) return setError('La URL de la imagen es obligatoria')
    if (!form.tecnica) return setError('Debes seleccionar una técnica')
    setLoading(true)
    try {
      await onGuardar(form)
      onCerrar()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#611232] outline-none text-sm font-bold text-gray-700 transition-all"
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 ml-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-lg font-black text-[#611232]">{item ? 'Editar Obra' : 'Nueva Obra'}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ficha Técnica Detallada</p>
          </div>
          <button onClick={onCerrar} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Título de la obra *</label>
              <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                className={inputClass} placeholder="Ej. La noche estrellada" required />
            </div>
            
            <div>
              <label className={labelClass}>Autor / Artista</label>
              <input value={form.autor} onChange={e => setForm({ ...form, autor: e.target.value })}
                className={inputClass} placeholder="Ej. Vincent van Gogh" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Técnica *</label>
                <select 
                  value={form.tecnica} 
                  onChange={e => setForm({ ...form, tecnica: e.target.value })}
                  className={inputClass}
                  required
                >
                  <option value="" disabled>Seleccionar...</option>
                  {tecnicas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Año</label>
                <input value={form.año} onChange={e => setForm({ ...form, año: e.target.value })}
                  className={inputClass} placeholder="1889" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Formato / Medidas</label>
                <input value={form.formato} onChange={e => setForm({ ...form, formato: e.target.value })}
                  className={inputClass} placeholder="73 x 92 cm" />
              </div>
              <div>
                <label className={labelClass}>Ciudad / Origen</label>
                <input value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })}
                  className={inputClass} placeholder="Saint-Rémy" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Teléfono de contacto</label>
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                className={inputClass} placeholder="961 123 4567" />
            </div>
          </div>

          <div className="space-y-6">
            <ArchiveroInput 
              label="URL de la imagen *"
              value={form.imagen}
              onChange={v => setForm({ ...form, imagen: v })}
              placeholder="https://..."
            />

            {form.imagen && (
              <div className="rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-50 aspect-video relative group">
                <img src={form.imagen} alt="Preview" className="w-full h-full object-cover" 
                  onError={e => e.target.style.display='none'} />
              </div>
            )}

            <div>
              <label className={labelClass}>Descripción / Reseña</label>
              <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                rows={4} className={`${inputClass} resize-none leading-relaxed text-xs`} 
                placeholder="Escribe una breve reseña..." />
            </div>
          </div>

          {error && <div className="col-span-full text-xs text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100 font-bold">⚠️ {error}</div>}
        </form>


        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onCerrar} className="px-8 py-3 rounded-2xl text-sm font-black text-gray-500 hover:bg-gray-200 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-10 py-3 rounded-2xl bg-[#611232] text-white font-black text-sm shadow-xl shadow-[#611232]/20 hover:scale-105 transition-all flex items-center gap-2">
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
            {item ? 'Actualizar' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
})

// ── Modal para Gestionar Filtros (Técnicas) ────────────────────────────────
function ModalFiltros({ filtros, onCrear, onEliminar, onCerrar }) {
  const [nuevo, setNuevo] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#611232]/20 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-[#611232]">Técnicas Oficiales</h3>
          <button onClick={onCerrar} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl transition-colors"><X size={24} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex gap-2">
            <input 
              value={nuevo} 
              onChange={e => setNuevo(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-[#A57F2C] outline-none text-sm font-bold text-gray-700"
              placeholder="Nueva técnica..."
            />
            <button 
              onClick={() => { onCrear(nuevo); setNuevo(''); }}
              className="p-3 bg-[#A57F2C] text-white rounded-2xl hover:scale-105 transition-transform shadow-lg"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {filtros.map(f => (
              <div key={f} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-gray-100 transition-colors">
                <span className="text-sm font-black text-gray-600 flex items-center gap-2">
                  <Hash size={14} className="text-[#A57F2C]" /> {f}
                </span>
                <button onClick={() => onEliminar(f)} className="p-2 text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
export default function GestionGaleria() {
  const [items, setItems] = useState([])
  const [pageData, setPageData] = useState(null)
  const [tecnicas, setTecnicas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [modalPagina, setModalPagina] = useState(false)
  const [modalFiltros, setModalFiltros] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const [galleryItems, allPages, filters] = await Promise.all([
        getGaleria(),
        getPaginas(),
        getGaleriaFiltros()
      ])
      setItems(galleryItems || [])
      setTecnicas(filters || [])
      setPageData(allPages?.galeria || {
        titulo: 'Galería de Arte',
        herobadge: 'Cultura Chiapaneca',
        herodescripcion: 'Patrimonio artístico y expresiones visuales.',
        seccionlabel: 'Exposiciones',
        secciontitulo: 'Acervo Artístico',
        contenido: '',
        imagenportada: ''
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleGuardar = useCallback(async (form) => {
    if (form.id) await editarGaleriaItem(form.id, form)
    else await crearGaleriaItem(form)
    cargar()
  }, [])

  const handleEliminar = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar esta obra de la galería?')) return
    await eliminarGaleriaItem(id)
    cargar()
  }, [])

  const handleGuardarPagina = useCallback(async (datos) => {
    await editarPagina('galeria', datos)
    cargar()
    setModalPagina(false)
  }, [])

  const handleCrearFiltro = useCallback(async (nombre) => {
    if (!nombre) return
    await crearGaleriaFiltro(nombre)
    cargar()
  }, [])

  const handleEliminarFiltro = useCallback(async (nombre) => {
    if (!window.confirm('¿Eliminar esta técnica de la lista oficial?')) return
    await eliminarGaleriaFiltro(nombre)
    cargar()
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Encabezado de Gestión */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#611232] flex items-center gap-3 m-0">
            <div className="p-2.5 bg-[#611232]/10 rounded-2xl"><Palette size={22} className="text-[#611232]" /></div>
            Gestor de Galería de Arte
          </h1>
          <p className="text-gray-400 text-[10px] mt-1 font-black uppercase tracking-[0.2em]">Curaduría y Control Editorial</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <button onClick={() => setModalFiltros(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
          >
            <Filter size={16} /> Técnicas
          </button>
           <button onClick={() => setModalPagina(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-[#A57F2C] hover:text-[#A57F2C] transition-all"
          >
            <Settings2 size={16} /> Página
          </button>
          <button onClick={() => setModal({})}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#611232] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#611232]/20"
          >
            <Plus size={18} /> Nueva Obra
          </button>
        </div>
      </div>

      {/* 2. Sección Editorial */}
      {!loading && pageData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6">
             <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] rotate-90 inline-block origin-right opacity-40 group-hover:opacity-100 transition-opacity underline decoration-[#A57F2C] decoration-2 underline-offset-4">EDITORIAL PREVIEW</span>
          </div>
          
          <div className="space-y-8">
            <div>
              <p className="text-[11px] font-black text-[#A57F2C] uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                <span className="w-10 h-1 bg-[#A57F2C] rounded-full"></span>
                {pageData.seccionlabel || 'Exposiciones'}
              </p>
              <h2 className="text-4xl font-black text-[#611232] leading-tight drop-shadow-sm">{pageData.secciontitulo || 'Acervo Artístico'}</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md font-medium border-l-4 border-gray-200 pl-6 py-2 italic">
              {pageData.contenido || 'Sin descripción introductoria.'}
            </p>
            <div className="pt-6 flex gap-10 border-t border-gray-100">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Título Web</p>
                <p className="text-sm font-black text-gray-800">{pageData.titulo}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Badge Hero</p>
                <p className="text-sm font-black text-gray-800">{pageData.herobadge}</p>
              </div>
            </div>
          </div>

          <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden border-[12px] border-white shadow-2xl bg-white flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
            {pageData.imagenportada ? (
              <img src={pageData.imagenportada} alt="Portada" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-200 flex flex-col items-center gap-4">
                <ImageIcon size={64} strokeWidth={1} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sin Imagen</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      )}

      {/* 3. Galería de Obras */}
      <div className="space-y-8">
        <div className="flex items-center gap-6">
           <h3 className="text-xl font-black text-gray-900 tracking-tight">Catálogo Digital</h3>
           <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent"></div>
           <div className="flex items-center gap-2 px-4 py-1.5 bg-[#A57F2C]/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#A57F2C] animate-pulse"></div>
              <span className="text-[10px] font-black text-[#A57F2C] uppercase tracking-widest">{items.length} obras</span>
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white aspect-[4/5] rounded-[2.5rem] animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
            {items.map(item => (
              <div key={item.id} className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <img 
                    src={item.imagen} 
                    alt={item.titulo} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-[#611232]/0 group-hover:bg-[#611232]/40 backdrop-blur-[2px] transition-all duration-500 flex flex-col justify-end p-6">
                    <div className="flex gap-3 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <button onClick={() => setModal(item)} className="flex-1 py-3 bg-white text-[#611232] rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95">Editar</button>
                      <button onClick={() => handleEliminar(item.id)} className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-2xl"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                     <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-[#611232] uppercase tracking-tighter border border-white shadow-sm">{item.tecnica || 'Obra'}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-gray-900 text-lg leading-tight mb-2 group-hover:text-[#611232] transition-colors truncate">{item.titulo}</h3>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-bold truncate">Por {item.autor || 'Anónimo'}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-4">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.año || 'S.F.'}</span>
                      <span className="text-[10px] font-black text-[#A57F2C] uppercase tracking-widest truncate max-w-[120px]">{item.ciudad || 'Chiapas'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
                <ImageIcon className="mx-auto text-gray-100 mb-6" size={80} strokeWidth={1} />
                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-sm">No hay obras en el acervo</p>
                <button onClick={() => setModal({})} className="mt-6 text-[#611232] font-black text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-8">Empezar Curaduría</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {modal && (
        <ModalGaleria
          item={modal.id ? modal : null}
          onGuardar={handleGuardar}
          onCerrar={() => setModal(null)}
          tecnicas={tecnicas}
        />
      )}

      {modalPagina && pageData && (
        <ModalPaginaGaleria 
          data={pageData} 
          onGuardar={handleGuardarPagina} 
          onCerrar={() => setModalPagina(false)} 
        />
      )}

      {modalFiltros && (
        <ModalFiltros 
          filtros={tecnicas} 
          onCrear={handleCrearFiltro} 
          onEliminar={handleEliminarFiltro} 
          onCerrar={() => setModalFiltros(false)} 
        />
      )}
    </div>
  )
}

// ── Modal Editorial (Info de la Página) ────────────────────────────────────
function ModalPaginaGaleria({ data, onGuardar, onCerrar }) {
  const [form, setForm] = useState(data || {
    titulo: 'Galería de Arte',
    herobadge: 'Cultura Chiapaneca',
    herodescripcion: 'Patrimonio artístico y expresiones visuales.',
    seccionlabel: 'Exposiciones',
    secciontitulo: 'Acervo Artístico',
    contenido: '',
    imagenportada: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onGuardar(form)
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-[#611232] outline-none text-sm font-bold text-gray-700 transition-all"
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#611232]/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-[#611232]">Configuración Editorial</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Narrativa y visuales de la galería</p>
          </div>
          <button onClick={onCerrar} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl transition-colors">
            <X size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-6 shadow-inner">
              <p className="text-[11px] font-black text-[#611232] uppercase tracking-[0.3em] border-b border-gray-200 pb-3">Hero Section</p>
              <div>
                <label className={labelClass}>Título de la Página</label>
                <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Hero Badge</label>
                  <input value={form.herobadge} onChange={e => setForm({ ...form, herobadge: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Título Intro</label>
                  <input value={form.secciontitulo} onChange={e => setForm({ ...form, secciontitulo: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Descripción Hero</label>
                <textarea value={form.herodescripcion} onChange={e => setForm({ ...form, herodescripcion: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
              </div>
            </div>

            <div className="space-y-6">
               <div>
                <label className={labelClass}>Contenido Editorial (Intro)</label>
                <textarea value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })} rows={6} className={`${inputClass} resize-none leading-relaxed text-xs`} placeholder="Escribe el texto de presentación..." />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-white border-4 border-gray-50 rounded-[2.5rem] space-y-6 shadow-sm">
              <p className="text-[11px] font-black text-[#A57F2C] uppercase tracking-[0.3em] border-b border-gray-200 pb-3">Banner Destacado</p>
              <ArchiveroInput 
                label="URL de la Imagen"
                value={form.imagenportada}
                onChange={v => setForm({ ...form, imagenportada: v })}
                placeholder="https://..."
              />
              {form.imagenportada && (
                <div className="aspect-[4/3] rounded-3xl overflow-hidden border-8 border-gray-50 shadow-2xl">
                  <img src={form.imagenportada} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

          </div>
        </form>

        <div className="px-10 py-8 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
          <button type="button" onClick={onCerrar} className="px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-colors">Descartar</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-12 py-4 rounded-2xl bg-[#611232] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#611232]/20 hover:scale-105 transition-all flex items-center gap-3">
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
            Publicar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}
