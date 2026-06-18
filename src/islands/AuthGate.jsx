import { useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AuthGate({ currentPath }) {
  useEffect(() => {
    const isLoginPage = currentPath === '/login';

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isLoginPage) {
        if (user) {
          // Sanitizar next para evitar loop login→login→login
          const next = new URL(window.location.href).searchParams.get('next');
          if (next && !next.startsWith('/login')) {
            window.location.replace(next);
          } else {
            window.location.replace('/');
          }
        }
        return;
      }

      if (!user) {
        // Guarda anti-loop: si redirigimos dos veces en menos de 5s, forzar logout
        const REDIRECT_KEY = 'ares_auth_redirect_ts';
        const now = Date.now();
        const prev = sessionStorage.getItem(REDIRECT_KEY);
        if (prev && now - parseInt(prev, 10) < 5000) {
          sessionStorage.removeItem(REDIRECT_KEY);
          signOut(auth);
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