import { useEffect, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import useStore from '../lib/store';

export default function SedeGate() {
  const initialized = useStore((s) => s.initialized);
  const user = useStore((s) => s.user);
  const [blocked, setBlocked] = useState(false);
  const signingOut = useRef(false);

  useEffect(() => {
    if (signingOut.current) return;
    if (initialized && user && !user.sede) {
      setBlocked(true);
    }
  }, [initialized, user]);

  const handleLogout = async () => {
    signingOut.current = true;
    setBlocked(false);
    await signOut(auth);
  };

  if (!blocked) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white">
      <div className="mx-4 max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Cuenta sin sede asignada</h2>
        <p className="mt-3 text-sm text-slate-600">
          Tu cuenta no tiene una sede asignada. Contacta al administrador para que te asigne una sede antes de continuar.
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-slate-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          CERRAR SESIÓN
        </button>
      </div>
    </div>
  );
}
