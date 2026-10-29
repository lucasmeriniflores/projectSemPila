import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { MONTH_NAMES, parseBRL } from '../utils/finance';
import { useAnimatedModal } from '../hooks/useAnimatedModal';

interface IncomeModalProps {
  currentIncome: number;
  month: number;
  year: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: number) => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  currentIncome,
  month,
  year,
  isOpen,
  onClose,
  onSave,
}) => {
  const { isRendered, isClosing, handleClose } = useAnimatedModal({
    isOpen,
    onClose,
  });

  const [incomeStr, setIncomeStr] = useState('');
  const [error, setError] = useState('');

  // Sync state whenever modal is opened with new currentIncome
  useEffect(() => {
    if (isOpen) {
      setIncomeStr(currentIncome > 0 ? String(currentIncome) : '');
      setError('');
    }
  }, [isOpen, currentIncome]);

  if (!isRendered) return null;

  const monthName = MONTH_NAMES[month - 1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseBRL(incomeStr);
    if (val < 0) {
      setError('A renda não pode ser negativa.');
      return;
    }
    handleClose(() => {
      onSave(val);
    });
  };

  const handleAddPreset = (amount: number) => {
    const current = parseBRL(incomeStr);
    setIncomeStr(String(current + amount));
    setError('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="income-modal-title"
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 ${
        isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl text-zinc-100 no-scrollbar ${
          isClosing ? 'animate-modal-sheet-out' : 'animate-modal-sheet'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 id="income-modal-title" className="text-sm font-semibold text-zinc-100 font-display">
              Renda Mensal
            </h2>
            <span className="text-xs text-zinc-400">
              {monthName} de {year}
            </span>
          </div>
          <button
            onClick={() => handleClose()}
            aria-label="Fechar"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="income-input" className="block text-xs font-medium text-zinc-400 mb-1">
              Salário ou renda total do mês
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-semibold">
                R$
              </span>
              <input
                id="income-input"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={incomeStr}
                onChange={(e) => {
                  setIncomeStr(e.target.value);
                  setError('');
                }}
                required
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 text-base font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition font-display"
              />
            </div>
          </div>

          {/* Quick preset increments */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-zinc-500">Adicionar:</span>
            <button
              type="button"
              onClick={() => handleAddPreset(100)}
              className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-750 text-[11px] text-zinc-300 transition font-display active:scale-95"
            >
              + R$ 100
            </button>
            <button
              type="button"
              onClick={() => handleAddPreset(500)}
              className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-750 text-[11px] text-zinc-300 transition font-display active:scale-95"
            >
              + R$ 500
            </button>
            <button
              type="button"
              onClick={() => handleAddPreset(1000)}
              className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-750 text-[11px] text-zinc-300 transition font-display active:scale-95"
            >
              + R$ 1.000
            </button>
          </div>

          {/* Save button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white active:scale-98 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar Renda</span>
          </button>
        </form>
      </div>
    </div>
  );
};
