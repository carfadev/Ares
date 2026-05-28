const enqueueToast = (kind, message) => {
  if (typeof window === 'undefined') {
    return;
  }

  const globalWindow = window;

  if (globalWindow.__AresToast) {
    if (kind === 'success') {
      globalWindow.__AresToast.success(message);
      return;
    }

    if (kind === 'error') {
      globalWindow.__AresToast.error(message);
      return;
    }

    globalWindow.__AresToast(message);
    return;
  }

  globalWindow.__AresToastQueue = globalWindow.__AresToastQueue || [];
  globalWindow.__AresToastQueue.push({ kind, message });
};

export const notifySuccess = (message) => enqueueToast('success', message);
export const notifyError = (message) => enqueueToast('error', message);
export const notifyToast = (message) => enqueueToast('default', message);