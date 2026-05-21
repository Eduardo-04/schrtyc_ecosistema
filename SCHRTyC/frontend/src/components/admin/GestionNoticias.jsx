import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { Newspaper, Plus, Pencil, Trash2, Check, RefreshCw, Search, Star, X, Image as ImageIcon, ChevronRight, LayoutGrid, List, FileText, User, Calendar, ExternalLink } from 'lucide-react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { getNoticias, crearNoticia, editarNoticia, eliminarNoticia, getUploadUrl } from '../../services/api'
import ArchiveroInput from '../shared/ArchiveroInput'
import ArchiveroModal from '../shared/ArchiveroModal'

const CATEGORIAS = ['Tecnología', 'Televisión', 'Radio', 'Cine', 'Institucional', 'General']

const FORM_VACIO = {
  titulo: '', fecha: new Date().toISOString().split('T')[0],
  categoria: 'General', descripcion: '', contenido: '',
  imagen: '', imagenes: '',
  autor: 'Administrador', publicada: false, destacada: false
}

const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
    ['clean']
  ]
}

const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace('www.', '')
    return ['youtube.com', 'youtu.be', 'facebook.com', 'spotify.com', 'tiktok.com'].some(h => host.includes(h))
  } catch { return false }
}

const parseLines      = (raw = '') => {
  if (!raw || typeof raw !== 'string') return []
  return raw.split('\n').map(u => u.trim()).filter(Boolean)
}
const parseImageLines = (raw = '') => parseLines(raw).filter(u => !isVideoUrl(u))
const parseVideoLines = (raw = '') => parseLines(raw).filter(u => isVideoUrl(u))
const calcStats       = (texto = '') => ({ chars: texto.length, lines: texto.split('\n').filter(p => p.trim()).length })

// Helper para asegurar formato YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return ''
  // Si es un objeto Date
  if (date instanceof Date) return date.toISOString().split('T')[0]
  // Si es un string (puede venir como YYYY-MM-DD o ISO o con espacio)
  if (typeof date === 'string') {
    // Si viene como "Invalid Date" de algún proceso previo
    if (date.toLowerCase().includes('invalid')) return ''
    return date.split(' ')[0].split('T')[0]
  }
  return date
}

// ── Modal de Noticia ──
const ModalNoticia = memo(({ noticia, onGuardar, onCerrar }) => {
  const [form, setForm]       = useState(() => {
    if (!noticia) return { ...FORM_VACIO }
    return { ...FORM_VACIO, ...noticia, fecha: formatDate(noticia.fecha) }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState('basico')
  const [showArchiveroGaleria, setShowArchiveroGaleria] = useState(false)
  const contenidoRef = useRef(null)

  const mediaLines = useMemo(() => parseLines(form.imagenes || ''), [form.imagenes])
  const imageLines = useMemo(() => parseImageLines(form.imagenes || ''), [form.imagenes])
  const videoLines = useMemo(() => parseVideoLines(form.imagenes || ''), [form.imagenes])
  const stats      = useMemo(() => calcStats(form.contenido || ''), [form.contenido])

  const set = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }))

  const handleSelectGaleria = (ruta) => {
    const lineas = form.imagenes ? form.imagenes.trim() + '\n' + ruta : ruta
    set('imagenes', lineas)
    setShowArchiveroGaleria(false)
  }

  const handleSubmit = async (e) => {

    e?.preventDefault()
    if (!form.titulo?.trim()) return setError('El título es obligatorio')
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

  const quillRef = useRef(null)

  const insertarTagImagen = (n) => {
    const quill = quillRef.current?.getEditor()
    if (quill) {
      // ReactQuill a veces pierde el foco al hacer click en el botón, intentamos recuperar la selección
      let range = quill.getSelection(true)
      const index = range ? range.index : quill.getLength()
      quill.insertText(index, `\n[imagen:${n}]\n`)
      quill.setSelection(index + `\n[imagen:${n}]\n`.length)
      set('contenido', quill.root.innerHTML)
    } else {
      const tag = `<p><br></p><p>[imagen:${n}]</p><p><br></p>`
      set('contenido', (form.contenido || '') + tag)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#611232]/20 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-white relative">
        
        {showArchiveroGaleria && (
          <ArchiveroModal 
            onSelect={handleSelectGaleria} 
            onCerrar={() => setShowArchiveroGaleria(false)} 
          />
        )}

        {/* Header */}

        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-black text-[#611232] tracking-tight">{noticia ? 'Editar Nota' : 'Nueva Noticia'}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Editor Editorial SCHRTyC</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onCerrar} className="px-6 py-3 rounded-2xl text-xs font-black text-gray-400 hover:bg-gray-100 transition-all uppercase tracking-widest">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-[#611232] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#611232]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
              Publicar Cambios
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gray-50/50 border-r border-gray-50 p-6 space-y-2">
            {[
              { id: 'basico', label: 'Datos Básicos', icon: FileText },
              { id: 'multimedia', label: 'Multimedia', icon: ImageIcon },
              { id: 'contenido', label: 'Contenido', icon: List }
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${tab === t.id ? 'bg-[#611232] text-white shadow-lg' : 'text-gray-400 hover:bg-white'}`}
              >
                <t.icon size={18} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-10">
            {tab === 'basico' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título de la noticia *</label>
                  <input 
                    value={form.titulo} onChange={e => set('titulo', e.target.value)} 
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-lg font-black text-[#611232] focus:bg-white focus:border-[#611232] focus:ring-4 focus:ring-[#611232]/5 outline-none transition-all"
                    placeholder="Ej. El Sistema Chiapaneco fortalece su red..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
                    <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-[#611232] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                    <select value={form.categoria} onChange={e => set('categoria', e.target.value)} className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:bg-white focus:border-[#611232] outline-none">
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Autor de la Nota</label>
                    <input 
                      value={form.autor} onChange={e => set('autor', e.target.value)} 
                      className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-[#611232] outline-none" 
                      placeholder="Nombre del periodista..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Resumen del Copete</label>
                  <textarea 
                    value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={3}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-medium leading-relaxed focus:bg-white focus:border-[#611232] outline-none transition-all resize-none"
                    placeholder="Escribe un breve resumen de la noticia..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${form.publicada ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Estado</p>
                       <p className={`text-sm font-black uppercase ${form.publicada ? 'text-green-600' : 'text-gray-400'}`}>{form.publicada ? 'Publicada' : 'Borrador'}</p>
                    </div>
                    <button type="button" onClick={() => set('publicada', !form.publicada)} className={`w-12 h-6 rounded-full relative transition-all ${form.publicada ? 'bg-green-500' : 'bg-gray-300'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.publicada ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${form.destacada ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Visibilidad</p>
                       <p className={`text-sm font-black uppercase ${form.destacada ? 'text-amber-600' : 'text-gray-400'}`}>{form.destacada ? 'Destacada' : 'Normal'}</p>
                    </div>
                    <button type="button" onClick={() => set('destacada', !form.destacada)} className={`w-12 h-6 rounded-full relative transition-all ${form.destacada ? 'bg-amber-500' : 'bg-gray-300'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.destacada ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tab === 'multimedia' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <ArchiveroInput 
                  label="Imagen de Portada" 
                  placeholder="https://..." 
                  value={form.imagen} 
                  onChange={v => set('imagen', v)} 
                />
                
                {form.imagen && (
                  <div className="rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-sm aspect-video bg-gray-100">
                    <img src={getUploadUrl(form.imagen)} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Galería de Medios (Una URL por línea)</label>
                    <button 
                      type="button"
                      onClick={() => setShowArchiveroGaleria(true)}
                      className="px-4 py-1.5 bg-[#611232]/5 text-[9px] font-black text-[#611232] uppercase tracking-widest rounded-full hover:bg-[#611232] hover:text-white transition-all"
                    >
                      + Archivero
                    </button>
                  </div>

                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter mb-2 italic">Acepta imágenes de Google, videos de Youtube, Facebook, Spotify, etc.</p>
                  <textarea 
                    value={form.imagenes} onChange={e => set('imagenes', e.target.value)} rows={6}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-xs font-mono focus:bg-white focus:border-[#611232] outline-none transition-all resize-none"
                    placeholder="https://...jpg\nhttps://youtube.com/..."
                  />
                </div>

                {imageLines.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 pt-4">
                    {imageLines.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-gray-100 group">
                         <img src={getUploadUrl(url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                         <div className="absolute top-2 left-2 w-6 h-6 bg-[#611232] text-white text-[10px] font-black rounded-full flex items-center justify-center border border-white/20">{i+1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'contenido' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cuerpo de la Nota</label>
                   <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{stats.chars} caracteres</span>
                </div>
                
                {imageLines.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 p-4 bg-[#611232]/5 rounded-[2rem] border border-[#611232]/5">
                     <span className="text-[9px] font-black text-[#611232] uppercase tracking-widest w-full mb-2 ml-1">Insertar Imagen:</span>
                     {imageLines.map((_, i) => (
                       <button key={i} type="button" onClick={() => insertarTagImagen(i+1)} className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-[10px] font-black text-[#611232] hover:bg-[#611232] hover:text-white transition-all shadow-sm">
                          + Imagen {i+1}
                       </button>
                     ))}
                  </div>
                )}

                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-inner pb-[60px]">
                  <style>{`
                    .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f3f4f6 !important; background: #fafafa; padding: 12px 24px; }
                    .ql-container.ql-snow { border: none !important; }
                    .ql-editor { padding: 24px 32px; font-size: 14px; line-height: 1.8; min-height: 350px; }
                  `}</style>
                  <ReactQuill 
                    ref={quillRef}
                    theme="snow"
                    value={form.contenido || ''} 
                    onChange={v => set('contenido', v)} 
                    modules={QUILL_MODULES}
                    placeholder="Escribe el contenido aquí. Usa las herramientas para dar formato..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="px-10 py-4 bg-red-50 text-red-500 text-xs font-black uppercase tracking-widest text-center border-t border-red-100 animate-pulse">⚠️ {error}</div>}
      </div>
    </div>
  )
})


// ── Componente Principal ──
export default function GestionNoticias() {
  const [noticias, setNoticias]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [busqueda, setBusqueda]       = useState('')
  const [filtroCategoria, setFiltroC] = useState('')
  const [filtroPublicada, setFiltroP] = useState('')
  const [modalForm, setModalForm]     = useState(null)
  const [modalEliminar, setModalEl]   = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await getNoticias()
      setNoticias(Array.isArray(data) ? data : [])
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleGuardar = useCallback(async (form) => {
    if (form.id) await editarNoticia(form.id, form)
    else         await crearNoticia(form)
    await cargar()
  }, [cargar])

  const handleEliminar = useCallback(async () => {
    await eliminarNoticia(modalEliminar.id)
    setModalEl(null)
    await cargar()
  }, [cargar, modalEliminar])

  const handleTogglePublicada = useCallback(async (n) => {
    await editarNoticia(n.id, { ...n, publicada: !n.publicada })
    await cargar()
  }, [cargar])

  const noticiasFiltradas = useMemo(() => {
    return noticias.filter(n => {
      const okBusqueda  = !busqueda || n.titulo.toLowerCase().includes(busqueda.toLowerCase())
      const okCategoria = !filtroCategoria || n.categoria === filtroCategoria
      const okPublicada = filtroPublicada === '' ? true : (filtroPublicada === 'true' ? !!n.publicada : !n.publicada)
      return okBusqueda && okCategoria && okPublicada
    })
  }, [noticias, busqueda, filtroCategoria, filtroPublicada])

  const stats = useMemo(() => ({
    total: noticias.length,
    publicadas: noticias.filter(n => n.publicada).length,
    borradores: noticias.filter(n => !n.publicada).length
  }), [noticias])

  return (
    <div className="p-8 md:p-12 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-[#611232] rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#611232]">Editorial Digital</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-[#611232] tracking-tight flex items-center gap-4">
             Gestión de Noticias
             <span className="text-sm font-bold text-gray-300 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">{stats.total} notas</span>
           </h1>
        </div>
        <div className="flex gap-4">
           <button onClick={cargar} className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#611232] transition-all shadow-sm">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
           <button onClick={() => setModalForm('nueva')} className="flex items-center gap-3 px-8 py-4 bg-[#611232] text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-[#611232]/20 hover:scale-105 active:scale-95 transition-all">
              <Plus size={20} /> Nueva Noticia
           </button>
        </div>
      </div>

      {/* Filtros Premium */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#611232] transition-colors" />
           <input 
             value={busqueda} onChange={e => setBusqueda(e.target.value)} 
             placeholder="Buscar en el acervo periodístico..." 
             className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-gray-50 rounded-[1.2rem] text-sm font-bold focus:bg-white focus:border-[#611232]/30 outline-none transition-all"
           />
        </div>
        <div className="flex gap-4">
           <select value={filtroCategoria} onChange={e => setFiltroC(e.target.value)} className="px-6 py-4 bg-gray-50/50 border border-gray-50 rounded-[1.2rem] text-xs font-black uppercase tracking-widest outline-none focus:border-[#611232]/30">
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
           <select value={filtroPublicada} onChange={e => setFiltroP(e.target.value)} className="px-6 py-4 bg-gray-50/50 border border-gray-50 rounded-[1.2rem] text-xs font-black uppercase tracking-widest outline-none focus:border-[#611232]/30">
              <option value="">Todos los estados</option>
              <option value="true">Publicadas</option>
              <option value="false">Borradores</option>
           </select>
        </div>
      </div>

      {/* Lista de Noticias (Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="bg-white h-64 rounded-[3rem] animate-pulse border border-gray-50 shadow-sm"></div>)
        ) : noticiasFiltradas.map(n => (
          <div key={n.id} className="group bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
            <div className="aspect-video relative overflow-hidden bg-gray-100">
               <img src={getUploadUrl(n.imagen)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
               <div className="absolute top-6 right-6 flex gap-2">
                  {n.destacada && (
                    <div className="w-10 h-10 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                       <Star size={18} fill="currentColor" />
                    </div>
                  )}
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 border-white shadow-lg ${n.publicada ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                     {n.publicada ? 'Publicada' : 'Borrador'}
                  </div>
               </div>
               <div className="absolute inset-0 bg-[#611232]/0 group-hover:bg-[#611232]/40 backdrop-blur-[2px] transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-4 translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                     <button onClick={() => setModalForm(n)} className="w-14 h-14 bg-white text-[#611232] rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        <Pencil size={20} />
                     </button>
                     <button onClick={() => handleTogglePublicada(n)} className="w-14 h-14 bg-white text-[#611232] rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        {n.publicada ? <X size={20} /> : <Check size={20} />}
                     </button>
                     <button onClick={() => setModalEl(n)} className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        <Trash2 size={20} />
                     </button>
                  </div>
               </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
               <div className="flex items-center gap-3 mb-4">
                  <span className="text-[9px] font-black text-[#A57F2C] uppercase tracking-[0.2em]">{n.categoria}</span>
                  <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(n.fecha)}</span>
               </div>
               <h3 className="text-xl font-black text-gray-900 leading-tight mb-4 group-hover:text-[#611232] transition-colors line-clamp-2">{n.titulo}</h3>
               <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium leading-relaxed">{n.descripcion}</p>
               
               <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-400">
                     <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <User size={14} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest">{n.autor}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-200 group-hover:text-[#611232] group-hover:translate-x-2 transition-all" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {modalForm && (
        <ModalNoticia
          key={modalForm === 'nueva' ? 'nueva' : modalForm.id}
          noticia={modalForm === 'nueva' ? null : modalForm}
          onGuardar={handleGuardar}
          onCerrar={() => setModalForm(null)}
        />
      )}

      {/* Modal Eliminar Premium */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#611232]/20 backdrop-blur-md p-4">
           <div className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl border border-white">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                 <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#611232] mb-4 tracking-tight">¿Eliminar Noticia?</h3>
              <p className="text-gray-400 font-medium mb-10 leading-relaxed text-sm">
                La nota <span className="text-gray-800 font-bold">"{modalEliminar.titulo}"</span> será removida del acervo digital permanentemente.
              </p>
              <div className="flex gap-4">
                 <button onClick={() => setModalEl(null)} className="flex-1 py-4 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">Cancelar</button>
                 <button onClick={handleEliminar} className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">Confirmar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}