import { useState, useEffect, useCallback } from 'react'
import { fetchProgramacion } from '../services/api'

export const useProgramacion = (filtros = {}) => {
  const [programas, setProgramas] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [lastSync, setLastSync]   = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProgramacion(filtros)
      setProgramas(data)
      setLastSync(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtros)])

  useEffect(() => {
    cargar()
    const interval = setInterval(cargar, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [cargar])

  return { programas, loading, error, lastSync, refetch: cargar }
}