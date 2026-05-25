import { useState, useEffect } from 'react'
import { Newspaper, Tv, Radio, CalendarDays, TrendingUp, Users, Clock, ArrowRight, Activity } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3005/api'

const getUploadUrl = (ruta) => {
  if (!ruta) return ''
  if (ruta.startsWith('http')) return ruta
  const apiBase = BASE_URL.replace('/api', '')
  return `${apiBase}${ruta.startsWith('/') ? '' : '/'}${ruta}`
}

const DIAS = {
  domingo: 0, lunes: 1, martes: 2, miércoles: 3,
  miercoles: 3, jueves: 4, viernes: 5, sábado: 6, sabado: 6
}

const horaAMinutos = (h) => {
  const [hh, mm] = h.split(':').map(Number)
  return hh * 60 + mm
}

const estaEnVivo = (inicio, fin, dia) => {
  const ahora = new Date()
  if (dia && DIAS[dia.toLowerCase()] !== ahora.getDay()) return false
  const minHoy = ahora.getHours() * 60 + ahora.getMinutes()
  return minHoy >= horaAMinutos(inicio) && minHoy < horaAMinutos(fin)
}

const formatDate = (date) => {
  if (!date) return ''
  if (typeof date === 'string') return date.split(' ')[0].split('T')[0]
  if (date instanceof Date) return date.toISOString().split('T')[0]
  return date
}

export default function Dashboard({ onNavegar }) {
  const [stats, setStats]           = useState(null)
  const [programasVivo, setPV]      = useState([])
  const [estaciones, setEstaciones] = useState([])
  const [noticiasRec, setNotRec]    = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
        
        const [resProg, resNot, resEst] = await Promise.all([
          fetch(`${BASE_URL}/programacion`),
          fetch(`${BASE_URL}/noticias`),
          fetch(`${BASE_URL}/estaciones/todas`, { headers }),
        ])
        const [prog, not, est] = await Promise.all([
          resProg.json(), resNot.json(), resEst.json()
        ])

        const programas   = prog.data ?? []
        const noticias    = not.data  ?? []
        const estacionesd = est.data  ?? []

        setStats({
          noticias:    noticias.length,
          publicadas:  noticias.filter(n => n.publicada).length,
          borradores:  noticias.filter(n => !n.publicada).length,
          programasTV: programas.filter(p => p.tipo === 'TV').length,
          programasRa: programas.filter(p => p.tipo === 'Radio').length,
          totalProg:   programas.length,
          estActivas:  estacionesd.filter(e => e.activo === 1).length,
          estTotal:    estacionesd.length,
        })

        setPV(programas.filter(p => estaEnVivo(p.hora_inicio, p.hora_fin, p.dia)).slice(0, 4))
        setEstaciones(estacionesd.filter(e => e.activo === 1))
        setNotRec([...noticias].sort((a, b) => b.fecha?.localeCompare(a.fecha)).slice(0, 4))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const TARJETAS = [
    { label:'Noticias Digitales', valor: stats?.noticias ?? '—', sub: `${stats?.publicadas ?? 0} publicadas`, icono: Newspaper, color:'bg-[#611232]', id:'noticias' },
    { label:'Programas TV',       valor: stats?.programasTV ?? '—', sub: 'Producciones Canal 10', icono: Tv, color:'bg-[#A57F2C]', id:'programas' },
    { label:'Programas Radio',    valor: stats?.programasRa ?? '—', sub: 'Emisiones radiales', icono: Radio, color:'bg-[#611232]', id:'programas' },
    { label:'Total Programas',    valor: stats?.totalProg ?? '—', sub: 'Grilla de contenidos', icono: CalendarDays, color:'bg-[#A57F2C]', id:'programacion' },
  ]

  return (
    <div className="p-8 md:p-12 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">

      {/* Header Editorial Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-1 bg-[#A57F2C] rounded-full"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A57F2C]">Estado del Sistema</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#611232] tracking-tight">Centro de Control</h1>
          <p className="text-gray-400 font-medium mt-2">Monitoreo y gestión de contenidos SCHRTyC</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-xs font-black uppercase tracking-widest text-gray-400">Sistema Operativo</span>
        </div>
      </div>

      {/* Tarjetas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {TARJETAS.map(({ label, valor, sub, icono: Icono, color, id }) => (
          <button key={id} onClick={() => onNavegar(id)}
            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 text-left group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-bl-[100%] transition-all duration-500 group-hover:scale-150`}></div>
            
            <div className="flex items-center justify-between mb-8">
              <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                <Icono size={24} className="text-white" />
              </div>
              <ArrowRight size={20} className="text-gray-200 group-hover:text-[#A57F2C] group-hover:translate-x-2 transition-all" />
            </div>
            
            <div className="relative z-10">
              <p className="text-4xl font-black text-gray-900 mb-1">{loading ? '...' : valor}</p>
              <p className="text-sm font-black text-[#611232] uppercase tracking-wider">{label}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Secciones de Monitoreo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Transmisión en Vivo */}
        <div className="lg:col-span-1 bg-[#611232] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
             <Activity size={120} strokeWidth={1} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em]">En Vivo Ahora</h3>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1,2].map(i => <div key={i} className="h-12 bg-white/10 rounded-2xl animate-pulse"></div>)}
                </div>
              ) : programasVivo.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
                   <p className="text-white/40 text-sm font-bold italic">Sin transmisiones activas</p>
                </div>
              ) : (
                programasVivo.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-5 rounded-[2rem] transition-all cursor-pointer border border-white/5 group/item">
                    <div className="w-10 h-10 rounded-xl bg-[#A57F2C] flex items-center justify-center font-black text-xs shrink-0">
                      {p.tipo === 'TV' ? <Tv size={16} /> : <Radio size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{p.nombre}</p>
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">{p.hora_inicio} — {p.hora_fin}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => onNavegar('programacion')} className="w-full mt-10 py-4 bg-white text-[#611232] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#A57F2C] hover:text-white transition-all">
               Ver Grilla Completa
            </button>
          </div>
        </div>

        {/* Noticias Recientes */}
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <TrendingUp size={18} className="text-[#A57F2C]" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Prensa Digital</h3>
             </div>
             <button onClick={() => onNavegar('noticias')} className="text-[10px] font-black text-[#611232] uppercase hover:underline">Ver Todo</button>
          </div>

          <div className="space-y-4">
            {loading ? (
               [1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse"></div>)
            ) : noticiasRec.map((n, i) => (
              <div key={i} className="group/news flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer">
                 <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img src={getUploadUrl(n.imagen)} className="w-full h-full object-cover group-hover/news:scale-110 transition-transform duration-500" alt="" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{n.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${n.publicada ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {n.publicada ? 'Publicada' : 'Borrador'}
                       </span>
                       <span className="text-[9px] font-bold text-gray-300 uppercase">{formatDate(n.fecha)}</span>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estaciones y Señales */}
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <Activity size={18} className="text-[#611232]" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Señales Activas</h3>
             </div>
             <span className="text-[10px] font-black text-green-500">{stats?.estActivas}/{stats?.estTotal} ON</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
             {estaciones.map((e, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-[1.5rem] border border-gray-50 hover:border-[#A57F2C]/30 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${e.activa ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`}></div>
                     <span className="text-xs font-bold text-gray-700">{e.nombre}</span>
                  </div>
                  <span className="text-[9px] font-black text-gray-300 uppercase">{e.frecuencia || 'Señal Digital'}</span>
               </div>
             ))}
          </div>
          
          <button onClick={() => onNavegar('estaciones')} className="w-full mt-8 py-4 border border-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#611232] hover:text-[#611232] transition-all">
             Gestionar Estaciones
          </button>
        </div>

      </div>
    </div>
  )
}