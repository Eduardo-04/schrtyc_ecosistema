import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// Lazy loading de páginas para mejorar performance
const PaginaInicio = lazy(() => import('./pages/PaginaInicio'))
const PaginaRadio = lazy(() => import('./pages/PaginaRadio'))
const PaginaCanal10 = lazy(() => import('./pages/PaginaCanal10'))
const PaginaCine = lazy(() => import('./pages/PaginaCine'))
const PaginaGaleria = lazy(() => import('./pages/PaginaGaleria'))
const PaginaNotas = lazy(() => import('./pages/PaginaNotas'))
const PaginaNotaDetalle = lazy(() => import('./pages/PaginaNotaDetalle'))
const PaginaParticipacion = lazy(() => import('./pages/PaginaParticipacion'))
const PaginaTransparencia = lazy(() => import('./pages/PaginaTransparencia'))
const PaginaPrivacidad = lazy(() => import('./pages/PaginaPrivacidad'))
const PaginaEtica = lazy(() => import('./pages/PaginaEtica'))

// Loader simple con los colores institucionales
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-[#A57F2C] border-t-[#611232] rounded-full animate-spin"></div>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const base = window.location.pathname.startsWith('/nuevo') ? '/nuevo' : '/'
  return (
    <BrowserRouter basename={base}>
      <ScrollToTop />
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<PaginaInicio />} />
              <Route path="/radio" element={<PaginaRadio />} />
              <Route path="/canal10" element={<PaginaCanal10 />} />
              <Route path="/cine" element={<PaginaCine />} />
              <Route path="/galeria" element={<PaginaGaleria />} />
              <Route path="/notas" element={<PaginaNotas />} />
              <Route path="/notas/:id" element={<PaginaNotaDetalle />} />
              <Route path="/participacion" element={<PaginaParticipacion />} />
              <Route path="/transparencia" element={<PaginaTransparencia />} />
              <Route path="/privacidad" element={<PaginaPrivacidad />} />
              <Route path="/etica" element={<PaginaEtica />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}