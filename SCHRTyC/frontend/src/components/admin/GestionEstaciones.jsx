import { useState, useEffect, useRef } from 'react'
import { Radio, Tv, Plus, Pencil, Trash2, Loader2, AlertCircle, Check, X, Wifi, WifiOff, Globe, Signal, ImagePlus } from 'lucide-react'
import { fetchEstacionesTodas, crearEstacion, editarEstacion, eliminarEstacion, subirArchivo, getUploadUrl } from '../../services/api'

const TIPOS = ['TV', 'Radio']
const FORM_VACIO = { nombre: '', tipo: 'Radio', streamUrl: '', activo: true, imagen: '' }

export default function GestionEstaciones() {
  const [estaciones, setEstaciones]   = useState([])
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando]       = useState(null)
  const [form, setForm]               = useState(FORM_VACIO)
  const [guardando, setGuardando]     = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState(null)
  const [toast, setToast]             = useState(null)
  const [imgFile, setImgFile]         = useState(null)   // File object pendiente de subir
  const [imgPreview, setImgPreview]   = useState(null)   // URL local para preview
  const fileInputRef                  = useRef(null)

  useEffect(() => {
    fetchEstacionesTodas()
      .then(setEstaciones)
      .catch(() => setError('No se pudieron cargar las estaciones'))
      .finally(() => setCargando(false))
  }, [])

  const mostrarToast = (mensaje, tipo = 'ok') => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const abrirCrear = () => {
    setEditando(null)
    setForm(FORM_VACIO)
    setImgFile(null)
    setImgPreview(null)
    setModalAbierto(true)
  }

  const abrirEditar = (est) => {
    setEditando(est)
    setForm({ ...est })
    setImgFile(null)
    setImgPreview(est.imagen ? getUploadUrl(est.imagen) : null)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEditando(null)
    setForm(FORM_VACIO)
    setImgFile(null)
    setImgPreview(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true)
    try {
      // Subir imagen si hay un archivo nuevo seleccionado
      let imagenFinal = form.imagen || ''
      if (imgFile) {
        const res = await subirArchivo(imgFile)
        imagenFinal = res.ruta
      }
      const datos = { ...form, imagen: imagenFinal }

      if (editando) {
        const actualizada = await editarEstacion(editando.id, datos)
        setEstaciones(es => es.map(e => e.id === actualizada.id ? actualizada : e))
        mostrarToast('Estación actualizada')
      } else {
        const nueva = await crearEstacion(datos)
        setEstaciones(es => [...es, nueva])
        mostrarToast('Estación creada')
      }
      cerrarModal()
    } catch (err) {
      mostrarToast(err.message || 'Error al guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id) => {
    try {
      await eliminarEstacion(id)
      setEstaciones(es => es.filter(e => e.id !== id))
      mostrarToast('Estación eliminada')
    } catch {
      mostrarToast('Error al eliminar', 'error')
    } finally {
      setConfirmEliminar(null)
    }
  }

  return (
    <div className="p-8 md:p-12 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">

      {/* Toast Premium */}
      {toast && (
        <div className={`fixed top-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-300
          ${toast.tipo === 'error' ? 'bg-red-500 text-white' : 'bg-[#611232] text-white'}`}>
          {toast.tipo === 'error' ? <AlertCircle size={20}/> : <Check size={20}/>}
          <span className="text-sm font-black uppercase tracking-widest">{toast.mensaje}</span>
        </div>
      )}

      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-[#A57F2C] rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A57F2C]">Infraestructura</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-[#611232] tracking-tight flex items-center gap-4">
             Estaciones y Señales
             <span className="text-sm font-bold text-gray-300 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">{estaciones.length} activas</span>
           </h1>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-3 px-8 py-4 bg-[#611232] text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-[#611232]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20}/>
          Nueva Estación
        </button>
      </div>

      {/* Grid de Estaciones */}
      {cargando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="bg-white h-48 rounded-[3rem] animate-pulse border border-gray-100 shadow-sm"></div>)}
        </div>
      ) : estaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
             <Signal size={48} strokeWidth={1} />
          </div>
          <p className="text-xl font-black text-gray-300 uppercase tracking-widest">Sin estaciones registradas</p>
          <button onClick={abrirCrear} className="mt-8 px-8 py-3 border border-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#611232] hover:text-[#611232] transition-all">
            Agregar primera señal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {estaciones.map(est => (
            <div key={est.id} className="group bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-24 h-24 ${est.tipo === 'TV' ? 'bg-[#611232]' : 'bg-[#A57F2C]'} opacity-[0.03] rounded-bl-[100%]`}></div>
               
               <div className="flex items-start justify-between mb-8">
                  {/* Logo o icono de la estación */}
                  <div className={`w-14 h-14 rounded-[1.2rem] overflow-hidden flex items-center justify-center shadow-lg flex-shrink-0 ${
                    est.imagen ? 'bg-gray-50 border border-gray-100' : (est.tipo === 'TV' ? 'bg-[#611232]' : 'bg-[#A57F2C]')
                  }`}>
                    {est.imagen
                      ? <img src={getUploadUrl(est.imagen)} alt={est.nombre} className="w-full h-full object-contain" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                      : null
                    }
                    <span style={{ display: est.imagen ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                      {est.tipo === 'TV' ? <Tv size={24} className="text-white"/> : <Radio size={24} className="text-white"/>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${est.activo ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`}></div>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{est.activo ? 'Online' : 'Offline'}</span>
                  </div>
               </div>

               <div className="mb-8">
                  <p className="text-xs font-black text-[#A57F2C] uppercase tracking-[0.2em] mb-1">{est.tipo === 'TV' ? 'Canal de Televisión' : 'Frecuencia de Radio'}</p>
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-[#611232] transition-colors">{est.nombre}</h3>
                  {est.streamUrl && (
                    <div className="flex items-center gap-2 mt-4 text-gray-400 group-hover:text-gray-600 transition-colors">
                       <Globe size={14} />
                       <span className="text-[10px] font-bold truncate max-w-[200px]">{est.streamUrl}</span>
                    </div>
                  )}
               </div>

               <div className="flex gap-3 pt-6 border-t border-gray-50">
                  <button onClick={() => abrirEditar(est)} className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#611232] hover:text-white transition-all flex items-center justify-center gap-2">
                    <Pencil size={14} /> Editar
                  </button>
                  <button onClick={() => setConfirmEliminar(est.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                    <Trash2 size={18}/>
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Rediseñado */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#611232]/20 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl border border-white overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-2xl font-black text-[#611232] tracking-tight">{editando ? 'Editar Estación' : 'Nueva Estación'}</h2>
              <button onClick={cerrarModal} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleGuardar} className="p-10 space-y-8">

              {/* Logo de la estación */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo de la Estación</label>
                <div className="flex items-center gap-5">
                  {/* Preview / placeholder */}
                  <div
                    className={`w-20 h-20 rounded-[1.2rem] overflow-hidden flex-shrink-0 flex items-center justify-center border-2 ${
                      imgPreview ? 'border-[#611232]/20 bg-gray-50' : 'border-dashed border-gray-200 bg-gray-50'
                    }`}
                  >
                    {imgPreview
                      ? <img src={imgPreview} alt="preview" className="w-full h-full object-contain p-1" />
                      : <span className="text-3xl select-none">📻</span>
                    }
                  </div>
                  {/* Botón de selección */}
                  <div className="flex flex-col gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black text-gray-500 uppercase tracking-widest hover:bg-[#611232] hover:text-white hover:border-[#611232] transition-all"
                    >
                      <ImagePlus size={16} />
                      {imgPreview ? 'Cambiar logo' : 'Subir logo'}
                    </button>
                    {imgPreview && (
                      <button
                        type="button"
                        onClick={() => { setImgFile(null); setImgPreview(null); setForm(f => ({ ...f, imagen: '' })) }}
                        className="text-[10px] font-bold text-red-400 hover:text-red-600 text-left pl-1 transition-colors"
                      >
                        × Quitar logo
                      </button>
                    )}
                    <p className="text-[10px] text-gray-300 font-medium pl-1">PNG, JPG o WEBP · Máx 10 MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Identificador *</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} required
                  placeholder="Ej: Radio Uno 92.5 FM"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-[#611232] focus:ring-4 focus:ring-[#611232]/5 outline-none transition-all"/>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Señal</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.2rem] text-sm font-bold outline-none focus:bg-white focus:border-[#611232]">
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-6 pl-4">
                  <button type="button" onClick={() => setForm(f => ({ ...f, activo: !f.activo }))} className={`w-12 h-6 rounded-full relative transition-all ${form.activo ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.activo ? 'left-7' : 'left-1'}`}></div>
                  </button>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">{form.activo ? 'Activa' : 'Inactiva'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL de Streaming / Enlace</label>
                <input name="streamUrl" value={form.streamUrl} onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.2rem] text-sm font-bold focus:bg-white focus:border-[#611232] outline-none transition-all"/>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={cerrarModal}
                  className="flex-1 py-4 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  className="flex-1 py-4 bg-[#611232] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#611232]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                  {guardando ? <Loader2 size={18} className="animate-spin"/> : <Check size={18} />}
                  {editando ? 'Actualizar' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar Eliminación Rediseñado */}
      {confirmEliminar && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#611232]/20 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl border border-white">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
               <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-[#611232] mb-4 tracking-tight">¿Eliminar señal?</h3>
            <p className="text-gray-400 font-medium mb-10 leading-relaxed text-sm">Esta acción desconectará la estación del sistema permanentemente.</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmEliminar(null)} className="flex-1 py-4 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">Volver</button>
              <button onClick={() => handleEliminar(confirmEliminar)} className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}