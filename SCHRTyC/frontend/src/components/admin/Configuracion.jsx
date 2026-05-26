import { useState, useEffect } from 'react'
import {
  Settings, Save, Check, Layout, Globe, Share2, 
  ShieldAlert, Phone, Mail, MapPin, Loader2, AlertCircle, Info, Image as ImageIcon, Plus, Trash2
} from 'lucide-react'
import { getConfiguracion, actualizarConfiguracion, subirArchivo, getUploadUrl } from '../../services/api'

const TABS = [
  { id: 'identidad', label: 'Identidad', icono: Layout },
  { id: 'banners',   label: 'Banners Inicio', icono: ImageIcon },
  { id: 'seo',       label: 'SEO & Redes', icono: Globe },
  { id: 'contacto',  label: 'Contacto',    icono: Phone },
  { id: 'sistema',   label: 'Sistema',     icono: ShieldAlert },
]

export default function Configuracion() {
  const [tabActiva, setTabActiva] = useState('identidad')
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await getConfiguracion()
      // Asegurarnos de que el array banners exista dentro de sistema
      if (!data.sistema.banners) {
        data.sistema.banners = []
      }
      setConfig(data)
    } catch (err) {
      mostrarToast('Error al cargar configuración', 'error')
    } finally {
      setLoading(false)
    }
  }

  const mostrarToast = (mensaje, tipo = 'ok') => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await actualizarConfiguracion(config)
      mostrarToast('Configuración actualizada')
    } catch (err) {
      mostrarToast(err.message || 'Error al guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const update = (seccion, campo, valor) => {
    setConfig(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }))
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-[#611232]" size={48} />
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Cargando Ajustes Globales...</p>
    </div>
  )

  return (
    <div className="p-8 md:p-12 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {toast && (
        <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-white text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4 ${toast.tipo === 'error' ? 'bg-red-500' : 'bg-[#611232]'}`}>
          {toast.mensaje}
        </div>
      )}

      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-[#A57F2C] rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A57F2C]">Panel Técnico</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-[#611232] tracking-tight">Ajustes Globales</h1>
           <p className="text-gray-400 font-medium mt-4">Configura la identidad y comportamiento de tu portal digital.</p>
        </div>
        <button 
          onClick={handleGuardar} 
          disabled={guardando}
          className="flex items-center gap-3 px-10 py-4 bg-[#611232] text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-[#611232]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {guardando ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 space-y-3 bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm shrink-0">
          {TABS.map(({ id, label, icono: Icono }) => (
            <button 
              key={id} 
              onClick={() => setTabActiva(id)} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${tabActiva === id ? 'bg-[#611232] text-white shadow-xl shadow-[#611232]/20' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Icono size={18} />
              <span className="uppercase tracking-widest text-[11px]">{label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white p-12 rounded-[3.5rem] border border-gray-50 shadow-sm min-h-[600px]">
          
          <form className="animate-in fade-in duration-500">
            {tabActiva === 'identidad' && (
              <div className="space-y-10">
                <div className="flex items-center gap-3 text-[#A57F2C]">
                  <Layout size={20} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Identidad Institucional</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre de la Institución</label>
                    <input value={config.identidad.nombre} onChange={e => update('identidad', 'nombre', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white focus:border-[#611232] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Siglas</label>
                    <input value={config.identidad.siglas} onChange={e => update('identidad', 'siglas', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white focus:border-[#611232] transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Eslogan</label>
                  <input value={config.identidad.eslogan} onChange={e => update('identidad', 'eslogan', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white focus:border-[#611232] transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL Logo (PNG Transparente)</label>
                    <input value={config.identidad.logoUrl} onChange={e => update('identidad', 'logoUrl', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL Favicon (.ico / .png)</label>
                    <input value={config.identidad.faviconUrl} onChange={e => update('identidad', 'faviconUrl', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white transition-all" />
                  </div>
                </div>
              </div>
            )}

            {tabActiva === 'seo' && (
              <div className="space-y-10">
                <div className="flex items-center gap-3 text-[#A57F2C]">
                  <Globe size={20} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">SEO y Posicionamiento</h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título Principal (Meta Title)</label>
                    <input value={config.seo.tituloPrincipal} onChange={e => update('seo', 'tituloPrincipal', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción para buscadores (Meta Description)</label>
                    <textarea value={config.seo.descripcionMeta} onChange={e => update('seo', 'descripcionMeta', e.target.value)} rows={3} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-medium outline-none focus:bg-white resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Palabras Clave (separadas por coma)</label>
                    <input value={config.seo.keywords} onChange={e => update('seo', 'keywords', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none" />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-[#A57F2C] mb-8">
                    <Share2 size={20} />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Redes Sociales</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Facebook</label>
                      <input value={config.redes.facebook} onChange={e => update('redes', 'facebook', e.target.value)} className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Instagram</label>
                      <input value={config.redes.instagram} onChange={e => update('redes', 'instagram', e.target.value)} className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">X (Twitter)</label>
                      <input value={config.redes.twitter} onChange={e => update('redes', 'twitter', e.target.value)} className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">YouTube</label>
                      <input value={config.redes.youtube} onChange={e => update('redes', 'youtube', e.target.value)} className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">TikTok</label>
                      <input value={config.redes.tiktok} onChange={e => update('redes', 'tiktok', e.target.value)} className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tabActiva === 'contacto' && (
              <div className="space-y-10">
                <div className="flex items-center gap-3 text-[#A57F2C]">
                  <Phone size={20} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Datos de Contacto</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono Público</label>
                    <input value={config.contacto.telefono} onChange={e => update('contacto', 'telefono', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                    <input value={config.contacto.email} onChange={e => update('contacto', 'email', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dirección Física</label>
                  <input value={config.contacto.direccion} onChange={e => update('contacto', 'direccion', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Horarios de Atención</label>
                  <input value={config.contacto.horario} onChange={e => update('contacto', 'horario', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white transition-all" />
                </div>
              </div>
            )}

            {tabActiva === 'sistema' && (
              <div className="space-y-10">
                <div className="flex items-center gap-3 text-[#A57F2C]">
                  <ShieldAlert size={20} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Control del Sistema</h3>
                </div>

                <div className={`p-8 rounded-[2.5rem] border transition-all ${config.sistema.modoMantenimiento ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Modo Mantenimiento</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Si se activa, los usuarios verán una pantalla de aviso.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={config.sistema.modoMantenimiento} onChange={e => update('sistema', 'modoMantenimiento', e.target.checked)} className="sr-only peer" />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  {config.sistema.modoMantenimiento && (
                    <div className="space-y-2 animate-in zoom-in-95">
                      <label className="block text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">Mensaje para los visitantes</label>
                      <textarea value={config.sistema.mensajeMantenimiento} onChange={e => update('sistema', 'mensajeMantenimiento', e.target.value)} rows={3} className="w-full px-6 py-4 bg-white border border-red-100 rounded-[1.5rem] text-sm font-medium outline-none focus:border-red-500 resize-none" />
                    </div>
                  )}
                </div>

                <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] flex gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                      <Info size={24} />
                   </div>
                   <div className="space-y-2 pt-1">
                      <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest">Información Técnica</h4>
                      <p className="text-[10px] text-blue-600/70 font-medium leading-relaxed">
                        Los cambios guardados se propagarán a la caché del portal web en un máximo de 5 minutos. 
                        Para actualizaciones críticas inmediatas, recomendamos limpiar la caché del navegador del lado del cliente.
                      </p>
                   </div>
                </div>
              </div>
            )}

            {tabActiva === 'banners' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between gap-3 text-[#A57F2C]">
                  <div className="flex items-center gap-3">
                    <ImageIcon size={20} />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Banners de Inicio</h3>
                  </div>
                  <button type="button" onClick={() => {
                    const nuevos = [...(config.sistema.banners || []), { id: Date.now().toString(), imagen: '', url: '', activo: true }]
                    update('sistema', 'banners', nuevos)
                  }} className="flex items-center gap-2 px-4 py-2 bg-[#611232] text-white rounded-xl text-xs font-bold hover:opacity-90">
                    <Plus size={14} /> Añadir Banner
                  </button>
                </div>

                <div className="space-y-6">
                  {(!config.sistema.banners || config.sistema.banners.length === 0) ? (
                    <p className="text-sm text-gray-400 font-medium text-center py-10 border-2 border-dashed rounded-3xl">No hay banners activos en este momento.</p>
                  ) : config.sistema.banners.map((banner, index) => (
                    <div key={banner.id} className="p-6 bg-gray-50 border border-gray-100 rounded-3xl flex gap-6 items-start relative">
                      <div className="w-48 h-32 bg-gray-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative group">
                        {banner.imagen ? (
                          <img src={getUploadUrl(banner.imagen)} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={32} className="text-gray-400" />
                        )}
                        <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-xs font-bold">
                          Subir Foto
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            if (!e.target.files[0]) return
                            try {
                              const res = await subirArchivo(e.target.files[0])
                              const nuevos = [...config.sistema.banners]
                              nuevos[index].imagen = res.url
                              update('sistema', 'banners', nuevos)
                            } catch(err) {
                              mostrarToast('Error al subir imagen', 'error')
                            }
                          }} />
                        </label>
                      </div>

                      <div className="flex-1 space-y-4 pt-2">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Enlace / URL de destino</label>
                          <input value={banner.url} onChange={e => {
                            const nuevos = [...config.sistema.banners]; nuevos[index].url = e.target.value; update('sistema', 'banners', nuevos)
                          }} className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-[#611232]" placeholder="https://..." />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={banner.activo} onChange={e => {
                              const nuevos = [...config.sistema.banners]; nuevos[index].activo = e.target.checked; update('sistema', 'banners', nuevos)
                            }} className="w-4 h-4 rounded text-[#611232] focus:ring-[#611232]" />
                            <span className="text-xs font-bold text-gray-700">Banner Activo</span>
                          </label>
                          <button type="button" onClick={() => {
                            const nuevos = config.sistema.banners.filter((_, i) => i !== index)
                            update('sistema', 'banners', nuevos)
                          }} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  )
}