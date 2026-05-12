import { Bell, ExternalLink, LogOut, Search, User } from 'lucide-react'

export default function Header({ usuario, onCerrarSesion }) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-50 px-10 py-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <div>
          <h2 className="text-xl font-black text-[#611232] tracking-tight">
            ¡Hola, {usuario?.nombre ?? 'Administrador'}!
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
               Sistema de Gestión SCHRTyC Activo
             </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Enlace al sitio público */}
        <a 
          href="http://radiotvycine.chiapas.gob.mx/" 
          target="_blank"
          rel="noopener noreferrer" 
          className="group flex items-center gap-3 px-6 py-2.5 rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-[#611232] hover:border-[#611232]/30 transition-all shadow-sm"
        >
          <ExternalLink size={14} className="group-hover:rotate-12 transition-transform" /> 
          <span className="text-[10px] font-black uppercase tracking-widest">Ver Sitio Público</span>
        </a>

        <div className="h-8 w-px bg-gray-100 hidden md:block"></div>

        {/* Perfil y Acciones */}
        <div className="flex items-center gap-4">
           <button className="p-3 text-gray-300 hover:text-[#611232] transition-colors relative group">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#A57F2C] rounded-full border-2 border-white group-hover:scale-125 transition-transform"></span>
           </button>

           <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-black text-[#611232] uppercase tracking-tighter">{usuario?.nombre || 'Admin'}</p>
                 <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Super Usuario</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#611232] text-white flex items-center justify-center font-black text-sm shadow-lg shadow-[#611232]/20">
                 {usuario?.nombre?.[0]?.toUpperCase() || 'A'}
              </div>
           </div>

           <button 
             onClick={onCerrarSesion} 
             className="ml-2 p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all group"
             title="Cerrar Sesión"
           >
              <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
           </button>
        </div>
      </div>
    </header>
  )
}