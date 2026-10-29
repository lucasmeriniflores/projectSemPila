import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          onClick={install}
          aria-label="Instalar aplicativo"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700/80 text-zinc-300 text-xs font-medium hover:bg-zinc-750 active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Instalar</span>
        </button>
      );
    }
    return (
      <button
        onClick={install}
        aria-label="Instalar aplicativo no celular"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white active:scale-98 text-zinc-950 font-semibold text-xs transition"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar na tela inicial</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Como instalar no iPhone"
          className={
            variant === 'compact'
              ? 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-850 border border-zinc-750 text-zinc-300 text-xs font-medium hover:bg-zinc-800 active:scale-95 transition'
              : 'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-750 active:scale-98 text-zinc-200 font-medium text-xs border border-zinc-750 transition'
          }
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl text-zinc-100">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-semibold">Instalar no iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  aria-label="Fechar guia de instalação"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs text-zinc-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center text-[11px] font-bold shrink-0">
                    1
                  </span>
                  <p>
                    Abra o app no <strong>Safari</strong> e toque no botão de <strong>Compartilhar</strong> (ícone com seta para cima).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center text-[11px] font-bold shrink-0">
                    2
                  </span>
                  <p>
                    Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center text-[11px] font-bold shrink-0">
                    3
                  </span>
                  <p>
                    Toque em <strong>Adicionar</strong> no canto superior para confirmar.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 active:scale-98 text-xs font-medium text-zinc-200 transition"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
