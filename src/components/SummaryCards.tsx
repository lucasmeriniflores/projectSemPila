import React, { useState } from 'react';
import { Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatBRL } from '../utils/finance';
import { MonthSummary } from '../types/finance';

interface SummaryCardsProps {
  summary: MonthSummary;
  onEditIncome: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, onEditIncome }) => {
  const [showDetails, setShowDetails] = useState(false);

  const isFreeNegative = summary.freeMoney < 0;

  return (
    <section aria-label="Resumo Financeiro do Mês" className="max-w-md mx-auto px-4 pt-3 pb-2 space-y-2">
      {/* 3 Minimalist Graphite Summary Cards with Unbounded numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Card 1: Renda */}
        <div className="rounded-xl bg-zinc-900/70 border border-zinc-800/80 p-3 shadow-none">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span>Renda do mês</span>
            <button
              onClick={onEditIncome}
              aria-label="Editar renda mensal"
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition active:scale-95"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-100 font-display">
              {formatBRL(summary.income)}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-zinc-500">
            {summary.income === 0 ? 'Toque no lápis para definir' : 'Entrada mensal definida'}
          </p>
        </div>

        {/* Card 2: Total Separado */}
        <div className="rounded-xl bg-zinc-900/70 border border-zinc-800/80 p-3 shadow-none">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span>Total separado</span>
            <span className="text-[10px] bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded font-display">
              {summary.categoriesSummary.length} cat.
            </span>
          </div>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-semibold tracking-tight text-amber-400 font-display">
              {formatBRL(summary.totalBudgeted)}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-zinc-500">
            Distribuído em categorias
          </p>
        </div>

        {/* Card 3: Dinheiro Livre */}
        <div className="rounded-xl bg-zinc-900/70 border border-zinc-800/80 p-3 shadow-none">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span>Dinheiro livre</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                isFreeNegative
                  ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                  : 'bg-zinc-800/80 text-zinc-400'
              }`}
            >
              {isFreeNegative ? 'Excedido' : 'Disponível'}
            </span>
          </div>
          <div className="mt-1">
            <span
              className={`text-base sm:text-lg font-semibold tracking-tight font-display ${
                isFreeNegative ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatBRL(summary.freeMoney)}
            </span>
          </div>
          <p className={`mt-0.5 text-[10px] ${isFreeNegative ? 'text-rose-400/80' : 'text-zinc-500'}`}>
            {isFreeNegative ? 'Ajuste os orçamentos' : 'Não destinado'}
          </p>
        </div>
      </div>

      {/* Secondary Details Toggle with smooth bidirectional accordion */}
      <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/60 overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          aria-expanded={showDetails}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer active:scale-98"
        >
          <span className="font-medium flex items-center gap-1.5">
            Gastos realizados: <span className="text-zinc-200 font-semibold font-display text-[11px]">{formatBRL(summary.totalSpent)}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            {showDetails ? 'Ocultar' : 'Ver detalhes'}
            {showDetails ? <ChevronUp className="w-3 h-3 transition-transform duration-200" /> : <ChevronDown className="w-3 h-3 transition-transform duration-200" />}
          </span>
        </button>

        <div className={`accordion-collapse ${showDetails ? 'expanded' : ''}`}>
          <div className="accordion-inner">
            <div className="px-3 pb-3 pt-1 border-t border-zinc-800/60 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Total gasto</span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-200 mt-0.5 block font-display">
                  {formatBRL(summary.totalSpent)}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Soma de todas as despesas
                </span>
              </div>
              <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-850">
                <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Saldo restante</span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-400 mt-0.5 block font-display">
                  {formatBRL(summary.totalRemaining)}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Renda líquida menos gastos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
