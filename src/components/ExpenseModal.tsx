import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Category, Expense } from '../types/finance';
import { formatBRL, parseBRL } from '../utils/finance';
import { CategoryIcon } from './CategoryIcon';
import { useAnimatedModal } from '../hooks/useAnimatedModal';

interface ExpenseModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (categoryId: string, amount: number, description?: string, date?: string) => void;
  onDeleteExpense: (categoryId: string, expenseId: string) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  category,
  isOpen,
  onClose,
  onAddExpense,
  onDeleteExpense,
}) => {
  const { isRendered, isClosing, handleClose } = useAnimatedModal({
    isOpen,
    onClose,
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayStr);
  const [error, setError] = useState('');

  if (!isRendered || !category) return null;

  const currentSpent = (category.expenses || []).reduce((acc, e) => acc + e.amount, 0);
  const remaining = category.budgeted - currentSpent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseBRL(amountStr);

    if (parsedAmount <= 0) {
      setError('Por favor, informe um valor maior que zero.');
      return;
    }

    onAddExpense(category.id, parsedAmount, description.trim() || undefined, date);
    setAmountStr('');
    setDescription('');
    setDate(todayStr);
    setError('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-modal-title"
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 ${
        isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl text-zinc-100 max-h-[92vh] overflow-y-auto no-scrollbar ${
          isClosing ? 'animate-modal-sheet-out' : 'animate-modal-sheet'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-750 flex items-center justify-center text-zinc-300">
              <CategoryIcon name={category.icon} className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <h2 id="expense-modal-title" className="text-sm font-semibold text-zinc-100 font-display">
                Registrar Gasto
              </h2>
              <span className="text-xs text-zinc-400">
                em <strong className="text-zinc-200">{category.name}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={() => handleClose()}
            aria-label="Fechar"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Budget Status Strip */}
        <div className="mt-3 bg-zinc-950/80 border border-zinc-800 rounded-xl p-2.5 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Total Separado</span>
            <span className="font-semibold text-zinc-200 text-xs font-display">
              {formatBRL(category.budgeted)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Resta na categoria</span>
            <span
              className={`font-semibold text-xs font-display ${
                remaining < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatBRL(remaining)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          {error && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Amount input */}
          <div>
            <label htmlFor="expense-amount" className="block text-xs font-medium text-zinc-400 mb-1">
              Valor do gasto (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-semibold">
                R$
              </span>
              <input
                id="expense-amount"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError('');
                }}
                required
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 text-base font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition font-display"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="expense-desc" className="block text-xs font-medium text-zinc-400 mb-1">
              Descrição (opcional)
            </label>
            <input
              id="expense-desc"
              type="text"
              placeholder="Ex: Almoço, Gasolina, Uber..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="expense-date" className="block text-xs font-medium text-zinc-400 mb-1">
              Data do gasto
            </label>
            <input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 transition font-display"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white active:scale-98 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Confirmar Gasto</span>
          </button>
        </form>

        {/* Existing Expenses List */}
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Lançamentos ({category.expenses?.length || 0})
            </h3>
            <span className="text-xs text-zinc-300 font-medium font-display">
              Total: {formatBRL(currentSpent)}
            </span>
          </div>

          {(!category.expenses || category.expenses.length === 0) ? (
            <p className="text-xs text-zinc-500 italic py-2 text-center">
              Nenhum gasto registrado nesta categoria.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar pr-0.5">
              {category.expenses.map((exp: Expense) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between bg-zinc-950/70 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-zinc-300 font-medium truncate text-[11px]">
                      {exp.description || 'Gasto sem descrição'}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-display">
                      {new Date(exp.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-rose-400 text-xs font-display">
                      -{formatBRL(exp.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteExpense(category.id, exp.id)}
                      aria-label="Excluir gasto"
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-850 transition cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
