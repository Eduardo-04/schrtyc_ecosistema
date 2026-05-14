import { useState, useEffect, useRef } from 'react'
import { X, Search, FileImage, RefreshCw, CheckCircle2, Upload, Loader2 } from 'lucide-react'
import { getArchivero, subirArchivo, getUploadUrl } from '../../services/api'

export default function ArchiveroModal({ onSelect, onCerrar }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const cargar = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getArchivero()
      setFiles(data)
    } catch (err) {
      setError('Error al cargar el archivero')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleUpload = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes')
      return
    }

    setUploading(true)
    try {
      const nuevoArchivo = await subirArchivo(file)
      await cargar() // Recargar lista
      // Opcional: seleccionar automáticamente el archivo recién subido
      // onSelect(nuevoArchivo.ruta) 
    } catch (err) {
      alert('Error al subir el archivo: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const onDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const filtrados = files.filter(f => 
    f.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    f.ruta.toLowerCase().includes(busqueda.toLowerCase())
  )

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#611232]/40 backdrop-blur-md p-4 animate-in fade-in duration-300 ${dragActive ? 'scale-105' : ''}`}
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={onDrop}
    >
      <div className={`bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border-4 transition-all duration-300 ${dragActive ? 'border-dashed border-[#A57F2C] bg-amber-50/50' : 'border-white'}`}>
        
        {/* Input oculto */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files[0])}
        />

        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-black text-[#611232] tracking-tight">Galería de Medios</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Explorador SCHRTyC</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-3 px-6 py-3 bg-[#611232] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#4a0d26] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#611232]/20"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Subiendo...' : 'Nueva Foto'}
            </button>

            <button onClick={onCerrar} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="p-8 border-b border-gray-50">
          <div className="relative group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#611232] transition-colors" />
            <input 
              value={busqueda} 
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o carpeta..."
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#611232]/30 outline-none transition-all"
            />
          </div>
        </div>

        {/* Grid de Archivos */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {dragActive && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-amber-50/80 backdrop-blur-sm animate-in zoom-in duration-300">
              <Upload size={64} className="text-[#A57F2C] mb-4 animate-bounce" />
              <p className="text-xl font-black text-[#A57F2C] uppercase tracking-widest">Suelta para subir</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <RefreshCw className="animate-spin text-[#611232]" size={40} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Escaneando servidor...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-500">
              <p className="font-bold">⚠️ {error}</p>
              <button onClick={cargar} className="px-6 py-2 bg-red-50 rounded-xl text-xs font-black uppercase tracking-widest">Reintentar</button>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileImage size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold">No se encontraron archivos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filtrados.map((f, i) => (
                <button 
                  key={i}
                  onClick={() => onSelect(f.ruta)}
                  className="group flex flex-col gap-2 text-left hover:scale-105 transition-all"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-50 relative">
                    <img 
                      src={getUploadUrl(f.ruta)} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={f.nombre} 
                      onError={(e) => { e.target.src = 'https://placehold.co/400x400/f3f4f6/611232?text=Error' }}
                    />
                    <div className="absolute inset-0 bg-[#611232]/0 group-hover:bg-[#611232]/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <CheckCircle2 className="text-white drop-shadow-lg" size={32} />
                    </div>
                  </div>
                  <div className="px-1">
                    <p className="text-[10px] font-black text-gray-900 truncate tracking-tight">{f.nombre}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">{formatSize(f.size)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            {filtrados.length} archivos encontrados
          </p>
          <button 
            onClick={cargar}
            className="flex items-center gap-2 text-[10px] font-black text-[#611232] uppercase tracking-widest hover:underline"
          >
            <RefreshCw size={12} /> Actualizar
          </button>
        </div>
      </div>
    </div>
  )
}
