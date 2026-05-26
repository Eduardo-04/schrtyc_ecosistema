import { useState, useEffect } from 'react'
import { Image as ImageIcon, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { getConfiguracion, actualizarConfiguracion, subirArchivo, getUploadUrl } from '../../services/api'

export default function GestionBanners() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    cargar()
  }, [])
  const [tab, setTab] = useState('banners') // 'banners' | 'docs'
  const cargar = async () => {
    setLoading(true)
    try {
      const data = await getConfiguracion()
      if (!data.sistema.banners) data.sistema.banners = []
      if (!data.sistema.documentos || data.sistema.documentos.length === 0) {
        data.sistema.documentos = [
              { id: 'def1', nombre: 'Constitución Política de los Estados Unidos Mexicanos', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/CONSTITUCION%20POLITICA%20DE%20LOS%20ESTADOS%20UNIDOS%20MEXICANOS.pdf' },
              { id: 'def2', nombre: 'Constitución Política del Estado Libre y Soberano de Chiapas', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/CONSTITUCION%20POLITICA%20DEL%20ESTADO%20LIBRE%20Y%20SOBERANO%20DE%20CHIAPAS.PDF' },
              { id: 'def3', nombre: 'Decreto de creación', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/1_dec_cre_01.pdf' },
              { id: 'def4', nombre: 'Reformas al Decreto de Creación marzo/2007', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/1_1_ref_mar_07.pdf' },
              { id: 'def5', nombre: 'Reformas al Decreto de Creación octubre/2008', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/1_2_ref_oct_08.pdf' },
              { id: 'def6', nombre: 'Reformas al Decreto de Creación diciembre/2008', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/1_3_ref_dic_08.pdf' },
              { id: 'def7', nombre: 'Reformas al Decreto de Creación enero/2009', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/1_4_ref_ene_09.pdf' },
              { id: 'def8', nombre: 'Reformas al Decreto de Creación septiembre/2011', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/2_1_ref_sep_11.pdf' },
              { id: 'def9', nombre: 'Reformas al Decreto de Creación febrero/2018', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/2_2_ref_feb_18.pdf' },
              { id: 'def10', nombre: 'Reformas al Decreto de Creación febrero/2019', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/2_3_ref_feb_19.pdf' },
              { id: 'def11', nombre: 'Organigrama', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/3_1_org.pdf' },
              { id: 'def12', nombre: 'Reglamento interior', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/3_2_regl_int_23.pdf' },
              { id: 'def13', nombre: 'Reforma A-465-2025 al Reglamento interior', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/A_465_2025.pdf' },
              { id: 'def14', nombre: 'Manuales de inducción', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/3_3_man_ind.pdf' },
              { id: 'def15', nombre: 'Manual de organización', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/3_4_man_org.pdf' },
              { id: 'def16', nombre: 'Manual de procedimientos', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/3_5_proc.pdf' },
              { id: 'def17', nombre: 'PO 112 SEGUNDA SECCIÓN 27/AGOSTO/2008', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/5_1_ing_pat.pdf' },
              { id: 'def18', nombre: 'Normas y Tarifas para la aplicación de viáticos y pasajes del Estado de Chiapas', url: 'http://radiotvycine.chiapas.gob.mx/assets/docs/MarcoJuridico/6_1_nor_via.pdf' }
        ]
      }
      setConfig(data)
    } catch (err) {
      mostrarToast('Error al cargar banners', 'error')
    } finally {
      setLoading(false)
    }
  }

  const mostrarToast = (mensaje, tipo = 'ok') => {
    setToast({ mensaje, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      await actualizarConfiguracion(config)
      mostrarToast('Banners actualizados correctamente')
    } catch (err) {
      mostrarToast(err.message || 'Error al guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const updateBanners = (nuevos) => setConfig({ ...config, sistema: { ...config.sistema, banners: nuevos } })
  const updateDocs = (nuevos) => setConfig({ ...config, sistema: { ...config.sistema, documentos: nuevos } })

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-[#611232]" size={48} />
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Cargando Banners...</p>
    </div>
  )

  const banners = config?.sistema?.banners || []

  return (
    <div className="p-8 md:p-12 space-y-8 max-w-[1200px] mx-auto animate-in fade-in duration-700">
      {toast && (
        <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-white text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4 ${toast.tipo === 'error' ? 'bg-red-500' : 'bg-[#611232]'}`}>
          {toast.mensaje}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-[#A57F2C] rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A57F2C]">Panel Web</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-[#611232] tracking-tight">Página de Inicio</h1>
           <p className="text-gray-400 font-medium mt-4 max-w-xl">
             Administra los banners promocionales y los documentos del marco jurídico que aparecen en la portada.
           </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleGuardar} 
            disabled={guardando}
            className="flex items-center gap-3 px-10 py-4 bg-[#611232] text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-[#611232]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {guardando ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Guardar Todo
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
        <button onClick={() => setTab('banners')} className={`px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all ${tab === 'banners' ? 'bg-[#611232] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>Banners</button>
        <button onClick={() => setTab('docs')} className={`px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all ${tab === 'docs' ? 'bg-[#611232] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>Marco Jurídico</button>
      </div>

      {tab === 'banners' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => updateBanners([...banners, { id: Date.now().toString(), imagen: '', url: '', activo: true }])}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-[#611232] rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-gray-200"
            >
              <Plus size={16} /> Añadir Banner
            </button>
          </div>
          {banners.length === 0 ? (
          <div className="bg-white p-16 rounded-[3rem] border border-gray-50 shadow-sm text-center">
            <ImageIcon size={64} className="mx-auto text-gray-200 mb-6" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No hay banners activos</h3>
            <p className="text-gray-400 font-medium">Haz clic en "Añadir" para subir tu primer banner promocional.</p>
          </div>
        ) : banners.map((banner, index) => (
          <div key={banner.id} className="p-8 bg-white border border-gray-50 rounded-[3rem] shadow-sm flex flex-col md:flex-row gap-8 items-start relative animate-in slide-in-from-bottom-4">
            <div className="w-full md:w-72 h-40 bg-gray-100 rounded-3xl overflow-hidden shrink-0 flex items-center justify-center relative group shadow-inner">
              {banner.imagen ? (
                <img src={getUploadUrl(banner.imagen)} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sin Imagen</span>
                </div>
              )}
              <label className="absolute inset-0 bg-[#611232]/80 text-white flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                <Plus size={24} />
                <span className="text-xs font-black uppercase tracking-widest">Subir Imagen</span>
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  if (!e.target.files[0]) return
                  try {
                    const res = await subirArchivo(e.target.files[0])
                    const nuevos = [...banners]
                    nuevos[index] = { ...nuevos[index], imagen: res.ruta }
                    updateBanners(nuevos)
                  } catch(err) {
                    mostrarToast('Error al subir imagen', 'error')
                  }
                }} />
              </label>
            </div>

            <div className="flex-1 w-full space-y-6 pt-2">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Enlace / URL de destino al hacer clic</label>
                <input value={banner.url} onChange={e => {
                  const nuevos = [...banners]; nuevos[index].url = e.target.value; updateBanners(nuevos)
                }} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white focus:border-[#611232] transition-all" placeholder="https://..." />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-12 h-6 rounded-full transition-colors relative ${banner.activo ? 'bg-[#611232]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${banner.activo ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" checked={banner.activo} onChange={e => {
                    const nuevos = [...banners]; nuevos[index].activo = e.target.checked; updateBanners(nuevos)
                  }} className="hidden" />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-600 group-hover:text-[#611232] transition-colors">Visible al público</span>
                </label>

                <button type="button" onClick={() => {
                  const nuevos = banners.filter((_, i) => i !== index)
                  updateBanners(nuevos)
                }} className="flex items-center gap-2 text-red-500 hover:text-white px-4 py-2 hover:bg-red-500 rounded-xl transition-colors">
                  <Trash2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {tab === 'docs' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => updateDocs([...(config?.sistema?.documentos||[]), { id: Date.now().toString(), nombre: 'Nuevo Documento', url: '' }])}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-[#611232] rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-gray-200"
            >
              <Plus size={16} /> Añadir Documento
            </button>
          </div>
          {(config?.sistema?.documentos||[]).map((doc, index) => (
            <div key={doc.id || index} className="p-6 bg-white border border-gray-50 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 space-y-4 w-full">
                <input value={doc.nombre} onChange={e => {
                  const n = [...config.sistema.documentos]; n[index].nombre = e.target.value; updateDocs(n)
                }} className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-[#611232]" placeholder="Nombre del documento" />
                <input value={doc.url} onChange={e => {
                  const n = [...config.sistema.documentos]; n[index].url = e.target.value; updateDocs(n)
                }} className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-xl text-xs outline-none focus:bg-white focus:border-[#611232]" placeholder="https://... ó /uploads/..." />
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <label className="text-center px-4 py-2 bg-gray-100 text-[#611232] rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-200 transition-colors">
                  Subir PDF
                  <input type="file" accept=".pdf" className="hidden" onChange={async (e) => {
                    if (!e.target.files[0]) return
                    try {
                      const res = await subirArchivo(e.target.files[0])
                      const n = [...config.sistema.documentos]; n[index].url = res.ruta; updateDocs(n)
                    } catch(err) { mostrarToast('Error al subir PDF', 'error') }
                  }} />
                </label>
                <button type="button" onClick={() => {
                  const n = config.sistema.documentos.filter((_, i) => i !== index); updateDocs(n)
                }} className="px-4 py-2 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
