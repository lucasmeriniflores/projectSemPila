import React, { useState } from 'react';
import { Plus, Edit2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { formatBRL } from '../utils/finance';
import { Category, Expense } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';

interface CategoryCardProps {
  category: Category;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  onAddExpense: (category: Category) => void;
  onEditCategory: (category: Category) => void;
  onDeleteExpense: (categoryId: string, expenseId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  spent,
  remaining,
  percentage,
  isOverBudget,
  onAddExpense,
  onEditCategory,
  onDeleteExpense,
}) => {
  const [showExpenses, setShowExpenses] = useState(false);

  const isWarning = !isOverBudget && percentage >= 80;
  const progressBg = isOverBudget
    ? 'bg-rose-500'
    : isWarning
    ? 'bg-amber-400'
    : 'bg-emerald-500';

  const expensesCount = category.expenses ? category.expenses.length : 0;

  return (
    <article
      aria-label={`Categoria ${category.name}`}
      className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3 shadow-none space-y-2.5 transition-colors hover:border-zinc-700/80"
    >
      {/* Top Header: Icon, Name, and Edit */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/90 border border-zinc-750 flex items-center justify-center text-zinc-300 shrink-0">
            <CategoryIcon name={category.icon} className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-xs text-zinc-100 truncate tracking-tight font-display">
              {category.name}
            </h3>
            <span className="text-[11px] text-zinc-400">
              Orçado: <strong className="text-zinc-300 font-medium font-display text-[11px]">{formatBRL(category.budgeted)}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => onEditCategory(category)}
          aria-label={`Editar categoria ${category.name}`}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition active:scale-95"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar & Status */}
      <div className="space-y-1">
        <div className="w-full h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${progressBg}`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400">
            Gasto: <span className="text-zinc-300 font-display text-[10px]">{formatBRL(spent)}</span>
          </span>
          <span
            className={`font-medium font-display text-[10px] ${
              isOverBudget
                ? 'text-rose-400'
                : isWarning
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {isOverBudget ? (
              <>Passou {formatBRL(Math.abs(remaining))}</>
            ) : (
              <>Resta {formatBRL(remaining)}</>
            )}
          </span>
        </div>
      </div>

      {/* Action Row */}
      <div className="pt-0.5 flex items-center gap-2">
        <button
          onClick={() => onAddExpense(category)}
          aria-label={`Registrar gasto em ${category.name}`}
          className="flex-1 py-2 px-3 rounded-lg bg-zinc-800/90 hover:bg-zinc-750 active:scale-98 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-zinc-700/60 transition"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          <span>Registrar Gasto</span>
        </button>

        {expensesCount > 0 && (
          <button
            onClick={() => setShowExpenses(!showExpenses)}
            aria-label={`${showExpenses ? 'Ocultar' : 'Ver'} histórico de ${category.name}`}
            className="py-2 px-2.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 active:scale-98 text-zinc-400 text-xs font-medium flex items-center gap-1 border border-zinc-750 transition cursor-pointer"
          >
            <span className="font-display text-[10px]">{expensesCount}</span>
            <span>{expensesCount === 1 ? 'gasto' : 'gastos'}</span>
            {showExpenses ? <ChevronUp className="w-3 h-3 transition-transform duration-200" /> : <ChevronDown className="w-3 h-3 transition-transform duration-200" />}
          </button>
        )}
      </div>

      {/* Expanded Expense History List with smooth bidirectional accordion */}
      <div className={`accordion-collapse ${showExpenses && expensesCount > 0 ? 'expanded' : ''}`}>
        <div className="accordion-inner">
          <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1.5">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block font-display">
              Lançamentos no mês
            </span>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5">
              {category.expenses?.map((exp: Expense) => (
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
                      aria-label={`Excluir gasto ${exp.description || formatBRL(exp.amount)}`}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
