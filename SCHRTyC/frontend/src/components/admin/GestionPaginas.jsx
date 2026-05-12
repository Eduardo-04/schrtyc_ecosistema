import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import {
  FileText, Film, Users, Shield, Scale, Pencil, Clock,
  X, Check, RefreshCw, HardDrive, MonitorPlay,
  Image as ImageIcon, ExternalLink, LayoutTemplate,
  Plus, Trash2, ChevronDown, ChevronUp, Settings2, ImagePlus, UserSquare2, Palette
} from 'lucide-react'
import { getPaginas, editarPagina, getUploadUrl } from '../../services/api'
import ArchiveroInput from '../shared/ArchiveroInput'

const PAGINAS_FIJAS = [

  { slug: 'cine',            titulo: 'Cine Chiapas',        icono: Film,     color: 'text-fuchsia-600', bg: 'bg-fuchsia-100' },
  { slug: 'transparencia',   titulo: 'Transparencia',       icono: Shield,   color: 'text-blue-600',    bg: 'bg-blue-100' },
  { slug: 'participacion',   titulo: 'Participación',       icono: Users,    color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { slug: 'aviso-privacidad',titulo: 'Aviso de Privacidad', icono: FileText, color: 'text-slate-600',   bg: 'bg-slate-100' },
  { slug: 'comite-etica',    titulo: 'Comité de Ética',     icono: Scale,    color: 'text-amber-600',   bg: 'bg-amber-100' },
]

const PLANTILLAS = {
  transparencia: `Marco Normativo\nenlace.com/ley.pdf Ley de Transparencia\nenlace.com/reglamento.pdf Reglamento Interno\n\nObligaciones Art. 70\nenlace.com/fraccion1.pdf Fracción I - Marco Normativo`,
  comite: `Integración del Comité\nenlace.com/acta.pdf Acta de Instalación\nenlace.com/directorio.pdf Directorio de Miembros\n\nCódigos y Lineamientos\nenlace.com/codigo-etica.pdf Código de Ética`,
  general: `Documentos Principales\nenlace.com/doc1.pdf Documento 1\nenlace.com/doc2.pdf Documento 2`,
}

const tramiteVacio = () => ({
  id: Date.now() + Math.random(),
  icono: 'documento', accentColor: 'A57F2C', imagenportada: '',
  titulo: '', subtitulo: '', descripcion: '',
  cards: [{ label: '', value: '' }],
  requisitos: [''],
  link: { href: '', label: '' },
  contacto: { email: '', direccion: '' },
  modo: 'cards',
})

const integranteVacio = () => ({
  id: Date.now() + Math.random(),
  nombre: '', cargo: '', foto: '', bio: '',
})

// ── Parsers ──
const parseTramites = (str) => {
  if (!str || !str.trim()) return []
  try {
    return JSON.parse(str).map(t => ({ ...tramiteVacio(), ...t, id: t.id || Date.now() + Math.random(), modo: t.requisitos?.length > 0 ? 'requisitos' : 'cards' }))
  } catch { return [] }
}

const parseIntegrantes = (str) => {
  if (!str || !str.trim()) return []
  try { return JSON.parse(str).map(p => ({ ...integranteVacio(), ...p })) } catch { return [] }
}

const serializeTramites = (arr) => {
  const limpio = arr.map(({ id, modo, ...t }) => ({
    ...t,
    cards: modo === 'cards' ? t.cards.filter(c => c.label || c.value) : [],
    requisitos: modo === 'requisitos' ? t.requisitos.filter(r => r.trim()) : [],
  }))
  return JSON.stringify(limpio, null, 2)
}

const serializeIntegrantes = (arr) => {
  const limpio = arr.map(({ id, ...p }) => p).filter(p => p.nombre.trim())
  return JSON.stringify(limpio, null, 2)
}

// ── parseLineaMedia ──
const parseLineaMedia = (lineaRaw) => {
  const linea = lineaRaw.trim()
  if (!linea) return null
  if (linea.startsWith('▶') || (!linea.startsWith('http') && !linea.includes('.'))) {
    return { tipo: 'header', titulo: linea.replace('▶', '').trim() }
  }
  const partes = linea.split(' ')
  const url = partes[0].trim()
  const tituloAdmin = partes.length > 1 ? partes.slice(1).join(' ').trim() : null
  const u = url.toLowerCase()
  let nombreArchivo = 'Enlace adjunto'
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const lastPart = pathParts[pathParts.length - 1]
    if (lastPart && !lastPart.includes('view') && !lastPart.includes('edit'))
      nombreArchivo = decodeURIComponent(lastPart.replace(/-/g, ' ').replace(/\.pdf$/i, ''))
    else if (u.includes('drive.google')) nombreArchivo = 'Documento en Google Drive'
  } catch {}
  const tituloFinal = tituloAdmin || nombreArchivo
  if (u.includes('drive.google.com')) return { tipo: 'link', titulo: tituloFinal, subtitulo: 'Google Drive',    color: 'text-emerald-600', bg: 'bg-emerald-100', icon: HardDrive }
  if (u.includes('youtube.com') || u.includes('youtu.be')) return { tipo: 'link', titulo: tituloFinal, subtitulo: 'YouTube', color: 'text-red-600', bg: 'bg-red-100', icon: MonitorPlay }
  if (u.includes('.pdf') || u.includes('pdf'))  return { tipo: 'link', titulo: tituloFinal, subtitulo: 'Documento PDF',  color: 'text-orange-600', bg: 'bg-orange-100', icon: FileText }
  if (u.match(/\.(jpeg|jpg|gif|png|webp)/)) return { tipo: 'link', titulo: tituloFinal, subtitulo: 'Imagen', color: 'text-fuchsia-600', bg: 'bg-fuchsia-100', icon: ImageIcon }
  return { tipo: 'link', titulo: tituloFinal, subtitulo: 'Enlace Externo', color: 'text-blue-600', bg: 'bg-blue-100', icon: ExternalLink }
}

// ── ImageUrlInput ──

const ImageUrlInput = memo(({ value, onChange, placeholder = 'https://...', label, hint }) => {
  const esUrl = value && value.startsWith('http')
  return (
    <div>
      {label && <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>}
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      
      <ArchiveroInput 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

      {esUrl && (
        <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 bg-gray-50" style={{ maxHeight: 120 }}>
          <img src={getUploadUrl(value)} alt="preview" className="w-full h-full object-cover" style={{ maxHeight: 120 }}
            onError={e => { e.target.parentElement.innerHTML = '<p class="text-xs text-red-400 text-center py-4 font-medium">No se puede cargar la imagen</p>' }} />
        </div>
      )}
    </div>
  )
})


// ── TramiteEditor ──
const TramiteEditor = memo(({ tramite, index, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(true)
  const upd = (campo, valor) => onChange(index, { ...tramite, [campo]: valor })
  const updCard = (i, campo, valor) => {
    const cards = [...tramite.cards]; cards[i] = { ...cards[i], [campo]: valor }; onChange(index, { ...tramite, cards })
  }
  const addCard = () => onChange(index, { ...tramite, cards: [...tramite.cards, { label: '', value: '' }] })
  const removeCard = (i) => onChange(index, { ...tramite, cards: tramite.cards.filter((_, idx) => idx !== i) })
  const updReq = (i, v) => { const r = [...tramite.requisitos]; r[i] = v; onChange(index, { ...tramite, requisitos: r }) }
  const addReq = () => onChange(index, { ...tramite, requisitos: [...tramite.requisitos, ''] })
  const removeReq = (i) => onChange(index, { ...tramite, requisitos: tramite.requisitos.filter((_, idx) => idx !== i) })


  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        {tramite.imagenportada &&
          <img src={getUploadUrl(tramite.imagenportada)} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-200" />}
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
          style={{ backgroundColor: `#${tramite.accentColor || '611232'}` }}>{index + 1}</div>
        <span className="flex-1 text-sm font-bold text-gray-700 truncate">{tramite.titulo || `Trámite ${index + 1}`}</span>
        <button type="button" onClick={() => setExpanded(e => !e)} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button type="button" onClick={() => onRemove(index)} className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <ImageUrlInput label="Imagen de portada (opcional)" hint="Se mostrará como banner en la parte superior de esta tarjeta."
            value={tramite.imagenportada} onChange={v => upd('imagenportada', v)} placeholder="https://... jpg, png, webp" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Título de la sección</label>
              <input value={tramite.titulo} onChange={e => upd('titulo', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] focus:ring-1 focus:ring-[#611232]/20 outline-none"
                placeholder="Ej. Buzón Ciudadano" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Subtítulo / institución</label>
              <input value={tramite.subtitulo} onChange={e => upd('subtitulo', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] focus:ring-1 focus:ring-[#611232]/20 outline-none"
                placeholder="Ej. SCHRTyC" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Color de acento</label>
              <div className="flex items-center gap-2">
                <input type="color" value={`#${tramite.accentColor}`} onChange={e => upd('accentColor', e.target.value.replace('#', ''))}
                  className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-1" />
                <input value={tramite.accentColor} onChange={e => upd('accentColor', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] outline-none font-mono" placeholder="A57F2C" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de ícono</label>
              <select value={tramite.icono} onChange={e => upd('icono', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] outline-none bg-white">
                <option value="documento">📄 Documento / Archivo</option>
                <option value="escudo">🛡️ Escudo Institucional</option>
                <option value="usuarios">👥 Usuarios / Participación</option>
                <option value="balanza">⚖️ Balanza / Normativa</option>
                <option value="edificio">🏛️ Edificio / Gobierno</option>
                <option value="estrella">⭐ Estrella Destacada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Descripción introductoria</label>
            <textarea value={tramite.descripcion} onChange={e => upd('descripcion', e.target.value)} rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] outline-none resize-none leading-relaxed"
              placeholder="Breve descripción del trámite o sección..." />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Mostrar como</span>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-bold">
              <button type="button" onClick={() => upd('modo', 'cards')}
                className={`px-3 py-1.5 transition-colors ${tramite.modo === 'cards' ? 'bg-[#611232] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                Tarjetas de info
              </button>
              <button type="button" onClick={() => upd('modo', 'requisitos')}
                className={`px-3 py-1.5 transition-colors ${tramite.modo === 'requisitos' ? 'bg-[#611232] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                Lista de requisitos
              </button>
            </div>
          </div>

          {tramite.modo === 'cards' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-600">Tarjetas de información rápida</label>
              {tramite.cards.map((card, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={card.label} onChange={e => updCard(i, 'label', e.target.value)}
                    className="w-36 px-2 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-[#611232] outline-none" placeholder="Etiqueta" />
                  <input value={card.value} onChange={e => updCard(i, 'value', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-[#611232] outline-none" placeholder="Descripción del dato" />
                  <button type="button" onClick={() => removeCard(i)} className="p-1 text-gray-300 hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={addCard} className="flex items-center gap-1 text-xs font-bold text-[#611232] hover:opacity-80 transition-opacity mt-1">
                <Plus size={12} /> Agregar tarjeta
              </button>
            </div>
          )}

          {tramite.modo === 'requisitos' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-600">Requisitos (uno por línea)</label>
              {tramite.requisitos.map((req, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={req} onChange={e => updReq(i, e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-[#611232] outline-none"
                    placeholder="Ej. Acta constitutiva de la empresa" />
                  <button type="button" onClick={() => removeReq(i)} className="p-1 text-gray-300 hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={addReq} className="flex items-center gap-1 text-xs font-bold text-[#611232] hover:opacity-80 transition-opacity">
                <Plus size={12} /> Agregar requisito
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">URL del enlace (opcional)</label>
              <input value={tramite.link?.href} onChange={e => upd('link', { ...tramite.link, href: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] outline-none"
                placeholder="https://www.ejemplo.gob.mx" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Texto del enlace</label>
              <input value={tramite.link?.label} onChange={e => upd('link', { ...tramite.link, label: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] outline-none"
                placeholder="Ir al sitio oficial" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Bloque de contacto (opcional)</label>
            <input value={tramite.contacto?.email} onChange={e => upd('contacto', { ...tramite.contacto, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] outline-none"
              placeholder="correo@ejemplo.gob.mx" />
            <input value={tramite.contacto?.direccion} onChange={e => upd('contacto', { ...tramite.contacto, direccion: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] outline-none"
              placeholder="Calle, Colonia, C.P., Ciudad" />
          </div>
        </div>
      )}
    </div>
  )
})

const IntegranteEditor = memo(({ integrante, index, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(true)
  const upd = (campo, valor) => onChange(index, { ...integrante, [campo]: valor })

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        {integrante.foto
          ? <img src={getUploadUrl(integrante.foto)} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200" />
          : <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-extrabold text-emerald-700 shrink-0">
              {integrante.nombre?.charAt(0)?.toUpperCase() || index + 1}
            </div>
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-700 truncate">{integrante.nombre || `Integrante ${index + 1}`}</p>
          {integrante.cargo && <p className="text-xs text-gray-400 truncate">{integrante.cargo}</p>}
        </div>
        <button type="button" onClick={() => setExpanded(e => !e)} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button type="button" onClick={() => onRemove(index)} className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Nombre completo</label>
              <input value={integrante.nombre} onChange={e => upd('nombre', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] outline-none"
                placeholder="Ej. María López García" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Cargo / Rol</label>
              <input value={integrante.cargo} onChange={e => upd('cargo', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] outline-none"
                placeholder="Ej. Presidenta del Consejo" />
            </div>
          </div>
          <ImageUrlInput label="Foto (opcional)" hint="URL de imagen cuadrada o vertical (3:4 ideal)."
            value={integrante.foto} onChange={v => upd('foto', v)} placeholder="https://... jpg, png, webp" />
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Semblanza / Bio (opcional)</label>
            <textarea value={integrante.bio} onChange={e => upd('bio', e.target.value)} rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#611232] outline-none resize-none leading-relaxed"
              placeholder="Breve descripción del integrante..." />
          </div>
        </div>
      )}
    </div>
  )
})

// ── ModalEditor ──
function ModalEditor({ pagina, schema, onClose, onSave }) {
  const [tab, setTab] = useState('general')
  const [form, setForm] = useState({
    titulo:          pagina?.titulo         || schema.titulo,
    herobadge:       pagina?.herobadge      || '',
    herodescripcion: pagina?.herodescripcion || '',
    seccionlabel:    pagina?.seccionlabel   || '',
    secciontitulo:   pagina?.secciontitulo  || '',
    contenido:       pagina?.contenido      || '',
    imagenportada:   pagina?.imagenportada  || '',
    multimedia:      pagina?.multimedia     || '',
  })
  const [tramites,    setTramites]    = useState(() => parseTramites(pagina?.tramites))
  const [integrantes, setIntegrantes] = useState(() => parseIntegrantes(pagina?.integrantes))
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  const elementosPreview = useMemo(() => 
    (form.multimedia || '').split('\n').map(parseLineaMedia).filter(Boolean),
    [form.multimedia]
  )

  const aplicarPlantilla = useCallback((tipo) => {
    const nueva = PLANTILLAS[tipo] || ''
    setForm(f => ({ ...f, multimedia: f.multimedia.trim() ? f.multimedia + '\n\n' + nueva : nueva }))
  }, [])

  const handleTramiteChange = useCallback((i, updated) => {
    setTramites(t => t.map((x, idx) => idx === i ? updated : x))
  }, [])

  const handleTramiteRemove = useCallback((i) => {
    setTramites(t => t.filter((_, idx) => idx !== i))
  }, [])

  const handleIntegranteChange = useCallback((i, updated) => {
    setIntegrantes(arr => arr.map((x, idx) => idx === i ? updated : x))
  }, [])

  const handleIntegranteRemove = useCallback((i) => {
    setIntegrantes(arr => arr.filter((_, idx) => idx !== i))
  }, [])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setSaving(true); setError(null)
    try {
      await onSave(schema.slug, {
        ...form,
        tramites:    serializeTramites(tramites),
        integrantes: serializeIntegrantes(integrantes),
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const esParticipacion = schema.slug === 'participacion'

  const tabs = [
    { id: 'general',     label: 'General',     icon: Settings2 },
    { id: 'tramites',    label: 'Trámites',     icon: FileText },
    ...(esParticipacion ? [{ id: 'integrantes', label: 'Integrantes', icon: UserSquare2 }] : []),
    { id: 'multimedia',  label: 'Documentos',   icon: HardDrive },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden transform-gpu">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${schema.bg} ${schema.color}`}>
              <schema.icono size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 leading-tight">Editor de Módulo</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{schema.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 pb-0 border-b border-gray-100 shrink-0">
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors border-b-2 ${tab === t.id ? 'border-[#611232] text-[#611232] bg-[#611232]/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <t.icon size={14} />
              {t.label}
              {t.id === 'tramites' && tramites.length > 0 &&
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#611232] text-white">{tramites.length}</span>}
              {t.id === 'integrantes' && integrantes.length > 0 &&
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">{integrantes.length}</span>}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gray-50/40">
          <div className="p-6">
            {error && (
              <div className="mb-5 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
                <X size={16} /> {error}
              </div>
            )}

            {/* TAB GENERAL */}
            {tab === 'general' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <label className="block text-sm font-extrabold text-gray-800 mb-1">Título de la Página</label>
                    <p className="text-xs text-gray-400 mb-3">Aparece como H1 en el encabezado y en la tarjeta del gestor.</p>
                    <input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#611232] focus:ring-2 focus:ring-[#611232]/10 outline-none font-bold text-gray-900"
                      placeholder="Ej. Participación Ciudadana" />
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div>
                      <label className="block text-sm font-extrabold text-gray-800 mb-1">Categoría del encabezado</label>
                      <p className="text-xs text-gray-400 mb-2">Etiqueta pequeña que aparece encima del título (ej. "Ciudadanía").</p>
                      <input type="text" value={form.herobadge} onChange={e => setForm({ ...form, herobadge: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#611232] focus:ring-2 focus:ring-[#611232]/10 outline-none text-sm"
                        placeholder="Ej. Ciudadanía" />
                    </div>
                    <div>
                      <label className="block text-sm font-extrabold text-gray-800 mb-1">Subtítulo del encabezado</label>
                      <p className="text-xs text-gray-400 mb-2">Descripción corta debajo del título principal.</p>
                      <input type="text" value={form.herodescripcion} onChange={e => setForm({ ...form, herodescripcion: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#611232] focus:ring-2 focus:ring-[#611232]/10 outline-none text-sm"
                        placeholder="Ej. Mecanismos de participación ciudadana..." />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <label className="block text-sm font-extrabold text-gray-800 mb-1">Imagen de portada</label>
                    <p className="text-xs text-gray-400 mb-3">Banner grande que aparece debajo del encabezado.</p>
                    <ImageUrlInput value={form.imagenportada} onChange={v => setForm({ ...form, imagenportada: v })}
                      placeholder="https://... jpg, png, webp" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div>
                      <label className="block text-sm font-extrabold text-gray-800 mb-1">Etiqueta de sección</label>
                      <p className="text-xs text-gray-400 mb-2">Texto pequeño dorado sobre el título de sección.</p>
                      <input type="text" value={form.seccionlabel} onChange={e => setForm({ ...form, seccionlabel: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#611232] focus:ring-2 focus:ring-[#611232]/10 outline-none text-sm"
                        placeholder="Ej. Nuestra misión" />
                    </div>
                    <div>
                      <label className="block text-sm font-extrabold text-gray-800 mb-1">Título de sección</label>
                      <p className="text-xs text-gray-400 mb-2">H2 dentro del bloque introductorio.</p>
                      <input type="text" value={form.secciontitulo} onChange={e => setForm({ ...form, secciontitulo: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#611232] focus:ring-2 focus:ring-[#611232]/10 outline-none text-sm"
                        placeholder="Ej. Participa con el SCHRTyC" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <label className="block text-sm font-extrabold text-gray-800 mb-1">Texto Introductorio</label>
                    <p className="text-xs text-gray-400 mb-3">Párrafos separados por línea en blanco.</p>
                    <textarea value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })} rows={8}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#611232] focus:ring-2 focus:ring-[#611232]/10 outline-none text-sm leading-relaxed resize-none"
                      placeholder="El Sistema Chiapaneco pone a disposición de la ciudadanía..." />
                  </div>
                </div>
              </div>
            )}

            {/* TAB TRÁMITES */}
            {tab === 'tramites' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-800">Tarjetas de Trámites / Secciones</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Cada tarjeta aparece como acordeón en la página.</p>
                  </div>
                  <button type="button" onClick={() => setTramites(t => [...t, tramiteVacio()])}
                    className="flex items-center gap-2 px-4 py-2 bg-[#611232] text-white text-sm font-bold rounded-xl hover:bg-[#801842] transition-colors shadow-sm">
                    <Plus size={16} /> Agregar trámite
                  </button>
                </div>
                {tramites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <FileText className="text-gray-300 mb-3" size={36} />
                    <p className="font-bold text-sm text-gray-500">No hay trámites configurados</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">Agrega tarjetas para mostrar requisitos, instituciones o convocatorias.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tramites.map((tramite, i) => (
                      <TramiteEditor key={tramite.id} tramite={tramite} index={i}
                        onChange={handleTramiteChange}
                        onRemove={handleTramiteRemove} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB INTEGRANTES — solo para participación */}
            {tab === 'integrantes' && esParticipacion && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-800">Integrantes del Consejo Ciudadano</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Aparecen como tarjetas con foto, cargo y semblanza.</p>
                  </div>
                  <button type="button" onClick={() => setIntegrantes(p => [...p, integranteVacio()])}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white text-sm font-bold rounded-xl hover:bg-emerald-800 transition-colors shadow-sm">
                    <Plus size={16} /> Agregar integrante
                  </button>
                </div>
                {integrantes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <UserSquare2 className="text-gray-300 mb-3" size={36} />
                    <p className="font-bold text-sm text-gray-500">No hay integrantes configurados</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">Agrega los miembros del Consejo Ciudadano de Radio y Televisión.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {integrantes.map((p, i) => (
                      <IntegranteEditor key={p.id} integrante={p} index={i}
                        onChange={handleIntegranteChange}
                        onRemove={handleIntegranteRemove} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB DOCUMENTOS */}
            {tab === 'multimedia' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <label className="block text-sm font-extrabold text-gray-800">Repositorio de Documentos</label>
                      <p className="text-xs text-gray-400 mt-0.5">PDFs, actas, leyes, videos, imágenes.</p>
                    </div>
                    <div className="flex gap-2">
                      {['transparencia', 'comite', 'general'].map(tipo => (
                        <button key={tipo} type="button" onClick={() => aplicarPlantilla(tipo)} title={`Plantilla ${tipo}`}
                          className="p-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-500 rounded-lg transition-colors">
                          <LayoutTemplate size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-gray-200 rounded-xl p-3 font-mono text-xs text-gray-600 leading-relaxed">
                    <span className="font-bold text-[#611232]">▶ Nombre de Categoría</span><br />
                    https://url.com/archivo.pdf <span className="font-bold text-[#A57F2C]">Título del archivo</span>
                  </div>
                  <textarea value={form.multimedia} onChange={e => setForm({ ...form, multimedia: e.target.value })} rows={14}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#611232] focus:ring-2 focus:ring-[#611232]/10 outline-none text-sm font-mono text-gray-700 resize-none whitespace-pre"
                    placeholder="▶ Marco Normativo&#10;https://drive... Ley Orgánica" />
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
                  <label className="block text-sm font-extrabold text-gray-800 pb-2 border-b border-gray-100">Vista Previa en el Portal</label>
                  {elementosPreview.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ExternalLink className="text-gray-300 mb-2" size={28} />
                      <p className="text-sm text-gray-400 font-medium">Sin documentos todavía</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 400 }}>
                      {elementosPreview.map((elem, i) => {
                        if (elem.tipo === 'header') return (
                          <div key={i} className="mt-3 first:mt-0">
                            <h4 className="text-[10px] font-extrabold text-[#611232] uppercase tracking-widest border-b border-gray-100 pb-1">{elem.titulo}</h4>
                          </div>
                        )
                        return (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${elem.bg} ${elem.color}`}>
                              <elem.icon size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold text-gray-900 truncate capitalize">{elem.titulo}</p>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{elem.subtitulo}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm">
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="px-8 py-2.5 rounded-xl font-bold text-white bg-[#611232] hover:bg-[#801842] shadow-lg shadow-[#611232]/20 transition-all flex items-center gap-2 text-sm disabled:opacity-70">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'Guardando...' : 'Publicar Módulo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente Principal ──
export default function GestionPaginas({ slugEspecifico = null }) {
  const [paginasData,  setPaginasData]  = useState({})
  const [loading,      setLoading]      = useState(true)
  const [errorGlobal,  setErrorGlobal]  = useState(null)
  const [modalActivo,  setModalActivo]  = useState(null)

  const cargarDatos = async () => {
    setLoading(true); setErrorGlobal(null)
    try {
      const data = await getPaginas()
      setPaginasData(data)
      
      // Si venimos con un slug específico, abrimos el modal automáticamente
      if (slugEspecifico) {
        const schema = PAGINAS_FIJAS.find(p => p.slug === slugEspecifico)
        if (schema) setModalActivo(schema)
      }
    } catch {
      setErrorGlobal('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarDatos() }, [slugEspecifico])

  const handleSave = async (slug, nuevosDatos) => {
    const dataActualizada = await editarPagina(slug, nuevosDatos)
    setPaginasData(prev => ({ ...prev, [slug]: dataActualizada }))
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#611232] flex items-center gap-3 m-0">
            <div className="p-2.5 bg-[#611232]/10 rounded-xl"><FileText size={22} className="text-[#611232]" /></div>
            Contenidos Estáticos y Transparencia
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Gestiona títulos, encabezado, imagen de portada, trámites e integrantes de cada página institucional.
          </p>
        </div>
        <button onClick={cargarDatos}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {errorGlobal && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
          <X size={16} /> {errorGlobal}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-[220px] animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-gray-100 mb-4" />
              <div className="h-5 w-3/4 bg-gray-100 rounded mb-3" />
              <div className="h-4 w-1/2 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PAGINAS_FIJAS.map(schema => {
            const data = paginasData[schema.slug]
            const camposLlenos = ['titulo','herobadge','contenido','multimedia','tramites'].filter(c => data?.[c]?.trim?.()?.length)
            const estado = camposLlenos === 0 ? 'vacio' : camposLlenos >= 3 ? 'completo' : 'parcial'
            const estadoConfig = {
              vacio:    { label: 'Sin contenido', dot: 'bg-gray-300',    text: 'text-gray-400' },
              parcial:  { label: 'En progreso',   dot: 'bg-amber-400',   text: 'text-amber-600' },
              completo: { label: 'Publicado',      dot: 'bg-emerald-400', text: 'text-emerald-600' },
            }[estado]
            const numTramites = (() => { try { return JSON.parse(data?.tramites).length } catch { return 0 } })()
            const numIntegrantes = (() => { try { return JSON.parse(data?.integrantes).length } catch { return 0 } })()
            const tienePortada = !!data?.imagenportada?.trim()

            return (
              <div key={schema.slug} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col group">
                {tienePortada && (
                  <div className="h-24 overflow-hidden bg-gray-100 relative">
                    <img src={getUploadUrl(data.imagenportada)} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}
                <div className="h-1.5 w-full bg-gray-100 group-hover:bg-[#A57F2C] transition-colors" />
                <div className="p-6 flex-1 flex flex-col">
                  <div className={`w-14 h-14 ${schema.bg} ${schema.color} rounded-2xl flex items-center justify-center mb-4 ${tienePortada ? '-mt-10 shadow-lg border-4 border-white group-hover:scale-110 transition-transform' : ''}`}>
                    <schema.icono size={26} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-0.5">{data?.titulo || schema.titulo}</h3>
                  <p className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-4">{schema.slug}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full bg-gray-50 border border-gray-100 ${estadoConfig.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${estadoConfig.dot}`} />
                      {estadoConfig.label}
                    </span>
                    {numTramites > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {numTramites} trámites
                      </span>
                    )}
                    {schema.slug === 'participacion' && numIntegrantes > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {numIntegrantes} integrantes
                      </span>
                    )}
                    {tienePortada && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100">
                        Portada
                      </span>
                    )}
                  </div>
                  <div className="mt-auto inline-flex items-center gap-2 text-[12px] text-gray-500 bg-gray-50 py-2 px-3 rounded-lg border border-gray-100">
                    <Clock size={13} className={data?.ultimaactualizacion ? 'text-emerald-500' : 'text-amber-500'} />
                    <span className="font-medium">{data?.ultimaactualizacion ? `Editado ${data.ultimaactualizacion}` : 'Nunca editado'}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                  <button onClick={() => setModalActivo(schema)}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold text-sm py-3 rounded-xl hover:bg-[#611232] hover:text-white hover:border-[#611232] transition-all shadow-sm">
                    <Pencil size={15} /> Gestionar Módulo
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalActivo && (
        <ModalEditor
          schema={modalActivo}
          pagina={paginasData[modalActivo.slug]}
          onClose={() => setModalActivo(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}