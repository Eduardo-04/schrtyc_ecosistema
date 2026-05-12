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
import Configuracion      from './components/admin/Configuracion'
import Login              from './components/admin/Login'
import { verificarToken } from './services/api'

export default function App() {
  const [usuario, setUsuario]             = useState(null)
  const [verificando, setVerificando]     = useState(true)
  const [seccionActiva, setSeccionActiva] = useState('dashboard')

  useEffect(() => {
    verificarToken()
      .then(data => setUsuario(data.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setVerificando(false))
  }, [])

  const cerrarSesion = () => {
    localStorage.removeItem('schrtyc_token')
    localStorage.removeItem('schrtyc_usuario')
    setUsuario(null)
  }

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'dashboard':    return <Dashboard onNavegar={setSeccionActiva} />
      case 'noticias':     return <GestionNoticias />
      case 'estaciones':   return <GestionEstaciones />
      case 'programas':    return <GestionProgramas />
      case 'programacion': return <GrillaProgramacion />
      case 'paginas':      return <GestionPaginas />
      case 'galeria':      return <GestionGaleria />
      case 'configuracion':return <Configuracion />
      default:             return <Dashboard onNavegar={setSeccionActiva} />
    }
  }

  if (verificando) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center',
                  justifyContent:'center', backgroundColor:'#611232' }}>
      <div style={{ color:'white', fontSize:'16px', fontWeight:'600' }}>
        Verificando sesión...
      </div>
    </div>
  )

  if (!usuario) return <Login onLoginExitoso={setUsuario} />

  return (
    <div style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden' }}>
      <Sidebar
        seccionActiva={seccionActiva}
        onNavegar={setSeccionActiva}
        onCerrarSesion={cerrarSesion}
      />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <Header usuario={usuario} onCerrarSesion={cerrarSesion} />
        <main style={{ flex:1, overflowY:'auto', backgroundColor:'#f8f9fa' }}>
          {renderSeccion()}
        </main>
      </div>
    </div>
  )
}