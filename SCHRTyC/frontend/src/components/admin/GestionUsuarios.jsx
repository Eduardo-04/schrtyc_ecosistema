import { useState, useEffect } from 'react'
import { Users, UserPlus, Shield, Pencil, Trash2, Check, X, RefreshCw, Mail, Lock } from 'lucide-react'
import { getUsuarios, crearUsuario, editarUsuario, eliminarUsuario } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const ROLES = [
  { id: 'admin',               label: 'Super Administrador', color: 'bg-red-100 text-red-700' },
  { id: 'editor_prensa',       label: 'Editor de Prensa',    color: 'bg-blue-100 text-blue-700' },
  { id: 'editor_inst',         label: 'Editor Institucional', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'editor_prog',         label: 'Editor Programación',  color: 'bg-purple-100 text-purple-700' },
]

export default function GestionUsuarios() {
  const { usuario: currentAdmin } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', data }
  const [error, setError] = useState(null)

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      const resp = await getUsuarios()
      if (resp.ok) setUsuarios(resp.usuarios)
    } catch (err) {
      setError('Error al cargar la lista de usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarUsuarios() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    try {
      if (modal.mode === 'create') {
        await crearUsuario(data)
      } else {
        await editarUsuario(modal.data.id, { ...data, activo: data.activo === 'on' })
      }
      setModal(null)
      cargarUsuarios()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return
    try {
      await eliminarUsuario(id)
      cargarUsuarios()
    } catch (err) {
      alert(err.message)
    }
  }

  if (currentAdmin?.rol !== 'admin') {
    return <div className="p-10 text-center">Acceso restringido. Solo administradores pueden ver esta sección.</div>
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#611232] flex items-center gap-3">
            <Users size={28} /> Gestión de Accesos
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Controla quién puede editar cada sección del sistema.</p>
        </div>
        <button onClick={() => setModal({ mode: 'create', data: {} })}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#611232] text-white rounded-xl font-bold hover:bg-[#801842] transition-all shadow-lg shadow-[#611232]/20">
          <UserPlus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100" />) : 
         usuarios.map(u => (
          <div key={u.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${ROLES.find(r => r.id === u.rol)?.color.split(' ')[0]}`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#611232]">
                <Shield size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal({ mode: 'edit', data: u })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                <button onClick={() => handleEliminar(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>

            <h3 className="font-extrabold text-gray-900 text-lg mb-1">{u.nombre}</h3>
            <p className="text-sm text-gray-500 font-medium mb-4 flex items-center gap-1.5"><Mail size={14} /> {u.email}</p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${ROLES.find(r => r.id === u.rol)?.color}`}>
                {ROLES.find(r => r.id === u.rol)?.label}
              </span>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${u.activo ? 'text-emerald-500' : 'text-gray-400'}`}>
                {u.activo ? '● Activo' : '○ Inactivo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-[#611232] text-white flex justify-between items-center">
              <h2 className="font-extrabold flex items-center gap-2">
                {modal.mode === 'create' ? <UserPlus size={20} /> : <Pencil size={20} />}
                {modal.mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-white/20 rounded-lg"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Nombre Completo</label>
                <input name="nombre" defaultValue={modal.data.nombre} required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#611232] transition-colors font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Email</label>
                <input name="email" type="email" defaultValue={modal.data.email} required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#611232] transition-colors font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Rol de Acceso</label>
                <select name="rol" defaultValue={modal.data.rol || 'editor_prensa'} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#611232] bg-white font-medium">
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Contraseña {modal.mode === 'edit' && '(dejar vacío para no cambiar)'}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input name="password" type="password" required={modal.mode === 'create'}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#611232] transition-colors font-medium" />
                </div>
              </div>

              {modal.mode === 'edit' && (
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                  <input type="checkbox" name="activo" defaultChecked={modal.data.activo} className="w-5 h-5 accent-[#611232]" />
                  <span className="text-sm font-bold text-gray-700">Usuario Activo</span>
                </label>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                <button className="flex-1 py-3 bg-[#611232] text-white font-bold rounded-xl hover:bg-[#801842] transition-all shadow-lg shadow-[#611232]/20">
                  {modal.mode === 'create' ? 'Crear' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
