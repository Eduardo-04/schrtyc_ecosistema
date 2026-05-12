import {
  LayoutDashboard, Newspaper, Radio, CalendarDays,
  Settings, LogOut, PlaySquare, FileText, Tv, Palette
} from 'lucide-react'

// Agrupamos el menú por categorías para mayor claridad y semántica editorial
const MENU_MODULES = [
  {
    titulo: "General",
    items: [
      { id: 'dashboard',    label: 'Dashboard',             icono: LayoutDashboard },
    ]
  },
  {
    titulo: "Contenido Editorial",
    items: [
      { id: 'noticias',     label: 'Noticias',              icono: Newspaper },
      { id: 'galeria',      label: 'Galería de Arte',         icono: Palette },
    ]
  },
  {
    titulo: "Radio y Televisión",
    items: [
      { id: 'estaciones',   label: 'Estaciones',            icono: Radio },
      { id: 'programas',    label: 'Programas',             icono: PlaySquare },
      { id: 'programacion', label: 'Grilla de Programación',icono: CalendarDays },
    ]
  },
  {
    titulo: "Sitio Web",
    items: [
      { id: 'paginas',      label: 'Páginas Institucionales', icono: FileText },
    ]
  },
  // {
  //   titulo: "Sistema",
  //   items: [
  //     { id: 'configuracion',label: 'Configuración',         icono: Settings },
  //   ]
  // }
]

export default function Sidebar({ seccionActiva, onNavegar, onCerrarSesion }) {
  return (
    <aside className="w-64 bg-[#611232] text-white flex flex-col shadow-xl h-screen overflow-hidden">
      {/* Logo */}
      <div className="p-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#A57F2C] rounded-lg flex items-center justify-center font-bold text-sm">
            SC
          </div>
          <div>
            <p className="font-bold text-sm leading-tight tracking-wide">SCHRTyC</p>
            <p className="text-xs text-white/60 leading-tight mt-0.5">Gestor de Contenido</p>
          </div>
        </div>
      </div>

      {/* Menú Scrolleable */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {MENU_MODULES.map((modulo, idx) => (
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
                      ? 'bg-[#A57F2C] text-white font-semibold shadow-md'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
                >
                  <Icono size={17} className={seccionActiva === id ? "text-white" : "text-white/60"} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

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