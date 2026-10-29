import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Settings, Calendar } from 'lucide-react';
import { MONTH_NAMES, getNextMonth, getPreviousMonth } from '../utils/finance';
import { PWAInstallButton } from './PWAInstallButton';
import { BRANDING_CONFIG } from '../config/branding';

interface HeaderProps {
  currentMonth: number;
  currentYear: number;
  onSelectMonth: (month: number, year: number, direction?: 'left' | 'right') => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  currentYear,
  onSelectMonth,
  onOpenSettings,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      // Always show near top
      if (currentScrollY < 20) {
        setIsVisible(true);
      } else if (delta > 6 && currentScrollY > 70) {
        // Scrolling down past threshold -> hide header smoothly
        setIsVisible(false);
      } else if (delta < -6) {
        // Scrolling up -> reveal header smoothly
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrev = () => {
    const { month, year } = getPreviousMonth(currentMonth, currentYear);
    onSelectMonth(month, year, 'left');
  };

  const handleNext = () => {
    const { month, year } = getNextMonth(currentMonth, currentYear);
    onSelectMonth(month, year, 'right');
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    const direction = newMonth > currentMonth ? 'right' : 'left';
    onSelectMonth(newMonth, currentYear, direction);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    const direction = newYear > currentYear ? 'right' : 'left';
    onSelectMonth(currentMonth, newYear, direction);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const baseYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => baseYear - 3 + i);

  return (
    <header
      className={`sticky top-0 z-30 transition-transform duration-300 ease-in-out bg-[#09090b]/75 backdrop-blur-xl supports-[backdrop-filter]:bg-[#09090b]/65 shadow-md shadow-black/30 px-4 py-3 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* =========================================================================
            LOGO DO HEADER (Toque para rolar ao topo):
            - Configurado em: `headerLogoUrl` em `/src/config/branding.ts`
            - Como a nova logo já contém o nome SemPila integrado, o texto foi removido.
           ========================================================================= */}
        <button
          onClick={handleScrollToTop}
          aria-label={`${BRANDING_CONFIG.appName} - Voltar ao topo`}
          title="Toque para voltar ao topo"
          className="flex items-center text-left group cursor-pointer focus:outline-none transition active:scale-95"
        >
          {BRANDING_CONFIG.headerLogoUrl || BRANDING_CONFIG.logoUrl ? (
            <img
              src={BRANDING_CONFIG.headerLogoUrl || BRANDING_CONFIG.logoUrl}
              alt={BRANDING_CONFIG.appName}
              className="h-6 sm:h-7 w-auto max-w-[160px] object-contain transition duration-200"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                id="app-header-logo"
                aria-hidden="true"
                className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-white font-bold text-[10px] tracking-tight select-none font-display transition shadow-sm shrink-0"
              >
                {BRANDING_CONFIG.initials}
              </div>
              <h1 className="text-base font-bold text-zinc-100 group-hover:text-white tracking-tight leading-none font-display transition">
                {BRANDING_CONFIG.appName}
              </h1>
            </div>
          )}
        </button>
        {/* ========================================================================= */}

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          <PWAInstallButton variant="compact" />
          <button
            onClick={onOpenSettings}
            aria-label="Abrir configurações e backup"
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Navigator Bar */}
      <div className="max-w-md mx-auto mt-2.5 flex items-center justify-between bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-1">
        <button
          onClick={handlePrev}
          aria-label="Mês anterior"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:scale-95 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-zinc-300">
          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <div className="flex items-center gap-1">
            <select
              aria-label="Selecionar mês"
              value={currentMonth}
              onChange={handleMonthChange}
              className="appearance-none bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 font-medium text-xs text-zinc-200 hover:text-white cursor-pointer py-0.5 px-0.5 font-display text-center select-none"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1} className="bg-zinc-900 text-zinc-200 font-sans">
                  {name}
                </option>
              ))}
            </select>
            <span className="text-zinc-600 font-light select-none">/</span>
            <select
              aria-label="Selecionar ano"
              value={currentYear}
              onChange={handleYearChange}
              className="appearance-none bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 font-medium text-xs text-zinc-400 hover:text-white cursor-pointer py-0.5 px-0.5 font-display text-center select-none"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-zinc-900 text-zinc-200 font-sans">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleNext}
          aria-label="Próximo mês"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:scale-95 transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
