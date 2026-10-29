import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Copy, AlertCircle } from 'lucide-react';
import { AppData, Category, MonthData } from './types/finance';
import {
  calculateMonthSummary,
  copyCategoriesFromPreviousMonth,
  createEmptyMonthData,
  createExampleMonthData,
  getMonthKey,
  getPreviousMonth,
  loadAppData,
  saveAppData,
  STORAGE_KEY,
} from './utils/finance';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { CategoryCard } from './components/CategoryCard';
import { CategoryModal } from './components/CategoryModal';
import { ExpenseModal } from './components/ExpenseModal';
import { IncomeModal } from './components/IncomeModal';
import { BackupModal } from './components/BackupModal';
import { CopyPreviousMonthBanner } from './components/CopyPreviousMonthBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SplashScreen } from './components/SplashScreen';
import { checkAndTriggerScheduledNotifications } from './utils/notifications';

export default function App() {
  // Current active date selection
  const now = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<number>(() => now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(() => now.getFullYear());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Master App Data
  const [appData, setAppData] = useState<AppData>(() => loadAppData());

  // Animation setting
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('sempila_animations_enabled') !== 'false';
  });

  // Apply animation class to body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('disable-animations', !animationsEnabled);
      localStorage.setItem('sempila_animations_enabled', String(animationsEnabled));
    }
  }, [animationsEnabled]);

  // Periodic check for 10:00 and 20:00 daily reminder notifications
  useEffect(() => {
    checkAndTriggerScheduledNotifications();
    const timer = setInterval(() => {
      checkAndTriggerScheduledNotifications();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Modals state
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [categoryModalState, setCategoryModalState] = useState<{
    isOpen: boolean;
    category?: Category | null;
  }>({ isOpen: false, category: null });
  const [expenseModalState, setExpenseModalState] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });

  // Sync state to LocalStorage whenever appData changes
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Current Month Key e.g. "2026-10"
  const currentKey = getMonthKey(currentMonth, currentYear);

  // Current Month Data
  const currentMonthData: MonthData = useMemo(() => {
    return (
      appData.months[currentKey] || createEmptyMonthData(currentMonth, currentYear, 0)
    );
  }, [appData.months, currentKey, currentMonth, currentYear]);

  // Previous Month info for copy feature
  const prevMonthInfo = useMemo(
    () => getPreviousMonth(currentMonth, currentYear),
    [currentMonth, currentYear]
  );
  const prevKey = getMonthKey(prevMonthInfo.month, prevMonthInfo.year);
  const prevMonthData = appData.months[prevKey];
  const hasPrevCategories = !!(prevMonthData && prevMonthData.categories.length > 0);

  // Financial summary
  const summary = useMemo(
    () => calculateMonthSummary(currentMonthData),
    [currentMonthData]
  );

  // Month update helper
  const updateCurrentMonthData = useCallback(
    (updater: (prev: MonthData) => MonthData) => {
      setAppData((prev) => {
        const existing = prev.months[currentKey] || createEmptyMonthData(currentMonth, currentYear, 0);
        const updated = updater(existing);
        return {
          ...prev,
          months: {
            ...prev.months,
            [currentKey]: {
              ...updated,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [currentKey, currentMonth, currentYear]
  );

  // Handlers
  const handleSetIncome = (newIncome: number) => {
    updateCurrentMonthData((prev) => ({
      ...prev,
      income: newIncome,
    }));
  };

  const handleSaveCategory = (catData: {
    name: string;
    budgeted: number;
    icon: string;
    color: string;
  }) => {
    updateCurrentMonthData((prev) => {
      const existingCats = prev.categories || [];
      if (categoryModalState.category) {
        // Edit existing
        const updatedCats = existingCats.map((c) =>
          c.id === categoryModalState.category!.id
            ? { ...c, ...catData }
            : c
        );
        return { ...prev, categories: updatedCats };
      } else {
        // Create new
        const newCat: Category = {
          id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: catData.name,
          budgeted: catData.budgeted,
          icon: catData.icon,
          color: catData.color,
          expenses: [],
        };
        return { ...prev, categories: [...existingCats, newCat] };
      }
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    updateCurrentMonthData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== categoryId),
    }));
  };

  const handleAddExpense = (
    categoryId: string,
    amount: number,
    description?: string,
    date?: string
  ) => {
    const newExpense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      amount,
      description,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };

    updateCurrentMonthData((prev) => {
      const updatedCats = prev.categories.map((c) => {
        if (c.id === categoryId) {
          return {
            ...c,
            expenses: [newExpense, ...(c.expenses || [])],
          };
        }
        return c;
      });
      return { ...prev, categories: updatedCats };
    });

    // Also update expense modal category pointer if open
    setExpenseModalState((prev) => {
      if (!prev.category || prev.category.id !== categoryId) return prev;
      return {
        ...prev,
        category: {
          ...prev.category,
          expenses: [newExpense, ...(prev.category.expenses || [])],
        },
      };
    });
  };

  const handleDeleteExpense = (categoryId: string, expenseId: string) => {
    updateCurrentMonthData((prev) => {
      const updatedCats = prev.categories.map((c) => {
        if (c.id === categoryId) {
          return {
            ...c,
            expenses: (c.expenses || []).filter((e) => e.id !== expenseId),
          };
        }
        return c;
      });
      return { ...prev, categories: updatedCats };
    });

    setExpenseModalState((prev) => {
      if (!prev.category || prev.category.id !== categoryId) return prev;
      return {
        ...prev,
        category: {
          ...prev.category,
          expenses: (prev.category.expenses || []).filter((e) => e.id !== expenseId),
        },
      };
    });
  };

  const handleCopyFromPrevious = () => {
    if (!prevMonthData) return;
    const copied = copyCategoriesFromPreviousMonth(
      prevMonthData,
      currentMonth,
      currentYear,
      currentMonthData.income
    );
    setAppData((prev) => ({
      ...prev,
      months: {
        ...prev.months,
        [currentKey]: copied,
      },
    }));
  };

  const handleImportData = (newData: AppData) => {
    setAppData(newData);
    saveAppData(newData);
  };

  const handleResetData = () => {
    const cleanMonth = createEmptyMonthData(currentMonth, currentYear, 0);
    const resetData: AppData = {
      version: 2,
      months: {
        [currentKey]: cleanMonth,
      },
    };
    setAppData(resetData);
    localStorage.removeItem(STORAGE_KEY);
    saveAppData(resetData);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white pb-[max(1rem,env(safe-area-inset-bottom))]">
      {/* Opening Splash Screen */}
      <SplashScreen />

      {/* Top Header with Auto-Hide on Scroll Down */}
      <Header
        currentMonth={currentMonth}
        currentYear={currentYear}
        onSelectMonth={(m, y, dir) => {
          setSlideDirection(dir || (m > currentMonth || y > currentYear ? 'right' : 'left'));
          setCurrentMonth(m);
          setCurrentYear(y);
        }}
        onOpenSettings={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area with slide animations on month change */}
      <main
        key={currentKey}
        className={`flex-1 w-full max-w-md mx-auto pb-12 ${
          slideDirection === 'right'
            ? 'animate-slide-from-right'
            : slideDirection === 'left'
            ? 'animate-slide-from-left'
            : 'animate-in fade-in duration-300'
        }`}
      >
        {/* Month Summary Cards */}
        <SummaryCards
          summary={summary}
          onEditIncome={() => setIsIncomeModalOpen(true)}
        />

        {/* Categories Section */}
        <section aria-label="Categorias de Orçamento" className="px-4 mt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-display">
                Categorias ({currentMonthData.categories.length})
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              {hasPrevCategories && currentMonthData.categories.length > 0 && (
                <button
                  onClick={handleCopyFromPrevious}
                  aria-label="Reimportar categorias do mês anterior"
                  title="Copiar categorias do mês anterior"
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 text-xs font-medium flex items-center gap-1 transition active:scale-95"
                >
                  <Copy className="w-3 h-3 text-zinc-400" />
                  <span className="hidden xs:inline">Copiar anterior</span>
                </button>
              )}

              <button
                onClick={() => setCategoryModalState({ isOpen: true, category: null })}
                aria-label="Adicionar nova categoria"
                className="py-1 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 active:scale-95 text-zinc-100 text-xs font-medium flex items-center gap-1 border border-zinc-700/80 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova</span>
              </button>
            </div>
          </div>

          {/* If no categories exist for this month */}
          {currentMonthData.categories.length === 0 ? (
            <CopyPreviousMonthBanner
              prevMonth={prevMonthInfo.month}
              prevYear={prevMonthInfo.year}
              hasPrevCategories={hasPrevCategories}
              prevCategoriesCount={prevMonthData?.categories.length || 0}
              onCopy={handleCopyFromPrevious}
              onAddManual={() => setCategoryModalState({ isOpen: true, category: null })}
            />
          ) : (
            /* Category Cards List */
            <div className="space-y-2.5">
              {summary.categoriesSummary.map(({ category, spent, remaining, percentage, isOverBudget }) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  spent={spent}
                  remaining={remaining}
                  percentage={percentage}
                  isOverBudget={isOverBudget}
                  onAddExpense={(cat) => setExpenseModalState({ isOpen: true, category: cat })}
                  onEditCategory={(cat) => setCategoryModalState({ isOpen: true, category: cat })}
                  onDeleteExpense={handleDeleteExpense}
                />
              ))}
            </div>
          )}

          {/* Quick Add Category Prompt at bottom if categories exist */}
          {currentMonthData.categories.length > 0 && (
            <div className="pt-1">
              <button
                onClick={() => setCategoryModalState({ isOpen: true, category: null })}
                className="w-full py-2.5 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-400" />
                <span>Adicionar categoria</span>
              </button>
            </div>
          )}
        </section>

        {/* Negative Free Money Alert Bar if user allocated more than income */}
        {summary.freeMoney < 0 && (
          <aside
            aria-label="Aviso de orçamento"
            className="mx-4 mt-3 p-3 rounded-xl bg-zinc-900/90 border border-rose-900/50 text-rose-300 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>
              Você orçou mais dinheiro do que a sua renda total deste mês. Ajuste os orçamentos das categorias para manter o equilíbrio.
            </p>
          </aside>
        )}

        {/* Rodapé do App */}
        <footer className="mt-10 mb-4 text-center px-4">
          <p className="text-xs text-zinc-500 font-sans">
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
        </footer>
      </main>

      {/* Income Modal */}
      <IncomeModal
        currentIncome={currentMonthData.income}
        month={currentMonth}
        year={currentYear}
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSave={handleSetIncome}
      />

      {/* Category Modal with in-app deletion */}
      <CategoryModal
        category={categoryModalState.category}
        isOpen={categoryModalState.isOpen}
        onClose={() => setCategoryModalState({ isOpen: false, category: null })}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      {/* Expense Modal */}
      <ExpenseModal
        category={expenseModalState.category}
        isOpen={expenseModalState.isOpen}
        onClose={() => setExpenseModalState({ isOpen: false, category: null })}
        onAddExpense={handleAddExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      {/* Backup and Settings Modal */}
      <BackupModal
        appData={appData}
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onImport={handleImportData}
        onReset={handleResetData}
        animationsEnabled={animationsEnabled}
        onToggleAnimations={setAnimationsEnabled}
      />

      {/* PWA Offline indicator */}
      <OfflineIndicator />
    </div>
  );
}
