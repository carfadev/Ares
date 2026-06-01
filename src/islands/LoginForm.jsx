import { useEffect, useState } from 'react';
import { browserLocalPersistence, browserSessionPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function LoginForm({ nextPath = '/' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const safeNextPath = nextPath && !nextPath.startsWith('/login') ? nextPath : '/';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.replace(safeNextPath);
      }
    });

    return () => unsubscribe();
  }, [safeNextPath]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Debes escribir correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      window.location.replace(safeNextPath);
    } catch (err) {
      console.error('Error autenticando', err);
      setError('No se pudo iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <label className="block">
        <span className="sr-only">Correo electrónico</span>
        <div className="w-full relative">
          <div className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-[rgba(12,60,107,0.16)]">
            <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="14" x="3" y="5" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="Correo electrónico"
              className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-[15px] pr-10"
            />
          </div>
        </div>
      </label>

      <label className="block">
        <span className="sr-only">Contraseña</span>
        <div className="w-full relative">
          <div className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-[rgba(12,60,107,0.16)]">
            <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="16" height="10" x="4" y="11" rx="2" />
              <path d="M8 11V8a4 4 0 1 1 8 0v3" />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Contraseña"
              className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-[15px] pr-10"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Mostrar contraseña"
          >
            <svg aria-hidden="true" className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.1 12s3.4-6.9 9.9-6.9S22 12 22 12s-3.4 6.9-9.9 6.9S2.1 12 2.1 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </label>

      <div className="flex items-center justify-between gap-4 pt-1 text-sm">
        <label className="inline-flex items-center gap-2 text-slate-500">
          <input
            type="checkbox"
            name="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[rgb(12,60,107)] focus:ring-[rgba(12,60,107,0.18)]"
          />
          <span>Recordarme</span>
        </label>
        <a href="#" className="font-medium text-[rgb(12,60,107)] transition hover:text-[rgb(9,46,82)]">¿Olvidaste tu contraseña?</a>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[linear-gradient(180deg,#0c3c6b_0%,#092b4d_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(12,60,107,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(12,60,107,0.24)] focus:outline-none focus:ring-2 focus:ring-[rgba(249,126,5,0.35)] focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span>{loading ? 'Ingresando...' : 'Iniciar sesión'}</span>
        <svg aria-hidden="true" className="h-4 w-4 text-[rgb(249,126,5)] transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}