import { useState, useEffect } from 'react'
import Sidebar            from './components/admin/Sidebar'
import Header             from './components/admin/Header'
import Dashboard          from './components/admin/Dashboard'
import GrillaProgramacion from './components/admin/GrillaProgramacion'
import GestionNoticias    from './components/admin/GestionNoticias'
import GestionEstaciones  from './components/admin/GestionEstaciones'
import GestionProgramas   from './components/admin/GestionProgramas'
import GestionPaginas     from './components/admin/GestionPaginas'
import GestionGaleria     from './components/admin/GestionGaleria'
import GestionUsuarios    from './components/admin/GestionUsuarios'
import Configuracion      from './components/admin/Configuracion'
import Login              from './components/admin/Login'
import { useAuth }        from './context/AuthContext'

export default function App() {
  const { usuario, loading, logout } = useAuth()
  const [seccionActiva, setSeccionActiva] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderSeccion = () => {
    // Protección por rol en el renderizado
    const esAdmin = usuario?.rol === 'admin'
    const esPrensa = esAdmin || usuario?.rol === 'editor_prensa'
    const esInst = esAdmin || usuario?.rol === 'editor_inst'
    const esProg = esAdmin || usuario?.rol === 'editor_prog'

    switch (seccionActiva) {
      case 'dashboard':    return <Dashboard onNavegar={setSeccionActiva} />
      case 'noticias':     return esPrensa ? <GestionNoticias /> : <Dashboard />
      case 'estaciones':   return esProg ? <GestionEstaciones /> : <Dashboard />
      case 'programas':    return esProg ? <GestionProgramas /> : <Dashboard />
      case 'programacion': return esProg ? <GrillaProgramacion /> : <Dashboard />
      case 'paginas':      return esInst ? <GestionPaginas /> : <Dashboard />
      case 'galeria':      return esPrensa ? <GestionGaleria /> : <Dashboard />
      case 'usuarios':     return esAdmin ? <GestionUsuarios /> : <Dashboard />
      case 'configuracion':return esAdmin ? <Configuracion /> : <Dashboard />
      default:             return <Dashboard onNavegar={setSeccionActiva} />
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#611232]">
      <div className="text-white text-lg font-bold animate-pulse">
        Cargando sistema...
      </div>
    </div>
  )

  if (!usuario) return <Login />

  const handleNavegar = (id) => {
    setSeccionActiva(id)
    setSidebarOpen(false) // Cierra sidebar en móvil al navegar
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Overlay oscuro para móvil cuando sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        seccionActiva={seccionActiva}
        onNavegar={handleNavegar}
        onCerrarSesion={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          usuario={usuario}
          onCerrarSesion={logout}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />
        <main className="flex-1 overflow-y-auto">
          {renderSeccion()}
        </main>
      </div>
    </div>
  )
}