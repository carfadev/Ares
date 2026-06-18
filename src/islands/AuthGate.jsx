import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const REDIRECT_KEY = 'ares_auth_redirect_ts';

export default function AuthGate({ currentPath }) {
  useEffect(() => {
    const isLoginPage = currentPath === '/login';

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isLoginPage) {
        if (user) {
          // Verificar que el token sea realmente válido antes de redirigir
          // Si el token expiró y no se puede refrescar, no redirigimos
          // (evita loop login→home→login con sesión corrupta)
          user.getIdToken()
            .then(() => {
              // Token válido — redirigir
              if (!auth.currentUser) return;
              const next = new URL(window.location.href).searchParams.get('next');
              if (next && !next.startsWith('/login')) {
                window.location.replace(next);
              } else {
                window.location.replace('/');
              }
            })
            .catch(() => {
              // Token inválido — nos quedamos en login
            });
        }
        return;
      }

      if (!user) {
        // Anti-loop: evitar redirecciones rápidas repetidas
        const now = Date.now();
        const prev = sessionStorage.getItem(REDIRECT_KEY);
        if (prev && now - parseInt(prev, 10) < 10000) {
          sessionStorage.removeItem(REDIRECT_KEY);
          window.location.replace('/login');
          return;
        }
        sessionStorage.setItem(REDIRECT_KEY, now.toString());

        const nextPath = `${window.location.pathname}${window.location.search}`;
        window.location.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      }
    });

    return () => unsubscribe();
  }, [currentPath]);

  return null;
}