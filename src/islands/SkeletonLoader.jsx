import { useEffect, useState } from 'react';
import useStore from '../lib/store';
import { auth } from '../lib/firebase';

export default function SkeletonLoader() {
  const initialized = useStore((s) => s.initialized);
  const user = useStore((s) => s.user);
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const hasUser = user !== null || auth.currentUser !== null;

  useEffect(() => {
    if (initialized) {
      setFadeOut(true);
      const timer = setTimeout(() => setShow(false), 350);
      return () => clearTimeout(timer);
    }
  }, [initialized]);

  if (!hasUser) return null;
  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] bg-slate-50 transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="fixed left-1/2 top-4 z-[71] w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 rounded-full bg-white/80 shadow-sm">
        <div className="flex items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-md bg-slate-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-5 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-12 pt-32 sm:pt-36">
        <div className="mb-10 sm:mb-12">
          <div className="h-7 w-72 animate-pulse rounded bg-slate-200 sm:h-9" />
          <div className="mt-3 h-4 w-96 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 animate-pulse rounded-md bg-slate-200" />
                <div className="flex-1">
                  <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
