import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-sm flex items-center justify-center gap-2 rounded-xl bg-amber-500/95 text-slate-950 px-4 py-2.5 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Modo Offline: Seus dados estão salvos no celular.</span>
    </div>
  );
};
