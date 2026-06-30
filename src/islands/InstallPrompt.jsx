import { useEffect, useState } from 'react';
import { clientConfig } from '../../client.config';

export default function InstallPrompt() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsInstalled(installed);
    if (installed) return;

    setShow(true);

    const captured = window.__deferredPrompt;
    if (captured) {
      setDeferredPrompt(captured);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShow(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setInstalling(false);
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShow(false);
    }
  };

  if (!show || isInstalled) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: clientConfig.colors.secundario }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          Instala {clientConfig.appName}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Para garantizar la mejor experiencia y un acceso más rápido,{' '}
          <strong className="text-slate-800">{clientConfig.appName}</strong> debe instalarse
          en este dispositivo.
        </p>

        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Una vez instalada podrás acceder desde el escritorio o desde el menú de aplicaciones.
        </p>

        <button
          onClick={handleInstall}
          disabled={installing}
          className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl text-sm font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60"
          style={{ background: clientConfig.gradients.primario }}
        >
          {installing ? 'INSTALANDO…' : 'INSTALAR ARES'}
        </button>
      </div>
    </div>
  );
}
