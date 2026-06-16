import { useEffect, useRef } from 'react';
import useStore from '../lib/store';

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

export default function SedeSelectionModal() {
  const initialized = useStore((s) => s.initialized);
  const user = useStore((s) => s.user);
  const eventoEnviado = useRef(false);

  useEffect(() => {
    if (!initialized) return;

    if (user?.sede) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          sede: user.sede,
          expiresAt: Date.now() + 12 * 60 * 60 * 1000,
        }));
      }

      if (!eventoEnviado.current) {
        eventoEnviado.current = true;
        window.dispatchEvent(new CustomEvent('sede-changed', { detail: { sede: user.sede } }));
      }
    }
  }, [initialized, user]);

  if (!initialized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="flex flex-col items-center gap-4">
          <img src="/images/logo2.webp" alt="ARES" className="h-16 w-16 animate-pulse" />
          <p className="text-sm font-medium text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user?.sede) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Sin sede asignada</h3>
        <p className="mt-2 text-sm text-slate-600">
          No tienes una sede asignada. Contacta a tu supervisor o administrador para que te asigne una.
        </p>
      </div>
    </div>
  );
}
