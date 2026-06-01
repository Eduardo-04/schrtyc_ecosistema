import {
  LayoutDashboard, Newspaper, Radio, CalendarDays,
  Settings, LogOut, PlaySquare, FileText, Tv, Palette, Users, Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const MENU_MODULES = [
  {
    titulo: "General",
    items: [
      { id: 'dashboard',    label: 'Dashboard',             icono: LayoutDashboard, roles: ['admin', 'editor_prensa', 'editor_inst', 'editor_prog'] },
    ]
  },
  {
    titulo: "Contenido Editorial",
    items: [
      { id: 'noticias',     label: 'Noticias',              icono: Newspaper,  roles: ['admin', 'editor_prensa'] },
      { id: 'galeria',      label: 'Galería de Arte',         icono: Palette,    roles: ['admin', 'editor_prensa'] },
    ]
  },
  {
    titulo: "Radio y Televisión",
    items: [
      { id: 'estaciones',   label: 'Estaciones',            icono: Radio,      roles: ['admin', 'editor_prog'] },
      { id: 'programas',    label: 'Programas',             icono: PlaySquare, roles: ['admin', 'editor_prog'] },
      { id: 'programacion', label: 'Barra de programación',icono: CalendarDays,roles: ['admin', 'editor_prog'] },
    ]
  },
  {
    titulo: "Sitio Web",
    items: [
      { id: 'banners',      label: 'Inicio (Banners y Docs)', icono: ImageIcon, roles: ['admin', 'editor_inst'] },
      { id: 'paginas',      label: 'Páginas Institucionales', icono: FileText, roles: ['admin', 'editor_inst'] },
    ]
  },
  {
    titulo: "Sistema",
    items: [
      { id: 'configuracion',label: 'Configuración',         icono: Settings, roles: ['admin'] },
    ]
  }
]

export default function Sidebar({ seccionActiva, onNavegar, onCerrarSesion, isOpen, onClose }) {
  const { usuario } = useAuth()

  // Filtrar módulos y sus items por rol del usuario
  const modulosFiltrados = MENU_MODULES.map(modulo => ({
    ...modulo,
    items: modulo.items.filter(item => item.roles.includes(usuario?.rol))
  })).filter(modulo => modulo.items.length > 0)

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72
      md:relative md:w-64 md:translate-x-0 md:z-auto
      bg-[#611232] text-white flex flex-col shadow-xl h-screen overflow-hidden
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo + botón cerrar en móvil */}
      <div className="p-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A57F2C] rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
              SC
            </div>
            <div>
              <p className="font-bold text-sm leading-tight tracking-wide">SCHRTyC</p>
              <p className="text-xs text-white/60 leading-tight mt-0.5">Gestor de Contenido</p>
            </div>
          </div>
          {/* Botón X solo visible en móvil */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Cerrar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Menú Scrolleable */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {modulosFiltrados.map((modulo, idx) => (
          <div key={idx}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
              {modulo.titulo}
            </p>
            <div className="space-y-1">
              {modulo.items.map(({ id, label, icono: Icono }) => (
                <button
                  key={id}
                  onClick={() => onNavegar(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    transition-all text-left
                    ${seccionActiva === id
                      ? 'bg-[#A57F2C] text-white font-semibold shadow-md translate-x-1'
                      : 'text-white/75 hover:bg-white/10 hover:text-white hover:translate-x-1'}`}
                >
                  <Icono size={17} className={seccionActiva === id ? "text-white" : "text-white/60"} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Perfil Mini */}
      <div className="p-4 bg-black/10 mx-4 mb-2 rounded-xl flex items-center gap-3 border border-white/5">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400 flex-shrink-0">
          {usuario?.nombre?.charAt(0) || 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold truncate leading-none">{usuario?.nombre}</p>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter mt-1">{usuario?.rol}</p>
        </div>
      </div>

      {/* Salir */}
      <div className="p-4 border-t border-white/10 flex-shrink-0 bg-[#500e29]">
        <button
          onClick={onCerrarSesion}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-red-200 hover:bg-red-500/20 hover:text-white transition-colors"
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}