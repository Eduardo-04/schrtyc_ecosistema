import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authLogin, authRefresh, authLogout, authVerificar, setAccessToken } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [token, _setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const setToken = useCallback((t) => {
    _setToken(t)
    setAccessToken(t)
  }, [])

  // Función para inicializar la sesión (Silent Refresh)
  const inicializarSession = useCallback(async () => {
    try {
      const resp = await authRefresh()
      if (resp.ok) {
        setUsuario(resp.usuario)
        setToken(resp.token)
      }
    } catch (err) {
      console.log('No hay sesión activa')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    inicializarSession()
  }, [inicializarSession])

  const login = async (email, password) => {
    const resp = await authLogin(email, password)
    if (resp.ok) {
      setUsuario(resp.usuario)
      setToken(resp.token)
      return { ok: true }
    }
    return resp
  }

  const logout = async () => {
    await authLogout()
    setUsuario(null)
    setToken(null)
  }

  // Helper para refrescar el token manualmente si es necesario
  const refresh = async () => {
    const resp = await authRefresh()
    if (resp.ok) {
      setToken(resp.token)
      return resp.token
    }
    return null
  }

  return (
    <AuthContext.Provider value={{ usuario, token, setToken, login, logout, refresh, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
