import React, { useEffect, useState } from 'react';
import { BRANDING_CONFIG } from '../config/branding';

interface SplashScreenProps {
  onFinish?: () => void;
}

type SplashStage = 'enter' | 'appear' | 'zoom' | 'shrink' | 'reveal' | 'finished';

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [stage, setStage] = useState<SplashStage>('enter');
  const [visible, setVisible] = useState(true);

  // Logo da tela de carregamento (definida em branding.ts)
  const splashLogo = BRANDING_CONFIG.splashLogoUrl || BRANDING_CONFIG.logoUrl;

  useEffect(() => {
    // Se o usuário desativou animações nas configurações, encerra rápido
    const isAnimationsDisabled =
      typeof document !== 'undefined' &&
      document.body.classList.contains('disable-animations');

    if (isAnimationsDisabled) {
      const fastTimer = setTimeout(() => {
        setVisible(false);
        onFinish?.();
      }, 150);
      return () => clearTimeout(fastTimer);
    }

    // 1. Aparece a logo suavemente no centro
    const tAppear = setTimeout(() => {
      setStage('appear');
    }, 50);

    // 2. Dá o zoomzinho suave
    const tZoom = setTimeout(() => {
      setStage('zoom');
    }, 750);

    // 3. Diminui de tamanho e some na tela
    const tShrink = setTimeout(() => {
      setStage('shrink');
    }, 1450);

    // 4. A tela preta dissolve suavemente revelando o app pronto
    const tReveal = setTimeout(() => {
      setStage('reveal');
    }, 1850);

    // 5. Conclui e desmonta
    const tDone = setTimeout(() => {
      setStage('finished');
      setVisible(false);
      onFinish?.();
    }, 2350);

    return () => {
      clearTimeout(tAppear);
      clearTimeout(tZoom);
      clearTimeout(tShrink);
      clearTimeout(tReveal);
      clearTimeout(tDone);
    };
  }, [onFinish]);

  if (!visible) return null;

  // Transformação da Logo:
  // 1. Aparece (scale-100, opacity-100)
  // 2. Zoomzinho (scale-[1.16])
  // 3. Diminui e some (scale-[0.65], opacity-0)
  let logoTransform = 'scale-90 opacity-0';
  let auraOpacity = 'opacity-0 scale-75';

  if (stage === 'appear') {
    // 1. Aparece
    logoTransform = 'scale-100 opacity-100 transition-all duration-[650ms] cubic-bezier(0.16, 1, 0.3, 1)';
    auraOpacity = 'opacity-50 scale-100 transition-all duration-[650ms] ease-out';
  } else if (stage === 'zoom') {
    // 2. Zoomzinho suave
    logoTransform = 'scale-[1.16] opacity-100 transition-all duration-[650ms] cubic-bezier(0.25, 1, 0.5, 1)';
    auraOpacity = 'opacity-70 scale-110 transition-all duration-[650ms] ease-out';
  } else if (stage === 'shrink' || stage === 'reveal' || stage === 'finished') {
    // 3. Diminui e some
    logoTransform = 'scale-[0.65] opacity-0 transition-all duration-[500ms] cubic-bezier(0.4, 0, 0.2, 1)';
    auraOpacity = 'opacity-0 scale-75 transition-all duration-[450ms] ease-out';
  }

  const isFadingBackdrop = stage === 'reveal' || stage === 'finished';

  return (
    <div
      role="status"
      aria-label={`Carregando ${BRANDING_CONFIG.appName}`}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#09090b] transition-opacity duration-500 ease-out select-none overflow-hidden p-6 ${
        isFadingBackdrop ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer for optical centering */}
      <div className="w-full h-8" />

      {/* Brilho ambiental bem suave e discreto */}
      <div
        className={`absolute w-64 h-64 rounded-full bg-emerald-500/6 blur-[80px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${auraOpacity}`}
      />

      {/* Container da Logo com animação: Aparece -> Zoomzinho -> Diminui e some */}
      <div
        className={`relative z-10 flex flex-col items-center text-center will-change-transform ${logoTransform}`}
      >
        <div className="relative flex items-center justify-center">
          {splashLogo ? (
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center p-2 border-none outline-none ring-0">
              <img
                src={splashLogo}
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="sync"
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,212,146,0.18)] border-0 outline-none ring-0 select-none pointer-events-none"
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              />
            </div>
          ) : (
            <div
              id="splash-logo-placeholder"
              className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-[0_0_20px_rgba(16,185,129,0.12)] flex items-center justify-center text-zinc-100 font-bold text-2xl tracking-tight font-display ring-1 ring-emerald-500/15"
            >
              {BRANDING_CONFIG.initials}
            </div>
          )}

          {/* Halo sutil e suave */}
          <div
            className={`absolute -inset-1 rounded-full bg-emerald-400/5 blur-md pointer-events-none transition-all duration-500 ${
              stage === 'zoom' ? 'opacity-50 scale-105' : 'opacity-15 scale-95'
            }`}
          />
        </div>
      </div>

      {/* Rodapé da tela de carregamento: Desenvolvido por @nevascaaw e Versão bem escondida */}
      <div className="relative z-10 flex flex-col items-center gap-1 text-center pb-2">
        <p className="text-[11px] text-zinc-500 font-sans tracking-wide">
          Desenvolvido por{' '}
          <a
            href="https://www.instagram.com/nevascaaw/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-emerald-400 font-medium transition-colors hover:underline"
          >
            @nevascaaw
          </a>
        </p>
        <span className="text-[10px] text-zinc-700/60 font-mono tracking-wider select-none">
          v1.0.2
        </span>
      </div>
    </div>
  );
};
