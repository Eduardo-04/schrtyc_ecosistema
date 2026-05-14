import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ArrowLeft, Plus, Pencil, Trash2, Image as ImageIcon, Loader2,
  AlertCircle, X, Check, Eye, EyeOff, ChevronDown, Link, Globe, Play, User, Clock, Search, RefreshCw
} from 'lucide-react'
import {
  fetchProgramas,
  fetchEstaciones,
  crearProgramaCatalogo,
  editarProgramaCatalogo,
  eliminarProgramaCatalogo,
  getUploadUrl
} from '../../services/api'
import ArchiveroInput from '../shared/ArchiveroInput'

const TIPOS = ['TV', 'Radio']
const FORM_VACIO = {
  nombre: '', conductor: '', horario: '',
  descripcion: '', descripcionLarga: '',
  imagen: '', tipo: 'TV', estacion: '',
  activo: true, embeds: []
}
const EMBED_VACIO = { titulo: '', url: '' }

// ── Utilidades ────────────────────────────────────────────────
const esUrlValida = (url = '') => {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch { return false }
}

const detectarTipo = (url = '') => {
  if (!esUrlValida(url)) return 'generic'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('facebook.com')) return 'facebook'
  if (url.includes('soundcloud.com')) return 'soundcloud'
  if (url.includes('spotify.com')) return 'spotify'
  return 'generic'
}

const colorEmbed = (url) => ({
  youtube:    { bg: 'bg-red-600', label: 'YT' },
  facebook:   { bg: 'bg-blue-600', label: 'FB' },
  soundcloud: { bg: 'bg-orange-500', label: 'SC' },
  spotify:    { bg: 'bg-green-500', label: 'SP' },
  generic:    { bg: 'bg-[#611232]', label: 'EM' },
}[detectarTipo(url)])

const normalizarEmbed = (url) => {
  if (!url) return url
  const tipo = detectarTipo(url)
  if (tipo === 'youtube') {
     const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
     return match ? `https://www.youtube.com/embed/${match[1]}` : url
  }
  if (tipo === 'spotify') {
     const match = url.match(/spotify\.com\/(track|episode|show|playlist|album)\/([a-zA-Z0-9]+)/)
     if (match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`
  }
  return url
}

const getYoutubeThumbnail = (url) => {
  if (!url) return null
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

const getCardImage = (prog) => {
  if (prog.imagen) return { src: getUploadUrl(prog.imagen), tipo: 'poster' }
  const embeds = (prog.embeds || []).filter(e => esUrlValida(e.url))
  const yt = embeds.find(e => detectarTipo(e.url) === 'youtube')
  if (yt) {
    const thumb = getYoutubeThumbnail(yt.url)
    if (thumb) return { src: thumb, tipo: 'youtube' }
  }
  return null
}

// ── Componente principal ──────────────────────────────────────
export default function GestionProgramas() {
  const [programas, setProgramas]             = useState([])
  const [estaciones, setEstaciones]           = useState([])
  const [filtroEst, setFiltroEst]             = useState('')
  const [cargando, setCargando]               = useState(true)
  const [programaActivo, setProgramaActivo]   = useState(null)
  const [modoEdicion, setModoEdicion]         = useState(false)

  const [form, setForm]                       = useState(FORM_VACIO)
  const [guardando, setGuardando]             = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState(null)
  const [toast, setToast]                     = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [progs, ests] = await Promise.all([fetchProgramas(), fetchEstaciones()])
      setProgramas(progs)
      setEstaciones(ests)
    } catch { mostrarToast('Error al cargar datos', 'error') }
    finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const mostrarToast = (mensaje, tipo = 'ok') => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const programasFiltrados = useMemo(() => {
    return filtroEst ? programas.filter(p => p.estacion === filtroEst) : programas
  }, [programas, filtroEst])

  const verDetalle = (prog) => {
    setProgramaActivo(prog)
    setForm({ ...FORM_VACIO, ...prog, embeds: prog.embeds || [] })
    setModoEdicion(false)
  }

  const volverALista = () => {
    setProgramaActivo(null)
    setModoEdicion(false)
  }

  const abrirNuevo = () => {
    setProgramaActivo('nuevo')
    setForm({ ...FORM_VACIO })
    setModoEdicion(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const agregarEmbed = () => 
    setForm(f => ({ ...f, embeds: [...(f.embeds || []), { ...EMBED_VACIO }] }))

  const actualizarEmbed = (idx, campo, valor) =>
    setForm(f => ({
      ...f,
      embeds: f.embeds.map((e, i) => i === idx ? { ...e, [campo]: valor } : e)
    }))

  const eliminarEmbed = (idx) =>
    setForm(f => ({ ...f, embeds: f.embeds.filter((_, i) => i !== idx) }))

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true)
    try {
      const datos = {
        ...form,
        embeds: (form.embeds || []).map(em => ({
          titulo: em.titulo,
          url: normalizarEmbed(em.url)
        }))
      }
      if (programaActivo === 'nuevo') {
        const nuevo = await crearProgramaCatalogo(datos)
        setProgramas(ps => [...ps, nuevo])
        setProgramaActivo(nuevo)
        setForm({ ...nuevo, embeds: nuevo.embeds || [] })
        mostrarToast('Programa creado')
      } else {
        const actualizado = await editarProgramaCatalogo(programaActivo.id, datos)
        setProgramas(ps => ps.map(p => p.id === actualizado.id ? actualizado : p))
        setProgramaActivo(actualizado)
        setForm({ ...actualizado, embeds: actualizado.embeds || [] })
        mostrarToast('Programa actualizado')
      }
      setModoEdicion(false)
    } catch (err) {
      mostrarToast(err.message || 'Error al guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id) => {
    try {
      await eliminarProgramaCatalogo(id)
      setProgramas(ps => ps.filter(p => p.id !== id))
      volverALista()
      mostrarToast('Programa eliminado')
    } catch {
      mostrarToast('Error al eliminar', 'error')
    } finally {
      setConfirmEliminar(null)
    }
  }

  // ── RENDER: Lista ─────────────────────────────────────────
  if (!programaActivo) {
    return (
      <div className="p-8 md:p-12 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
        {toast && (
          <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-white text-xs font-black uppercase tracking-widest ${toast.tipo === 'error' ? 'bg-red-500' : 'bg-[#611232]'}`}>
            {toast.mensaje}
          </div>
        )}

        {/* Header Editorial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
             <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-1 bg-[#A57F2C] rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A57F2C]">Producción Audiovisual</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-[#611232] tracking-tight flex items-center gap-4">
               Catálogo de Programas
               <span className="text-sm font-bold text-gray-300 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">{programas.length} series</span>
             </h1>
          </div>
          <button onClick={abrirNuevo} className="flex items-center gap-3 px-8 py-4 bg-[#611232] text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-[#611232]/20 hover:scale-105 active:scale-95 transition-all">
             <Plus size={20} /> Nuevo Programa
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4">
           <select value={filtroEst} onChange={e => setFiltroEst(e.target.value)} className="px-6 py-4 bg-white border border-gray-100 rounded-[1.2rem] text-xs font-black uppercase tracking-widest outline-none shadow-sm focus:border-[#611232]/30">
              <option value="">Todas las estaciones</option>
              {estaciones.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
           </select>
           <button onClick={cargar} className="p-4 bg-white border border-gray-100 rounded-[1.2rem] text-gray-400 hover:text-[#611232] transition-all shadow-sm">
              <RefreshCw size={20} className={cargando ? 'animate-spin' : ''} />
           </button>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => <div key={i} className="bg-white h-72 rounded-[3rem] animate-pulse border border-gray-50 shadow-sm"></div>)}
          </div>
        ) : programasFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <ImageIcon size={48} className="text-gray-200 mb-6" />
            <p className="text-xl font-black text-gray-300 uppercase tracking-widest">Sin programas registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {programasFiltrados.map(prog => {
              const cardImg = getCardImage(prog)
              const embedsActivos = (prog.embeds || []).filter(e => esUrlValida(e.url))
              return (
                <div key={prog.id} onClick={() => verDetalle(prog)} className="group bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col">
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                    {cardImg ? (
                      <img src={cardImg.src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#611232] to-[#A57F2C] opacity-80 flex items-center justify-center">
                         <span className="text-4xl font-black text-white/20 uppercase tracking-tighter">{prog.nombre.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-lg ${prog.activo ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                          {prog.activo ? 'On Air' : 'Pausa'}
                       </span>
                    </div>
                    {embedsActivos.length > 0 && (
                      <div className="absolute bottom-6 left-6 flex gap-1">
                        {embedsActivos.slice(0, 3).map((em, i) => (
                           <div key={i} className={`w-5 h-5 ${colorEmbed(em.url).bg} rounded-md border border-white/20 flex items-center justify-center text-[8px] font-black text-white shadow-lg`}>
                              {colorEmbed(em.url).label}
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="text-[9px] font-black text-[#A57F2C] uppercase tracking-[0.2em]">{prog.tipo}</span>
                       <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{prog.estacion}</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight mb-4 group-hover:text-[#611232] transition-colors">{prog.nombre}</h3>
                    
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-gray-400">
                          <Clock size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{prog.horario || 'S.H.'}</span>
                       </div>
                       <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#611232] group-hover:text-white transition-all">
                          <Play size={12} fill="currentColor" />
                       </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── RENDER: Detalle / Editor (Unificado con el estilo de Paginas) ──────────────────────────────
  return (
    <div className="p-8 md:p-12 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
       <div className="flex items-center justify-between mb-8">
          <button onClick={volverALista} className="flex items-center gap-3 text-sm font-black text-gray-400 hover:text-[#611232] transition-all uppercase tracking-widest">
             <ArrowLeft size={18} /> Volver al catálogo
          </button>
          {!modoEdicion && (
            <div className="flex gap-4">
               <button onClick={() => setModoEdicion(true)} className="px-8 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-500 hover:text-[#611232] hover:border-[#611232] transition-all uppercase tracking-widest shadow-sm">Editar Programa</button>
               <button onClick={() => setConfirmEliminar(form.id)} className="px-8 py-3 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Eliminar</button>
            </div>
          )}
       </div>

       {modoEdicion ? (
         <form onSubmit={handleGuardar} className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-12 rounded-[3.5rem] border border-gray-50 shadow-sm relative">
            <div className="space-y-8">
               <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Programa *</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-lg font-black text-[#611232] focus:bg-white focus:border-[#611232] outline-none transition-all" />
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Conductor</label>
                     <input name="conductor" value={form.conductor} onChange={handleChange} className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-1">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Horario</label>
                     <input name="horario" value={form.horario} onChange={handleChange} className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo</label>
                     <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none">
                        {TIPOS.map(t => <option key={t}>{t}</option>)}
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estación</label>
                     <select 
                       name="estacion" 
                       value={form.estacion} 
                       onChange={(e) => {
                         const val = e.target.value;
                         setForm(f => ({ 
                           ...f, 
                           estacion: val,
                           tipo: val.toLowerCase().includes('radio') ? 'Radio' : 'TV'
                         }));
                       }} 
                       className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                     >
                        <option value="">— Selecciona —</option>
                        {estaciones.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
                     </select>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción Larga</label>
                  <textarea name="descripcionLarga" value={form.descripcionLarga} onChange={handleChange} rows={6} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-medium leading-relaxed focus:bg-white outline-none resize-none" />
               </div>

               <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => programaActivo === 'nuevo' ? volverALista() : setModoEdicion(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Cancelar</button>
                  <button type="submit" disabled={guardando} className="flex-1 py-4 bg-[#611232] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#611232]/20 hover:scale-105 active:scale-95 transition-all">
                     {guardando ? 'Guardando...' : 'Guardar Programa'}
                  </button>
               </div>
            </div>

            <div className="space-y-8">
               <ArchiveroInput 
                  label="URL de Portada" 
                  name="imagen"
                  value={form.imagen} 
                  onChange={(v) => setForm(f => ({ ...f, imagen: v }))} 
               />


               <div className="rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-sm aspect-video bg-gray-50">
                  {form.imagen ? <img src={getUploadUrl(form.imagen)} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={48} /></div>}
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Multimedia / Embeds</label>
                     <button type="button" onClick={agregarEmbed} className="text-[10px] font-black text-[#611232] uppercase hover:underline">+ Agregar</button>
                  </div>
                  <div className="space-y-4">
                     {form.embeds.map((em, i) => (
                        <div key={i} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-50 space-y-4 relative">
                           <button type="button" onClick={() => eliminarEmbed(i)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><X size={16} /></button>
                           <input value={em.titulo} onChange={e => actualizarEmbed(i, 'titulo', e.target.value)} placeholder="Título del video/audio" className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none" />
                           <input value={em.url} onChange={e => actualizarEmbed(i, 'url', e.target.value)} placeholder="URL (YouTube, Spotify...)" className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-mono outline-none" />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </form>
       ) : (
         <div className="bg-white rounded-[4rem] border border-gray-50 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 aspect-video md:aspect-auto bg-gray-100">
               {getCardImage(form) ? <img src={getCardImage(form).src} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-gradient-to-br from-[#611232] to-[#A57F2C] opacity-80"></div>}
            </div>
            <div className="w-full md:w-1/2 p-12 md:p-20 space-y-10">
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <span className="px-4 py-1.5 bg-[#A57F2C]/10 text-[#A57F2C] rounded-full text-[10px] font-black uppercase tracking-widest">{form.tipo}</span>
                     <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{form.estacion}</span>
                  </div>
                  <h2 className="text-5xl font-black text-[#611232] leading-none mb-6">{form.nombre}</h2>
                  <div className="flex flex-wrap gap-8">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#611232]"><User size={18} /></div>
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Conducción</p>
                           <p className="text-sm font-bold text-gray-700">{form.conductor || 'No especificado'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#A57F2C]"><Clock size={18} /></div>
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Horario</p>
                           <p className="text-sm font-bold text-gray-700">{form.horario || 'Sin horario'}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="border-t border-gray-50 pt-10">
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">{form.descripcionLarga || form.descripcion}</p>
               </div>

               {form.embeds.length > 0 && (
                  <div className="space-y-6 pt-10 border-t border-gray-50">
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Multimedia Relacionada</h3>
                     <div className="grid grid-cols-2 gap-4">
                        {form.embeds.filter(e => esUrlValida(e.url)).map((em, i) => (
                           <div key={i} className="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-50 flex items-center gap-4">
                              <div className={`w-8 h-8 ${colorEmbed(em.url).bg} rounded-lg flex items-center justify-center text-white text-[9px] font-black`}>
                                 {colorEmbed(em.url).label}
                              </div>
                              <span className="text-[10px] font-bold text-gray-700 truncate">{em.titulo || 'Ver Contenido'}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>
       )}

       {confirmEliminar && (
         <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#611232]/50 p-4 animate-in zoom-in-95">
           <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl border border-white">
             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trash2 size={32} />
             </div>
             <h3 className="text-2xl font-black text-[#611232] mb-4 tracking-tight">¿Eliminar programa?</h3>
             <p className="text-gray-400 font-medium mb-10 leading-relaxed text-sm">Esta serie será removida permanentemente del catálogo digital.</p>
             <div className="flex gap-4">
               <button onClick={() => setConfirmEliminar(null)} className="flex-1 py-4 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">Cancelar</button>
               <button onClick={() => handleEliminar(confirmEliminar)} className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">Eliminar</button>
             </div>
           </div>
         </div>
       )}
    </div>
  )
}