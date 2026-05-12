import { useState } from 'react'
import { LogIn, Eye, EyeOff, Radio } from 'lucide-react'
import { login } from '../../services/api'

export default function Login({ onLoginExitoso }) {
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
      const data = await login(email, password)
      localStorage.setItem('schrtyc_token',   data.token)
      localStorage.setItem('schrtyc_usuario', JSON.stringify(data.usuario))
      onLoginExitoso(data.usuario)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', backgroundColor:'#611232',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'24px',
      background:'linear-gradient(135deg, #611232 0%, #3d0b1f 100%)'
    }}>
      <div style={{
        backgroundColor:'white', borderRadius:'20px',
        padding:'48px 40px', width:'100%', maxWidth:'420px',
        boxShadow:'0 25px 60px rgba(0,0,0,0.3)'
      }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{
            width:'64px', height:'64px', backgroundColor:'#611232',
            borderRadius:'16px', display:'flex', alignItems:'center',
            justifyContent:'center', margin:'0 auto 16px'
          }}>
            <Radio size={32} color="white" />
          </div>
          <h1 style={{ fontSize:'22px', fontWeight:'800', color:'#611232', margin:'0 0 4px' }}>
            SCHRTyC
          </h1>
          <p style={{ fontSize:'13px', color:'#9ca3af', margin:0 }}>
            Sistema de Administración
          </p>
          <p style={{ fontSize:'11px', color:'#A57F2C', margin:'4px 0 0', fontWeight:'600' }}>
            Gobierno de Chiapas 2024–2030
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', fontSize:'13px', fontWeight:'600',
                            color:'#374151', marginBottom:'6px' }}>
              Correo institucional
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@schrtyc.gob.mx"
              required
              style={{
                width:'100%', padding:'12px 14px', borderRadius:'10px',
                border:'1.5px solid #e5e7eb', fontSize:'14px',
                outline:'none', transition:'border 0.15s', boxSizing:'border-box'
              }}
              onFocus={e => e.target.style.borderColor='#611232'}
              onBlur={e  => e.target.style.borderColor='#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom:'24px' }}>
            <label style={{ display:'block', fontSize:'13px', fontWeight:'600',
                            color:'#374151', marginBottom:'6px' }}>
              Contraseña
            </label>
            <div style={{ position:'relative' }}>
              <input
                type={verPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width:'100%', padding:'12px 42px 12px 14px', borderRadius:'10px',
                  border:'1.5px solid #e5e7eb', fontSize:'14px',
                  outline:'none', transition:'border 0.15s', boxSizing:'border-box'
                }}
                onFocus={e => e.target.style.borderColor='#611232'}
                onBlur={e  => e.target.style.borderColor='#e5e7eb'}
              />
              <button type="button" onClick={() => setVerPass(!verPass)} style={{
                position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:0
              }}>
                {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding:'10px 14px', backgroundColor:'#fef2f2',
              border:'1px solid #fecaca', borderRadius:'8px',
              color:'#dc2626', fontSize:'13px', marginBottom:'16px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width:'100%', padding:'14px', borderRadius:'10px',
            backgroundColor: loading ? '#9ca3af' : '#611232',
            border:'none', color:'white', fontSize:'15px',
            fontWeight:'700', cursor: loading ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
            transition:'background 0.15s'
          }}>
            {loading ? 'Verificando...' : <><LogIn size={17} /> Iniciar Sesión</>}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:'12px', color:'#d1d5db', marginTop:'24px', marginBottom:0 }}>
          Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  )
}