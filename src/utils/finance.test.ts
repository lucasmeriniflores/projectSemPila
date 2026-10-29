import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBRL,
  parseBRL,
  getMonthKey,
  getPreviousMonth,
  getNextMonth,
  calculateMonthSummary,
  createExampleMonthData,
  copyCategoriesFromPreviousMonth,
  validateAndParseImportJSON,
} from './finance';
import { MonthData } from '../types/finance';

test('formatBRL formats Brazilian Real correctly', () => {
  const result = formatBRL(2000);
  // Replaces non-breaking space if any
  const normalized = result.replace(/\u00a0/g, ' ');
  assert.match(normalized, /R\$\s*2\.000,00/);
  
  const zeroResult = formatBRL(0).replace(/\u00a0/g, ' ');
  assert.match(zeroResult, /R\$\s*0,00/);
});

test('parseBRL handles various Brazilian numeric inputs', () => {
  assert.equal(parseBRL('2000'), 2000);
  assert.equal(parseBRL('2.000,00'), 2000);
  assert.equal(parseBRL('1.560,50'), 1560.5);
  assert.equal(parseBRL('R$ 300,00'), 300);
  assert.equal(parseBRL('60,50'), 60.5);
  assert.equal(parseBRL(''), 0);
  assert.equal(parseBRL(500), 500);
});

test('month navigation calculates next and previous correctly', () => {
  assert.deepEqual(getPreviousMonth(1, 2026), { month: 12, year: 2025 });
  assert.deepEqual(getPreviousMonth(5, 2026), { month: 4, year: 2026 });
  assert.deepEqual(getNextMonth(12, 2026), { month: 1, year: 2027 });
  assert.deepEqual(getNextMonth(10, 2026), { month: 11, year: 2026 });
  assert.equal(getMonthKey(3, 2026), '2026-03');
  assert.equal(getMonthKey(11, 2026), '2026-11');
});

test('calculateMonthSummary calculates initial example exactly as requested', () => {
  const exampleMonth = createExampleMonthData(10, 2026);
  const summary = calculateMonthSummary(exampleMonth);

  // User requested:
  // Renda: R$ 2.000,00.
  // Categorias:
  // - Assinaturas: R$ 300,00.
  // - Cabelo: R$ 60,00.
  // - Rolês: R$ 400,00.
  // - Investimentos: R$ 300,00.
  // - Moto: R$ 500,00.
  // Mostrar:
  // - Renda: R$ 2.000,00.
  // - Total separado: R$ 1.560,00.
  // - Dinheiro livre: R$ 440,00.
  assert.equal(summary.income, 2000);
  assert.equal(summary.totalBudgeted, 1560);
  assert.equal(summary.freeMoney, 440);
  assert.equal(summary.totalSpent, 0);
  assert.equal(summary.totalRemaining, 2000);
});

test('calculateMonthSummary handles expenses and remaining balances', () => {
  const monthData: MonthData = {
    month: 10,
    year: 2026,
    income: 2000,
    categories: [
      {
        id: 'cat-1',
        name: 'Rolês',
        budgeted: 400,
        icon: '🍻',
        expenses: [
          { id: 'exp-1', amount: 150, description: 'Barzinho', date: '2026-10-12', createdAt: 1 },
          { id: 'exp-2', amount: 50, description: 'Lanche', date: '2026-10-13', createdAt: 2 },
        ],
      },
      {
        id: 'cat-2',
        name: 'Moto',
        budgeted: 500,
        icon: '🏍️',
        expenses: [
          { id: 'exp-3', amount: 100, description: 'Gasolina', date: '2026-10-10', createdAt: 3 },
        ],
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  const summary = calculateMonthSummary(monthData);

  assert.equal(summary.income, 2000);
  assert.equal(summary.totalBudgeted, 900);
  assert.equal(summary.freeMoney, 1100);
  assert.equal(summary.totalSpent, 300);
  assert.equal(summary.totalRemaining, 1700);

  const cat1Summary = summary.categoriesSummary.find((c) => c.category.id === 'cat-1')!;
  assert.equal(cat1Summary.spent, 200);
  assert.equal(cat1Summary.remaining, 200);
  assert.equal(cat1Summary.percentage, 50);
  assert.equal(cat1Summary.isOverBudget, false);

  const cat2Summary = summary.categoriesSummary.find((c) => c.category.id === 'cat-2')!;
  assert.equal(cat2Summary.spent, 100);
  assert.equal(cat2Summary.remaining, 400);
  assert.equal(cat2Summary.percentage, 20);
});

test('copyCategoriesFromPreviousMonth copies categories without expenses', () => {
  const previousMonth = createExampleMonthData(9, 2026);
  // Add an expense to previous month
  previousMonth.categories[0].expenses.push({
    id: 'old-exp',
    amount: 100,
    date: '2026-09-05',
    createdAt: 1,
  });

  const nextMonthData = copyCategoriesFromPreviousMonth(previousMonth, 10, 2026);

  assert.equal(nextMonthData.month, 10);
  assert.equal(nextMonthData.year, 2026);
  assert.equal(nextMonthData.income, 2000);
  assert.equal(nextMonthData.categories.length, 5);
  // Expenses should be reset to 0 in target month
  assert.equal(nextMonthData.categories[0].expenses.length, 0);
  assert.equal(nextMonthData.categories[0].budgeted, 300);
});

test('validateAndParseImportJSON validates schema correctly', () => {
  const validData = {
    version: 1,
    months: {
      '2026-10': createExampleMonthData(10, 2026),
    },
  };

  const validResult = validateAndParseImportJSON(JSON.stringify(validData));
  assert.equal(validResult.success, true);
  assert.ok(validResult.data?.months['2026-10']);

  const invalidResult = validateAndParseImportJSON('invalid json string');
  assert.equal(invalidResult.success, false);

  const missingMonthsResult = validateAndParseImportJSON(JSON.stringify({ some: 'data' }));
  assert.equal(missingMonthsResult.success, false);
});

test('calculateMonthSummary handles completely empty month with 0 income and 0 categories', () => {
  const emptyMonth = {
    month: 10,
    year: 2026,
    income: 0,
    categories: [],
    updatedAt: new Date().toISOString(),
  };

  const summary = calculateMonthSummary(emptyMonth);
  assert.equal(summary.income, 0);
  assert.equal(summary.totalBudgeted, 0);
  assert.equal(summary.freeMoney, 0);
  assert.equal(summary.totalSpent, 0);
  assert.equal(summary.totalRemaining, 0);
  assert.equal(summary.categoriesSummary.length, 0);
});

test('notification system provides rich funny push messages for morning and evening', async () => {
  const { getRandomMessage, MORNING_MESSAGES, EVENING_MESSAGES } = await import('./notifications');

  assert.ok(MORNING_MESSAGES.length >= 5);
  assert.ok(EVENING_MESSAGES.length >= 5);

  const morningMsg = getRandomMessage('morning');
  assert.equal(typeof morningMsg, 'string');
  assert.ok(morningMsg.length > 10);

  const eveningMsg = getRandomMessage('evening');
  assert.equal(typeof eveningMsg, 'string');
  assert.ok(eveningMsg.length > 10);
});
