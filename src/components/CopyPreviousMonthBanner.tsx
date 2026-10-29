import React from 'react';
import { Copy } from 'lucide-react';
import { MONTH_NAMES } from '../utils/finance';

interface CopyPreviousMonthBannerProps {
  prevMonth: number;
  prevYear: number;
  hasPrevCategories: boolean;
  prevCategoriesCount: number;
  onCopy: () => void;
  onAddManual: () => void;
}

export const CopyPreviousMonthBanner: React.FC<CopyPreviousMonthBannerProps> = ({
  prevMonth,
  prevYear: _prevYear,
  hasPrevCategories,
  prevCategoriesCount,
  onCopy,
  onAddManual,
}) => {
  const prevMonthName = MONTH_NAMES[prevMonth - 1];

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-center space-y-3 my-3">
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-zinc-200">
          Nenhuma categoria definida neste mês
        </h3>
        <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
          {hasPrevCategories
            ? `Você possui ${prevCategoriesCount} categorias em ${prevMonthName}. Deseja reutilizá-las para planejar este mês?`
            : 'Adicione suas categorias para distribuir sua renda e controlar seus gastos.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-0.5">
        {hasPrevCategories && (
          <button
            onClick={onCopy}
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-white active:scale-98 text-zinc-950 font-medium text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar categorias de {prevMonthName}</span>
          </button>
        )}

        <button
          onClick={onAddManual}
          className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 active:scale-98 text-zinc-300 font-medium text-xs border border-zinc-700/60 transition"
        >
          + Criar categoria do zero
        </button>
      </div>
    </div>
  );
};
