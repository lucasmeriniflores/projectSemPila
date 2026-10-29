import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Category } from '../types/finance';
import { parseBRL } from '../utils/finance';
import { AVAILABLE_ICON_KEYS, CategoryIcon } from './CategoryIcon';
import { useAnimatedModal } from '../hooks/useAnimatedModal';

interface CategoryModalProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (catData: { name: string; budgeted: number; icon: string; color: string }) => void;
  onDelete?: (categoryId: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const { isRendered, isClosing, handleClose } = useAnimatedModal({
    isOpen,
    onClose,
  });

  const isEditing = !!category;

  const [name, setName] = useState('');
  const [budgetedStr, setBudgetedStr] = useState('');
  const [icon, setIcon] = useState('tag');
  const [error, setError] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(category ? category.name : '');
      setBudgetedStr(category ? String(category.budgeted) : '');
      setIcon(category ? category.icon : 'tag');
      setError('');
      setIsConfirmingDelete(false);
    }
  }, [isOpen, category]);

  if (!isRendered) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor, informe o nome da categoria.');
      return;
    }

    const numValue = parseBRL(budgetedStr);
    if (numValue < 0) {
      setError('O valor não pode ser negativo.');
      return;
    }

    handleClose(() => {
      onSave({
        name: cleanName,
        budgeted: numValue,
        icon,
        color: '#71717a',
      });
    });
  };

  const handleConfirmDelete = () => {
    if (!category || !onDelete) return;
    handleClose(() => {
      onDelete(category.id);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 ${
        isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto no-scrollbar ${
          isClosing ? 'animate-modal-sheet-out' : 'animate-modal-sheet'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-750 flex items-center justify-center text-zinc-300">
              <CategoryIcon name={icon} className="w-4 h-4 text-zinc-200" />
            </div>
            <h2 id="category-modal-title" className="text-sm font-semibold text-zinc-100 font-display">
              {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
          </div>
          <button
            onClick={() => handleClose()}
            aria-label="Fechar"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Delete Confirmation Banner (In-app, no window.confirm) */}
        {isConfirmingDelete ? (
          <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-rose-900/40 space-y-3 animate-accordion">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-rose-400">
                  Excluir "{category?.name}"?
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Esta categoria e todos os gastos registrados nela serão apagados deste mês.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-medium text-zinc-300 transition active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-xs font-semibold text-white transition active:scale-95 cursor-pointer"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="cat-name" className="block text-xs font-medium text-zinc-400 mb-1">
                Nome da categoria
              </label>
              <input
                id="cat-name"
                type="text"
                placeholder="Ex: Assinaturas, Mercado, Rolês..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                required
                autoFocus
                className="w-full px-3 py-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            {/* Budgeted amount */}
            <div>
              <label htmlFor="cat-budget" className="block text-xs font-medium text-zinc-400 mb-1">
                Valor orçado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">
                  R$
                </span>
                <input
                  id="cat-budget"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={budgetedStr}
                  onChange={(e) => {
                    setBudgetedStr(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition font-display"
                />
              </div>
            </div>

            {/* Vector Icon Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Ícone
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-2 bg-zinc-950/70 rounded-xl border border-zinc-800 max-h-40 overflow-y-auto no-scrollbar">
                {AVAILABLE_ICON_KEYS.map((key) => {
                  const isSelected = icon === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setIcon(key)}
                      aria-label={`Selecionar ícone ${key}`}
                      className={`h-9 rounded-lg flex items-center justify-center transition active:scale-95 border cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-600 text-white'
                          : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <CategoryIcon name={key} className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  aria-label="Excluir categoria"
                  className="py-2.5 px-3 rounded-lg bg-zinc-900 hover:bg-rose-950/30 text-rose-400 font-medium text-xs flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-rose-900/50 transition active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              )}

              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition active:scale-98 cursor-pointer"
              >
                {isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
