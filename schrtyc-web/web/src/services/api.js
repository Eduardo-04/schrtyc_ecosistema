const BASE = import.meta.env.VITE_API_URL ?? 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `${window.location.protocol}//${window.location.host}/api`
    : 'http://localhost:3005/api');

export const getUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = BASE.replace('/api', '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

// Auxiliar para peticiones robustas
async function fetcher(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Error API (${res.status}): ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Error de red/petición en ${url}:`, err);
    return null;
  }
}

export const getProgramacionHoy = async () => {
  const dia = dias[new Date().getDay()];
  const data = await fetcher(`${BASE}/programacion?dia=${encodeURIComponent(dia)}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.programas ?? data.data ?? [];
};

export const getNoticias = async () => {
  const data = await fetcher(`${BASE}/noticias`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.noticias ?? data.data ?? [];
};

export const getEstaciones = async () => {
  const data = await fetcher(`${BASE}/estaciones`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.estaciones ?? data.data ?? [];
};

export const getProgramas = async () => {
  const data = await fetcher(`${BASE}/programas`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.programas ?? data.data ?? [];
};

export const getPaginas = async () => {
  const data = await fetcher(`${BASE}/paginas`);
  return data ?? {}; 
};

export const getGaleria = async () => {
  const data = await fetcher(`${BASE}/galeria`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.galeria ?? data.data ?? [];
};

export const getConfiguracion = async () => {
  const data = await fetcher(`${BASE}/configuracion`);
  return data ?? {};
};