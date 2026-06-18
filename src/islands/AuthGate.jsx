import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const REDIRECT_KEY = 'ares_auth_redirect_ts';

export default function AuthGate() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isLoginPage = window.location.pathname === '/login';

      if (isLoginPage) {
        if (user) {
          user.getIdToken()
            .then(() => {
              if (!auth.currentUser) return;
              const next = new URL(window.location.href).searchParams.get('next');
              if (next && !next.startsWith('/login')) {
                window.location.replace(next);
              } else {
                window.location.replace('/');
              }
            })
            .catch(() => {});
        }
        return;
      }

      if (!user) {
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
  }, []);

  return null;
}