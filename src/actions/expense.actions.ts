'use server';

import { ExpenseService } from '@/services/expense.service';
import { ExpenseRepository } from '@/repositories/expense.repository';
import { Expense } from '@/types/domain';

const getExpenseService = (): ExpenseService => {
  return new ExpenseService(new ExpenseRepository());
};

export async function getExpenses(): Promise<Expense[]> {
  try {
    const service = getExpenseService();
    return await service.getAllExpenses();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to load expenses',
    );
  }
}

export async function getExpensesByMonth(month: string): Promise<Expense[]> {
  try {
    const service = getExpenseService();
    return await service.getExpensesByMonth(month);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to load expenses',
    );
  }
}

export async function createExpense(data: {
  title: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}): Promise<Expense> {
  try {
    const service = getExpenseService();
    return await service.createExpense(data);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create expense',
    );
  }
}

export async function updateExpense(
  id: string,
  data: {
    title?: string;
    description?: string;
    amount?: number;
    category?: string;
    date?: Date;
  },
): Promise<Expense> {
  try {
    const service = getExpenseService();
    return await service.updateExpense(id, data);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to update expense',
    );
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    const service = getExpenseService();
    await service.deleteExpense(id);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to delete expense',
    );
  }
}

export async function getExpenseTotalByMonth(month: string): Promise<number> {
  try {
    const service = getExpenseService();
    return await service.getTotalByMonth(month);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get expense total',
    );
  }
}

export async function getExpensesPaginated(
  page: number,
  pageSize: number,
  year?: number,
  month?: number,
): Promise<{
  expenses: Expense[];
  total: number;
  totalPages: number;
  totalAmount: number;
}> {
  try {
    const service = getExpenseService();
    const result = await service.getAllPaginated(page, pageSize, year, month);
    return {
      ...result,
      totalPages: Math.ceil(result.total / pageSize),
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to load expenses',
    );
  }
}
