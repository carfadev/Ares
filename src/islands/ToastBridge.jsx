import React, { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

export default function ToastBridge() {
  useEffect(() => {
    const globalWindow = window;

    globalWindow.__AresToast = toast;

    const queue = globalWindow.__AresToastQueue || [];
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) continue;

      if (entry.kind === 'success') toast.success(entry.message);
      else if (entry.kind === 'error') toast.error(entry.message);
      else toast(entry.message);
    }

    return () => {
      if (globalWindow.__AresToast === toast) {
        delete globalWindow.__AresToast;
      }
    };
  }, []);

  return <Toaster position="top-center" expand={false} richColors offset={{ top: '5.5rem' }} mobileOffset={{ top: '5.5rem' }} />;
}