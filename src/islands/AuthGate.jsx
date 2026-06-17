import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AuthGate({ currentPath }) {
  useEffect(() => {
    const isLoginPage = currentPath === '/login';

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isLoginPage) {
        if (user) {
          const next = new URL(window.location.href).searchParams.get('next');
          window.location.replace(next || '/');
        }
        return;
      }

      if (!user) {
        const nextPath = `${window.location.pathname}${window.location.search}`;
        window.location.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      }
    });

    return () => unsubscribe();
  }, [currentPath]);

  return null;
}