import { useState } from 'react'
import { LogIn, Eye, EyeOff, Radio } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [verPass, setVerPass]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const resp = await login(email, password)
      if (!resp.ok) setError(resp.message)
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#611232]" 
         style={{ background: 'linear-gradient(135deg, #611232 0%, #3d0b1f 100%)' }}>
      
      <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#611232] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Radio size={32} color="white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#611232]">SCHRTyC CMS</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Sistema de Administración v2.1
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
              Correo Institucional
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@schrtyc.gob.mx"
              required
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 outline-none focus:border-[#611232] transition-all font-medium text-gray-700 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={verPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 outline-none focus:border-[#611232] transition-all font-medium text-gray-700 bg-gray-50/50"
              />
              <button type="button" onClick={() => setVerPass(!verPass)} 
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#611232] transition-colors">
                {verPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold flex items-center gap-3 rounded-r-xl">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} 
            className="w-full py-4 bg-[#611232] text-white rounded-2xl font-extrabold shadow-xl shadow-[#611232]/30 hover:bg-[#801842] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3">
            {loading ? 'Verificando...' : <><LogIn size={20} /> Iniciar Sesión</>}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] mt-10">
          Gobierno de Chiapas 2024–2030
        </p>
      </div>
    </div>
  )
}