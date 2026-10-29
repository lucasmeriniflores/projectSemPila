export interface Expense {
  id: string;
  amount: number;
  description?: string;
  date: string; // ISO string or YYYY-MM-DD
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  budgeted: number;
  icon: string;
  color?: string;
  expenses: Expense[];
}

export interface MonthData {
  month: number; // 1-12
  year: number; // e.g. 2026
  income: number;
  categories: Category[];
  updatedAt: string;
}

export interface AppData {
  version: number;
  months: Record<string, MonthData>; // key is "YYYY-MM"
}

export interface MonthSummary {
  income: number;
  totalBudgeted: number;
  freeMoney: number;
  totalSpent: number;
  totalRemaining: number;
  categoriesSummary: {
    category: Category;
    spent: number;
    remaining: number;
    percentage: number;
    isOverBudget: boolean;
  }[];
}
