import { useEffect, useState } from 'react';
import useStore from '../lib/store';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function Greeting() {
  const [mounted, setMounted] = useState(false);
  const user = useStore((s) => s.user);
  const initialized = useStore((s) => s.initialized);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !initialized) return null;

  const nombre = user?.nombre || user?.email?.split('@')[0] || 'Usuario';

  return (
    <span>{getGreeting()}, {nombre}</span>
  );
}
