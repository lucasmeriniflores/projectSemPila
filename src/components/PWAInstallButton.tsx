import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, MoreVertical, X, Smartphone, Check } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed in standalone mode, don't show install button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable && !isIOS) {
      const installed = await install();
      if (!installed) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  const modalContent = showGuide && typeof document !== 'undefined' ? (
    createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-modal-backdrop"
        onClick={() => setShowGuide(false)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl text-zinc-100 animate-modal-sheet"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 id="pwa-install-title" className="text-sm font-bold font-display text-zinc-100">
                  Instalar no Celular
                </h3>
                <p className="text-[10px] text-zinc-400">
                  {isIOS ? 'iPhone e iPad (Safari)' : 'Android e Chrome'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
              aria-label="Fechar guia de instalação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Steps */}
          <div className="mt-4 space-y-3 text-xs text-zinc-300">
            {isIOS ? (
              <>
                <div className="flex items-start gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850">
                  <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center text-xs font-bold shrink-0 font-display">
                    1
                  </span>
                  <div className="text-[11px] leading-relaxed">
                    No Safari, toque no botão de <strong className="text-zinc-100">Compartilhar</strong> (ícone com seta para cima <Share2 className="inline w-3 h-3 text-emerald-400 -mt-0.5" />).
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850">
                  <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center text-xs font-bold shrink-0 font-display">
                    2
                  </span>
                  <div className="text-[11px] leading-relaxed">
                    Role a lista para baixo e toque em <strong className="text-zinc-100">"Adicionar à Tela de Início"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850">
                  <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center text-xs font-bold shrink-0 font-display">
                    3
                  </span>
                  <div className="text-[11px] leading-relaxed">
                    Toque em <strong className="text-emerald-400">Adicionar</strong> no canto superior direito para confirmar.
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850">
                  <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center text-xs font-bold shrink-0 font-display">
                    1
                  </span>
                  <div className="text-[11px] leading-relaxed">
                    Toque no menu do navegador (<strong className="text-zinc-100">três pontinhos</strong> <MoreVertical className="inline w-3 h-3 text-emerald-400 -mt-0.5" /> no canto superior).
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850">
                  <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center text-xs font-bold shrink-0 font-display">
                    2
                  </span>
                  <div className="text-[11px] leading-relaxed">
                    Selecione <strong className="text-zinc-100">"Instalar aplicativo"</strong> ou <strong className="text-zinc-100">"Adicionar à tela inicial"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850">
                  <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center text-xs font-bold shrink-0 font-display">
                    3
                  </span>
                  <div className="text-[11px] leading-relaxed">
                    Confirme para abrir o SemPila em <strong className="text-emerald-400">tela cheia 100% offline</strong> como app nativo.
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={() => setShowGuide(false)}
            className="mt-4 w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white active:scale-98 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Entendi</span>
          </button>
        </div>
      </div>,
      document.body
    )
  ) : null;

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleClick}
          aria-label="Instalar SemPila na tela inicial"
          title="Instalar no celular"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-850 active:scale-95 transition cursor-pointer text-xs font-medium shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Instalar</span>
        </button>
        {modalContent}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Instalar SemPila na tela inicial"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white active:scale-98 text-zinc-950 font-semibold text-xs transition cursor-pointer shadow-sm"
      >
        <Download className="w-3.5 h-3.5 text-zinc-950" />
        <span>Instalar no celular</span>
      </button>
      {modalContent}
    </>
  );
};
