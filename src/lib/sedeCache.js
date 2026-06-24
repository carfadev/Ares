const STORAGE_KEY = 'ares_sede_data';

export function obtenerSede() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.sede;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function sedeAsignadaEnCache() {
  if (typeof window === 'undefined') return false;
  return !!obtenerSede();
}
