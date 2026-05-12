import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Newspaper, X, Check, Eye, EyeOff } from 'lucide-react'
import { getNoticias, crearNoticia, editarNoticia, eliminarNoticia } from '../../services/api'

const CATEGORIAS = ['Tecnología','Televisión','Radio','Cultura','Institucional','Deportes','Otros']

const FORM_VACIO = {
  titulo:'', fecha: new Date().toISOString().split('T')[0],
  categoria:'Institucional', descripcion:'', imagen:'', publicada:false
}

// ── Modal Formulario ──────────────────────────────────────────
function ModalNoticia({ noticia, onGuardar, onCerrar }) {
  const [form, setForm] = useState(noticia ?? FORM_VACIO)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onGuardar(form)
      onCerrar()
    } catch(err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:100, padding:'24px'
    }}>
      <div style={{
        backgroundColor:'white', borderRadius:'16px',
        width:'100%', maxWidth:'560px', maxHeight:'90vh',
        overflow:'auto', border:'1px solid #e5e7eb',
        transform: 'translateZ(0)', willChange: 'transform'
      }}>
        {/* Header modal */}
        <div style={{
          padding:'20px 24px', borderBottom:'1px solid #f0f0f0',
          display:'flex', alignItems:'center', justifyContent:'space-between'
        }}>
          <h3 style={{ margin:0, fontSize:'17px', fontWeight:'700', color:'#611232' }}>
            {noticia ? 'Editar Noticia' : 'Nueva Noticia'}
          </h3>
          <button onClick={onCerrar} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'#9ca3af', padding:'4px'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Título */}
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#374151', marginBottom:'6px' }}>
              Título *
            </label>
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)}
              placeholder="Título de la noticia" required
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px',
                       border:'1.5px solid #e5e7eb', fontSize:'14px',
                       outline:'none', boxSizing:'border-box' }}
              onFocus={e => e.target.style.borderColor='#611232'}
              onBlur={e  => e.target.style.borderColor='#e5e7eb'} />
          </div>

          {/* Categoría + Fecha */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#374151', marginBottom:'6px' }}>
                Categoría *
              </label>
              <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
                style={{ width:'100%', padding:'10px 12px', borderRadius:'8px',
                         border:'1.5px solid #e5e7eb', fontSize:'14px',
                         outline:'none', boxSizing:'border-box' }}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#374151', marginBottom:'6px' }}>
                Fecha
              </label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)}
                style={{ width:'100%', padding:'10px 12px', borderRadius:'8px',
                         border:'1.5px solid #e5e7eb', fontSize:'14px',
                         outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#374151', marginBottom:'6px' }}>
              Descripción
            </label>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              rows={4} placeholder="Descripción de la noticia..."
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px',
                       border:'1.5px solid #e5e7eb', fontSize:'14px', outline:'none',
                       boxSizing:'border-box', resize:'vertical', fontFamily:'inherit' }}
              onFocus={e => e.target.style.borderColor='#611232'}
              onBlur={e  => e.target.style.borderColor='#e5e7eb'} />
          </div>

          {/* URL Imagen */}
          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#374151', marginBottom:'6px' }}>
              URL de imagen
            </label>
            <input value={form.imagen} onChange={e => set('imagen', e.target.value)}
              placeholder="https://..."
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px',
                       border:'1.5px solid #e5e7eb', fontSize:'14px',
                       outline:'none', boxSizing:'border-box' }} />
          </div>

          {/* Publicada toggle */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <button type="button" onClick={() => set('publicada', !form.publicada)} style={{
              width:'44px', height:'24px', borderRadius:'12px', border:'none',
              backgroundColor: form.publicada ? '#611232' : '#d1d5db',
              position:'relative', cursor:'pointer', transition:'background 0.2s'
            }}>
              <div style={{
                width:'18px', height:'18px', borderRadius:'50%', backgroundColor:'white',
                position:'absolute', top:'3px', transition:'left 0.2s',
                left: form.publicada ? '23px' : '3px',
                boxShadow:'0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </button>
            <span style={{ fontSize:'14px', color:'#374151', fontWeight:'500' }}>
              {form.publicada ? 'Publicada' : 'Borrador'}
            </span>
          </div>

          {error && (
            <div style={{ padding:'10px 14px', backgroundColor:'#fef2f2',
                          border:'1px solid #fecaca', borderRadius:'8px',
                          color:'#dc2626', fontSize:'13px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Botones */}
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'4px' }}>
            <button type="button" onClick={onCerrar} style={{
              padding:'10px 20px', borderRadius:'8px',
              border:'1.5px solid #e5e7eb', backgroundColor:'white',
              color:'#6b7280', fontSize:'14px', fontWeight:'600', cursor:'pointer'
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{
              padding:'10px 20px', borderRadius:'8px', border:'none',
              backgroundColor:'#611232', color:'white',
              fontSize:'14px', fontWeight:'700', cursor:'pointer',
              display:'flex', alignItems:'center', gap:'6px',
              opacity: loading ? 0.7 : 1
            }}>
              <Check size={15} /> {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal Confirmación Eliminar ───────────────────────────────
function ModalEliminar({ noticia, onConfirmar, onCerrar }) {
  const [loading, setLoading] = useState(false)
  return (
    <div style={{
      position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:100
    }}>
      <div style={{
        backgroundColor:'white', borderRadius:'16px', padding:'32px',
        width:'100%', maxWidth:'400px', textAlign:'center',
        border:'1px solid #e5e7eb', transform: 'translateZ(0)'
      }}>
        <div style={{ width:'52px', height:'52px', backgroundColor:'#fef2f2',
                      borderRadius:'50%', display:'flex', alignItems:'center',
                      justifyContent:'center', margin:'0 auto 16px' }}>
          <Trash2 size={22} color="#dc2626" />
        </div>
        <h3 style={{ fontSize:'17px', fontWeight:'700', color:'#1f2937', marginBottom:'8px' }}>
          ¿Eliminar noticia?
        </h3>
        <p style={{ fontSize:'14px', color:'#6b7280', marginBottom:'24px' }}>
          "<strong>{noticia.titulo}</strong>" será eliminada permanentemente.
        </p>
        <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
          <button onClick={onCerrar} style={{
            padding:'10px 24px', borderRadius:'8px',
            border:'1.5px solid #e5e7eb', backgroundColor:'white',
            color:'#6b7280', fontSize:'14px', fontWeight:'600', cursor:'pointer'
          }}>Cancelar</button>
          <button disabled={loading} onClick={async () => {
            setLoading(true)
            await onConfirmar()
            setLoading(false)
          }} style={{
            padding:'10px 24px', borderRadius:'8px', border:'none',
            backgroundColor:'#dc2626', color:'white',
            fontSize:'14px', fontWeight:'700', cursor:'pointer'
          }}>
            {loading ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente Principal ──────────────────────────────────────
export default function Noticias() {
  const [noticias, setNoticias]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [modalForm, setModalForm]       = useState(null)  // null | 'nuevo' | noticiaObj
  const [modalEliminar, setModalEliminar] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await getNoticias(filtroCategoria ? { categoria: filtroCategoria } : {})
      setNoticias(data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [filtroCategoria])

  const handleGuardar = async (form) => {
    if (form.id) {
      await editarNoticia(form.id, form)
    } else {
      await crearNoticia(form)
    }
    await cargar()
  }

  const handleEliminar = async () => {
    await eliminarNoticia(modalEliminar.id)
    setModalEliminar(null)
    await cargar()
  }

  return (
    <div style={{ padding:'24px' }}>

      {/* Encabezado */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'24px', fontWeight:'800', color:'#611232',
                       display:'flex', alignItems:'center', gap:'10px', margin:0 }}>
            <Newspaper size={24} /> Noticias
          </h1>
          <p style={{ fontSize:'13px', color:'#9ca3af', margin:'4px 0 0' }}>
            {noticias.length} noticias en total
          </p>
        </div>
        <button onClick={() => setModalForm('nuevo')} style={{
          display:'flex', alignItems:'center', gap:'8px',
          padding:'10px 20px', backgroundColor:'#611232',
          border:'none', borderRadius:'10px', color:'white',
          fontSize:'14px', fontWeight:'700', cursor:'pointer',
          boxShadow:'0 2px 8px rgba(97,18,50,0.3)'
        }}>
          <Plus size={16} /> Nueva Noticia
        </button>
      </div>

      {/* Filtro */}
      <div style={{ marginBottom:'16px' }}>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          style={{ padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #e5e7eb',
                   fontSize:'14px', color:'#374151', outline:'none' }}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor:'white', borderRadius:'12px',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.06)', overflow:'hidden',
                    border:'1px solid #f0f0f0' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ backgroundColor:'#611232', color:'white' }}>
              {['Título','Categoría','Fecha','Estado','Acciones'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left',
                                     fontSize:'12px', fontWeight:'600',
                                     textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({length:4}).map((_,i) => (
                  <tr key={i}>
                    {Array.from({length:5}).map((__,j) => (
                      <td key={j} style={{ padding:'14px 16px' }}>
                        <div style={{ height:'16px', backgroundColor:'#f0f0f0',
                                      borderRadius:'4px', animation:'pulse 1.5s infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              : noticias.map(n => (
                  <tr key={n.id} style={{ borderBottom:'1px solid #f9f9f9' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor='#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor='white'}>
                    <td style={{ padding:'14px 16px' }}>
                      <p style={{ fontWeight:'600', fontSize:'14px', color:'#1f2937', margin:0 }}>
                        {n.titulo}
                      </p>
                      <p style={{ fontSize:'12px', color:'#9ca3af', margin:'2px 0 0',
                                  maxWidth:'300px', overflow:'hidden',
                                  textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {n.descripcion}
                      </p>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ padding:'3px 10px', backgroundColor:'#611232',
                                     color:'white', fontSize:'11px', fontWeight:'600',
                                     borderRadius:'999px' }}>
                        {n.categoria}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px', fontSize:'13px', color:'#6b7280' }}>
                      {n.fecha}
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{
                        padding:'3px 10px', fontSize:'11px', fontWeight:'600', borderRadius:'999px',
                        backgroundColor: n.publicada ? '#dcfce7' : '#f3f4f6',
                        color: n.publicada ? '#16a34a' : '#6b7280'
                      }}>
                        {n.publicada ? '● Publicada' : '○ Borrador'}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button onClick={() => setModalForm(n)} style={{
                          padding:'6px 12px', borderRadius:'6px', border:'none',
                          backgroundColor:'#f3f4f6', color:'#374151',
                          fontSize:'12px', fontWeight:'600', cursor:'pointer',
                          display:'flex', alignItems:'center', gap:'4px'
                        }}>
                          <Pencil size={12} /> Editar
                        </button>
                        <button onClick={() => setModalEliminar(n)} style={{
                          padding:'6px 12px', borderRadius:'6px', border:'none',
                          backgroundColor:'#fef2f2', color:'#dc2626',
                          fontSize:'12px', fontWeight:'600', cursor:'pointer',
                          display:'flex', alignItems:'center', gap:'4px'
                        }}>
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>

        {!loading && noticias.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px', color:'#9ca3af' }}>
            <Newspaper size={40} style={{ margin:'0 auto 12px', opacity:0.3, display:'block' }} />
            <p>No hay noticias. ¡Crea la primera!</p>
          </div>
        )}
      </div>

      {/* Modales */}
      {modalForm && (
        <ModalNoticia
          noticia={modalForm === 'nuevo' ? null : modalForm}
          onGuardar={handleGuardar}
          onCerrar={() => setModalForm(null)}
        />
      )}
      {modalEliminar && (
        <ModalEliminar
          noticia={modalEliminar}
          onConfirmar={handleEliminar}
          onCerrar={() => setModalEliminar(null)}
        />
      )}
    </div>
  )
}