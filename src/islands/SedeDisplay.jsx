import { useEffect, useState } from 'react';
import { obtenerSede } from './SedeSelectionModal';
import useStore from '../lib/store';

export default function SedeDisplay() {
  const [sede, setSede] = useState(null);
  const userSede = useStore((s) => s.user?.sede);
  const initialized = useStore((s) => s.initialized);

  useEffect(() => {
    const cached = obtenerSede();
    if (cached) {
      setSede(cached);
      return;
    }
    if (initialized && userSede) {
      setSede(userSede);
    }
  }, [initialized, userSede]);

  useEffect(() => {
    const handleChange = (event) => {
      if (event.detail?.sede) setSede(event.detail.sede);
    };
    window.addEventListener('sede-changed', handleChange);
    return () => window.removeEventListener('sede-changed', handleChange);
  }, []);

  if (!sede) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/40 px-2 py-1.5 sm:px-3 max-w-[120px] sm:max-w-none overflow-hidden">
      <span className="font-medium text-slate-700 truncate text-xs sm:text-sm">{sede}</span>
    </div>
  );
}
