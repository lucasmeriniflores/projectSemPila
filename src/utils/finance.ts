import { AppData, Category, MonthData, MonthSummary } from '../types/finance';

export const STORAGE_KEY = 'sempila_app_data_v1';
export const LEGACY_STORAGE_KEY = 'minhas_financas_app_data_v1';

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const SHORT_MONTH_NAMES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

/**
 * Format a number as Brazilian Real (BRL) currency
 * Example: 2000 -> "R$ 2.000,00"
 */
export function formatBRL(value: number): string {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parses user input string to number. Handles both "1.500,50", "1500.50", "1500", etc.
 */
export function parseBRL(input: string | number): number {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;
  
  const clean = input
    .replace(/[R$\s]/g, '')
    .trim();
  
  if (!clean) return 0;

  // If format is like 1.234,56 (BR format)
  if (clean.includes(',') && clean.includes('.')) {
    const normalized = clean.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // If format has only comma: 1234,56
  if (clean.includes(',')) {
    const normalized = clean.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Creates month key string e.g. "2026-10"
 */
export function getMonthKey(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function parseMonthKey(key: string): { month: number; year: number } {
  const [yearStr, monthStr] = key.split('-');
  return {
    year: parseInt(yearStr, 10),
    month: parseInt(monthStr, 10),
  };
}

export function getPreviousMonth(month: number, year: number): { month: number; year: number } {
  if (month === 1) {
    return { month: 12, year: year - 1 };
  }
  return { month: month - 1, year };
}

export function getNextMonth(month: number, year: number): { month: number; year: number } {
  if (month === 12) {
    return { month: 1, year: year + 1 };
  }
  return { month: month + 1, year };
}

/**
 * Calculates financial summary for a month
 */
export function calculateMonthSummary(monthData: MonthData): MonthSummary {
  const income = Number(monthData.income) || 0;
  let totalBudgeted = 0;
  let totalSpent = 0;

  const categoriesSummary = monthData.categories.map((cat) => {
    const budgeted = Number(cat.budgeted) || 0;
    const spent = (cat.expenses || []).reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
    const remaining = budgeted - spent;
    const percentage = budgeted > 0 ? (spent / budgeted) * 100 : spent > 0 ? 100 : 0;
    const isOverBudget = spent > budgeted;

    totalBudgeted += budgeted;
    totalSpent += spent;

    return {
      category: cat,
      spent,
      remaining,
      percentage: Math.min(percentage, 100),
      isOverBudget,
    };
  });

  const freeMoney = income - totalBudgeted;
  const totalRemaining = income - totalSpent;

  return {
    income,
    totalBudgeted,
    freeMoney,
    totalSpent,
    totalRemaining,
    categoriesSummary,
  };
}

/**
 * Initial example data according to user specification
 * Uses clean icon keys and minimalist neutral styling
 */
export function createExampleMonthData(month: number, year: number): MonthData {
  return {
    month,
    year,
    income: 2000,
    categories: [
      {
        id: 'cat-assinaturas',
        name: 'Assinaturas',
        budgeted: 300,
        icon: 'smartphone',
        expenses: [],
      },
      {
        id: 'cat-cabelo',
        name: 'Cabelo',
        budgeted: 60,
        icon: 'scissors',
        expenses: [],
      },
      {
        id: 'cat-roles',
        name: 'Rolês',
        budgeted: 400,
        icon: 'sparkles',
        expenses: [],
      },
      {
        id: 'cat-investimentos',
        name: 'Investimentos',
        budgeted: 300,
        icon: 'trending-up',
        expenses: [],
      },
      {
        id: 'cat-moto',
        name: 'Moto',
        budgeted: 500,
        icon: 'bike',
        expenses: [],
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Creates empty month data
 */
export function createEmptyMonthData(month: number, year: number, income: number = 0): MonthData {
  return {
    month,
    year,
    income,
    categories: [],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Copies categories from a previous month into target month data without expenses
 */
export function copyCategoriesFromPreviousMonth(
  previousData: MonthData,
  targetMonth: number,
  targetYear: number,
  existingIncome?: number
): MonthData {
  const clonedCategories: Category[] = previousData.categories.map((c) => ({
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: c.name,
    budgeted: c.budgeted,
    icon: c.icon,
    color: c.color,
    expenses: [], // Reset expenses for new month
  }));

  return {
    month: targetMonth,
    year: targetYear,
    income: existingIncome !== undefined && existingIncome > 0 ? existingIncome : previousData.income,
    categories: clonedCategories,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * LocalStorage load - Starts with completely clean state (no money, no categories)
 */
export function loadAppData(): AppData {
  if (typeof window === 'undefined') {
    return { version: 2, months: {} };
  }

  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        raw = legacy;
      }
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentKey = getMonthKey(currentMonth, currentYear);

    if (!raw) {
      // First time user: initialize clean with 0 income and 0 categories
      const cleanMonth = createEmptyMonthData(currentMonth, currentYear, 0);
      const initialAppData: AppData = {
        version: 2,
        months: {
          [currentKey]: cleanMonth,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAppData));
      return initialAppData;
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.months) {
      // If data is from old version 1 or contains legacy demo categories, reset to clean state
      if (!parsed.version || parsed.version < 2) {
        const cleanMonth = createEmptyMonthData(currentMonth, currentYear, 0);
        const resetAppData: AppData = {
          version: 2,
          months: {
            [currentKey]: cleanMonth,
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resetAppData));
        return resetAppData;
      }
      return parsed as AppData;
    }
  } catch (err) {
    console.error('Failed to parse localStorage data:', err);
  }

  const now = new Date();
  const currentKey = getMonthKey(now.getMonth() + 1, now.getFullYear());
  return {
    version: 2,
    months: {
      [currentKey]: createEmptyMonthData(now.getMonth() + 1, now.getFullYear(), 0),
    },
  };
}

/**
 * LocalStorage save
 */
export function saveAppData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * JSON Export
 */
export function exportDataAsJSON(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * JSON Import validation
 */
export function validateAndParseImportJSON(jsonText: string): {
  success: boolean;
  data?: AppData;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'O arquivo JSON não contém um objeto válido.' };
    }

    if (!parsed.months || typeof parsed.months !== 'object') {
      return { success: false, error: 'Estrutura inválida: campo "months" não encontrado.' };
    }

    // Basic structure validation
    for (const [key, month] of Object.entries(parsed.months)) {
      const m = month as MonthData;
      if (typeof m.month !== 'number' || typeof m.year !== 'number' || !Array.isArray(m.categories)) {
        return { success: false, error: `Dados corrompidos no mês ${key}.` };
      }
    }

    const appData: AppData = {
      version: parsed.version || 1,
      months: parsed.months,
    };

    return { success: true, data: appData };
  } catch (e: any) {
    return { success: false, error: `Erro ao ler arquivo: ${e.message}` };
  }
}
