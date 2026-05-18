import { useState, useEffect } from 'react'
import { Tv, RefreshCw, Clock, Mic, Radio, Plus, Pencil, Trash2, X, Check, Upload, FileSpreadsheet, AlertTriangle, Filter } from 'lucide-react'
import { useProgramacion } from '../../hooks/useProgramacion'
import { crearPrograma, editarPrograma, eliminarPrograma, fetchEstaciones, previewImportar, guardarImportar, limpiarProgramacion } from '../../services/api'

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

const FORM_VACIO = {
  hora_inicio:'', hora_fin:'', nombre:'',
  conductor:'', estacion:'Canal 10 TV',
  descripcion:'', tipo:'TV'
}

const horaAMinutos = (h) => {
  const [hh, mm] = h.split(':').map(Number)
  return hh * 60 + mm
}

const estaEnVivo = (inicio, fin, dia) => {
  const ahora  = new Date()
  const diaMap = {
    domingo:0, lunes:1, martes:2, miércoles:3,
    miercoles:3, jueves:4, viernes:5, sábado:6, sabado:6
  }
  if (dia && diaMap[dia.toLowerCase()] !== ahora.getDay()) return false
  const actual = ahora.getHours() * 60 + ahora.getMinutes()
  return actual >= horaAMinutos(inicio) && actual < horaAMinutos(fin)
}

// ── MODAL: Importar Excel ───────────────────────────────────
function ModalImportar({ estaciones, onCerrar, onImportado }) {
  const [archivo, setArchivo]     = useState(null)
  const [estacion, setEstacion]   = useState(estaciones.length > 0 ? estaciones[0].nombre : '')
  const [preview, setPreview]     = useState(null)
  const [loading, setLoading]     = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState('')

  const handlePreview = async () => {
    if (!archivo) return setError('Selecciona un archivo Excel')
    setLoading(true); setError(''); setPreview(null)
    try {
      const form = new FormData()
      form.append('archivo', archivo)
      form.append('estacion', estacion)
      const data = await previewImportar(form)
      setPreview(data)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      const form = new FormData()
      form.append('archivo', archivo)
      form.append('estacion', estacion)
      await guardarImportar(form)
      onImportado()
    } catch(e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#611232]/50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col transform-gpu">
        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-2xl font-black text-[#611232] flex items-center gap-4">
             <FileSpreadsheet className="text-[#A57F2C]" /> Importar Datos
          </h2>
          <button onClick={onCerrar} className="text-gray-300 hover:text-gray-600 transition-colors"><X size={24}/></button>
        </div>
        
        <div className="p-10 space-y-8 overflow-y-auto">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estación Destino</label>
                 <select value={estacion} onChange={e => setEstacion(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest outline-none">
                    {estaciones.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                 </select>
              </div>
              <div className="space-y-1">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Archivo Excel (.xlsx)</label>
                 <input type="file" accept=".xlsx,.xls" onChange={e => setArchivo(e.target.files[0])} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-bold" />
              </div>
           </div>

           {!preview ? (
              <button onClick={handlePreview} disabled={loading || !archivo} className="w-full py-4 bg-[#A57F2C] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#A57F2C]/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                 {loading ? 'Procesando archivo...' : 'Analizar Archivo'}
              </button>
           ) : (
              <div className="space-y-6">
                 <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-widest">
                       Se detectaron <span className="text-lg">{preview.total}</span> programas listos para importar.
                    </p>
                 </div>
                 <div className="rounded-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-[10px] text-left">
                       <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                             <th className="px-4 py-3 font-black uppercase">Horario</th>
                             <th className="px-4 py-3 font-black uppercase">Programa</th>
                             <th className="px-4 py-3 font-black uppercase">Día</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {preview.muestra.slice(0, 5).map((p, i) => (
                             <tr key={i}>
                                <td className="px-4 py-3 font-mono text-gray-400">{p.hora_inicio} - {p.hora_fin}</td>
                                <td className="px-4 py-3 font-bold text-gray-700">{p.nombre}</td>
                                <td className="px-4 py-3 text-gray-400 uppercase">{p.dia}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 <button onClick={handleGuardar} disabled={guardando} className="w-full py-5 bg-[#611232] text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-[#611232]/30 hover:scale-[1.02] transition-all">
                    {guardando ? 'Guardando en base de datos...' : `Confirmar Importación de ${preview.total} registros`}
                 </button>
              </div>
           )}
           {error && <p className="text-center text-xs font-black text-red-500 uppercase tracking-widest">{error}</p>}
        </div>
      </div>
    </div>
  )
}

// ── OTROS MODALES (REDISEÑADOS) ──────────────────────────────

function ModalLimpiar({ estacion, onConfirmar, onCerrar }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#611232]/50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center border border-gray-100 transform-gpu">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8">
           <AlertTriangle size={32} />
        </div>
        <h3 className="text-2xl font-black text-[#611232] mb-4 tracking-tight">¿Limpiar Programación?</h3>
        <p className="text-gray-400 font-medium mb-10 leading-relaxed text-sm">
          Se eliminarán todos los programas de <span className="text-gray-800 font-bold">{estacion || 'todas las estaciones'}</span>. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-4">
          <button onClick={onCerrar} className="flex-1 py-4 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={onConfirmar} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 transition-all">Limpiar Todo</button>
        </div>
      </div>
    </div>
  )
}

function ModalPrograma({ programa, estaciones, onGuardar, onCerrar }) {
  const [form, setForm]       = useState(programa ?? FORM_VACIO)
  const [loading, setLoading] = useState(false)
  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await onGuardar(form); onCerrar() }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#611232]/50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-xl border border-gray-100 overflow-hidden transform-gpu max-h-[90vh] flex flex-col">
        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h2 className="text-2xl font-black text-[#611232] tracking-tight">{programa ? 'Editar Horario' : 'Nuevo Horario'}</h2>
          <button onClick={onCerrar} className="text-gray-300 hover:text-gray-600 transition-colors"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Programa *</label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-[#611232] outline-none" />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hora Inicio</label>
              <input type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} required className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hora Fin</label>
              <input type="time" value={form.hora_fin} onChange={e => set('hora_fin', e.target.value)} required className="w-full px-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Locutor / Conductor</label>
            <input 
              value={form.conductor || ''} 
              onChange={e => setForm(f => ({ ...f, conductor: e.target.value }))} 
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-[#611232] outline-none" 
              placeholder="Nombre del locutor..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estación</label>
              <select 
                value={form.estacion} 
                onChange={e => {
                  const val = e.target.value;
                  const stationObj = estaciones.find(s => s.nombre === val);
                  setForm(f => ({
                    ...f,
                    estacion: val,
                    tipo: stationObj ? stationObj.tipo : (val.toLowerCase().includes('radio') ? 'Radio' : 'TV')
                  }))
                }} 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:bg-white"
              >
                <option value="">— Selecciona —</option>
                {estaciones.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Día de Transmisión</label>
              <select value={form.dia} onChange={e => set('dia', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:bg-white">
                 <option value="">Seleccionar día</option>
                 {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onCerrar} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-[#611232] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#611232]/20 hover:scale-105 transition-all">
              {loading ? 'Sincronizando...' : 'Guardar Horario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────
export default function GrillaProgramacion() {
  const [estaciones, setEstaciones]         = useState([])
  const [filtroTipo]                        = useState('')
  const [filtroEstacion, setFiltroEstacion] = useState('')
  const [filtroDia, setFiltroDia]           = useState('')
  const [modalForm, setModalForm]           = useState(null)
  const [modalEliminar, setModalEliminar]   = useState(null)
  const [modalLimpiar, setModalLimpiar]     = useState(false)
  const [modalImportar, setModalImportar]   = useState(false)

  useEffect(() => {
    fetchEstaciones().then(setEstaciones).catch(console.error)
  }, [])

  const { programas, loading, refetch } =
    useProgramacion({ tipo: filtroTipo, estacion: filtroEstacion, dia: filtroDia })

  const handleGuardar = async (form) => {
    if (form.id) await editarPrograma(form.id, form)
    else         await crearPrograma(form)
    await refetch()
  }

  const handleEliminar = async () => {
    await eliminarPrograma(modalEliminar.id)
    setModalEliminar(null)
    await refetch()
  }

  const handleLimpiarTodo = async () => {
    try {
      await limpiarProgramacion(filtroEstacion)
      setModalLimpiar(false)
      await refetch()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="p-8 md:p-12 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-[#611232] rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#611232]">Control de Tráfico</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-[#611232] tracking-tight">Grilla de Programación</h1>
        </div>
        <div className="flex flex-wrap gap-4">
           <button onClick={() => setModalLimpiar(true)} className="px-6 py-4 border border-gray-100 text-gray-400 hover:text-amber-600 hover:border-amber-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-white shadow-sm">Limpiar</button>
           <button onClick={() => setModalImportar(true)} className="flex items-center gap-3 px-6 py-4 bg-[#A57F2C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#A57F2C]/20 hover:scale-105 transition-all">
              <FileSpreadsheet size={16} /> Importar Excel
           </button>
           <button onClick={() => setModalForm('nuevo')} className="flex items-center gap-3 px-8 py-4 bg-[#611232] text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-[#611232]/20 hover:scale-105 active:scale-95 transition-all">
              <Plus size={20} /> Nuevo Horario
           </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-3">
           <div className="flex-1 relative group">
              <Filter size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
              <select value={filtroEstacion} onChange={e => setFiltroEstacion(e.target.value)} className="w-full pl-12 pr-5 py-3 bg-gray-50/50 border border-gray-50 rounded-[1rem] text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white transition-all">
                <option value="">Todas las estaciones</option>
                {estaciones.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
              </select>
           </div>
           <select value={filtroDia} onChange={e => setFiltroDia(e.target.value)} className="px-6 py-3 bg-gray-50/50 border border-gray-50 rounded-[1rem] text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white transition-all">
              <option value="">Todos los días</option>
              {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
        </div>
        <button onClick={refetch} className="p-3 bg-white border border-gray-100 rounded-[1rem] text-gray-400 hover:text-[#611232] transition-all shadow-sm">
           <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabla Premium Compacta */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#611232] text-white">
              {['Horario','Día','Programa','Locución','Tipo','Estación','Acciones'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({length:6}).map((_,i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({length:7}).map((__,j) => (
                    <td key={j} className="px-6 py-4"><div className="h-3 bg-gray-100 rounded-full w-20"></div></td>
                  ))}
                </tr>
              ))
            ) : programas.map(p => {
              const vivo = estaEnVivo(p.hora_inicio, p.hora_fin, p.dia)
              return (
                <tr key={p.id} className={`group hover:bg-gray-50/50 transition-all ${vivo ? 'bg-red-50/20' : ''}`}>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                        <Clock size={12} className="text-gray-300" />
                        {p.hora_inicio} – {p.hora_fin}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">{p.dia || '—'}</td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{p.nombre}</span>
                        {vivo && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500 text-white text-[7px] font-black rounded-full animate-pulse shadow-lg shadow-red-500/20 uppercase tracking-tighter">
                             EN VIVO
                          </span>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 group-hover:text-[#A57F2C] transition-colors">
                        <Mic size={12} /> {p.conductor}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${p.tipo === 'TV' ? 'bg-[#611232]/5 text-[#611232] border-[#611232]/10' : 'bg-[#A57F2C]/5 text-[#A57F2C] border-[#A57F2C]/10'}`}>
                        {p.tipo === 'TV' ? <Tv size={10}/> : <Radio size={10}/>}
                        {p.tipo}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-tight">{p.estacion}</td>
                  <td className="px-6 py-4">
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModalForm(p)} className="p-2 bg-gray-100 text-gray-400 hover:bg-[#611232] hover:text-white rounded-xl transition-all">
                           <Pencil size={12} />
                        </button>
                        <button onClick={() => setModalEliminar(p)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                           <Trash2 size={12} />
                        </button>
                     </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {modalImportar && (
         <ModalImportar estaciones={estaciones} onCerrar={() => setModalImportar(false)} onImportado={() => { refetch(); setModalImportar(false) }} />
      )}
      {modalLimpiar && (
        <ModalLimpiar estacion={filtroEstacion || null} onConfirmar={handleLimpiarTodo} onCerrar={() => setModalLimpiar(false)} />
      )}
      {modalForm && (
        <ModalPrograma programa={modalForm === 'nuevo' ? null : modalForm} estaciones={estaciones} onGuardar={handleGuardar} onCerrar={() => setModalForm(null)} />
      )}
      {modalEliminar && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#611232]/50 p-4 animate-in zoom-in-95">
           <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center border border-gray-100 transform-gpu">
             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trash2 size={32} />
             </div>
             <h3 className="text-2xl font-black text-[#611232] mb-4 tracking-tight">¿Eliminar horario?</h3>
             <p className="text-gray-400 font-medium mb-10 leading-relaxed text-sm">Esta transmisión será removida de la grilla oficial.</p>
             <div className="flex gap-4">
               <button onClick={() => setModalEliminar(null)} className="flex-1 py-4 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">Cancelar</button>
               <button onClick={handleEliminar} className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">Eliminar</button>
             </div>
           </div>
        </div>
      )}
    </div>
  )
}