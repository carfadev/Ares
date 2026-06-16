import { useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const SESION_DURACION = 12 * 60 * 60 * 1000;
const INACTIVIDAD_MAX = 10 * 60 * 1000;

export default function SessionManager() {
  const timeoutRef = useRef(null);

  useEffect(() => {
    const checkSession = () => {
      const loginTime = localStorage.getItem('ares_login_time');
      if (!loginTime) return;

      const elapsed = Date.now() - Number(loginTime);
      if (elapsed > SESION_DURACION) {
        localStorage.removeItem('ares_login_time');
        localStorage.setItem('ares_session_expired', 'expirada');
        signOut(auth);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60 * 1000);

    const resetInactivity = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        localStorage.removeItem('ares_login_time');
        localStorage.setItem('ares_session_expired', 'inactividad');
        signOut(auth);
      }, INACTIVIDAD_MAX);
    };

    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetInactivity));
    resetInactivity();

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((e) => window.removeEventListener(e, resetInactivity));
    };
  }, []);

  return null;
}
