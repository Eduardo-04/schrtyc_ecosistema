import { useState, useEffect } from 'react'
import GestionUsuarios from './GestionUsuarios'
import {
  Settings, Save, Check, Layout, Globe, Share2, 
  ShieldAlert, Phone, Mail, MapPin, Loader2, AlertCircle, Info, Image as ImageIcon, Plus, Trash2, Users
} from 'lucide-react'
import { getConfiguracion, actualizarConfiguracion, subirArchivo, getUploadUrl } from '../../services/api'

const TABS = [
  { id: 'seo',       label: 'SEO & Redes', icono: Globe },
  { id: 'usuarios',  label: 'Usuarios y Roles', icono: Users },
]

export default function Configuracion() {
  const [tabActiva, setTabActiva] = useState('seo')
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
                   <div className="animate-in fade-in duration-500">
            {tabActiva === 'usuarios' && (
              <div className="space-y-10">
                <div className="-mt-8 -mx-8">
                  <GestionUsuarios />
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


          </div>

        </div>
      </div>
    </div>
  )
}