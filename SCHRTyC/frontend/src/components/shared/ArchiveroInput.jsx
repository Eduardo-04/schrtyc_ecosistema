import { useState, memo, useRef } from 'react'
import { Image as ImageIcon, Upload, Loader2, Trash2 } from 'lucide-react'
import ArchiveroModal from './ArchiveroModal'
import { subirArchivo } from '../../services/api'

const ArchiveroInput = memo(({ value, onChange, label, placeholder, name, accept = "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv", buttonLabel = "Galería" }) => {
  const [showArchivero, setShowArchivero] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      // Pasamos el valor actual (URL vieja) para que el servidor la borre
      const nuevo = await subirArchivo(file, value)
      onChange(nuevo.ruta)
    } catch (err) {
      alert('Error al subir: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const onDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0])
  }

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
          {value && (
            <button 
              type="button" 
              onClick={() => onChange('')}
              className="text-[9px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <Trash2 size={10} /> Quitar
            </button>
          )}
        </div>
      )}
      
      <div 
        className={`relative group flex gap-3 p-1 rounded-2xl transition-all ${dragActive ? 'bg-[#611232]/5 ring-2 ring-dashed ring-[#611232]/20' : ''}`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={accept}
          onChange={(e) => handleUpload(e.target.files[0])}
        />

        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#611232] transition-colors">
            {uploading ? <Loader2 size={16} className="animate-spin text-[#611232]" /> : <ImageIcon size={16} />}
          </div>
          <input 
            name={name}
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#611232] outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#611232] transition-colors"
            title="Subir Foto"
          >
            <Upload size={16} />
          </button>
        </div>

        <button 
          type="button"
          onClick={() => setShowArchivero(true)}
          className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black text-[#611232] uppercase tracking-widest hover:bg-white hover:border-[#611232] transition-all whitespace-nowrap shadow-sm"
        >
          {buttonLabel}
        </button>
      </div>

      {showArchivero && (
        <ArchiveroModal 
          onSelect={(ruta) => {
            onChange(ruta)
            setShowArchivero(false)
          }} 
          onCerrar={() => setShowArchivero(false)} 
        />
      )}
    </div>
  )
})

export default ArchiveroInput
