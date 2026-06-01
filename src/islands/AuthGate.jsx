import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AuthGate({ currentPath }) {
  useEffect(() => {
    const isLoginPage = currentPath === '/login';

    const revealBody = () => {
      document.body.style.visibility = 'visible';
    };

    const redirectToLogin = () => {
      const nextPath = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isLoginPage) {
        if (user) {
          const next = new URL(window.location.href).searchParams.get('next');
          window.location.replace(next || '/');
        } else {
          revealBody();
        }
        return;
      }

      if (!user) {
        redirectToLogin();
        return;
      }

      revealBody();
    });

    const handlePageShow = () => {
      if (isLoginPage) {
        revealBody();
        return;
      }

      const currentUser = auth.currentUser;

      if (!currentUser) {
        redirectToLogin();
        return;
      }

      revealBody();
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => unsubscribe();
  }, [currentPath]);

  return null;
}