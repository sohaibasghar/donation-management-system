import { Expense } from '@prisma/client';
import { ExpenseRepository } from '@/repositories/expense.repository';

export class ExpenseService {
  constructor(private expenseRepository: ExpenseRepository) {}

  private isValidMonthFormat(month: string): boolean {
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(month)) {
      return false;
    }

    const [year, monthNum] = month.split('-').map(Number);
    if (monthNum < 1 || monthNum > 12) {
      return false;
    }

    return true;
  }

  async getAllExpenses(): Promise<Expense[]> {
    return this.expenseRepository.findAll();
  }

  async getExpensesByMonth(month: string): Promise<Expense[]> {
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error('Invalid month format. Expected YYYY-MM');
    }

    return this.expenseRepository.findByMonth(month);
  }

  async createExpense(data: {
    title: string;
    amount: number;
    category: string;
    date: Date;
  }): Promise<Expense> {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Expense title is required');
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    if (!data.category || data.category.trim().length === 0) {
      throw new Error('Expense category is required');
    }

    if (!data.date || isNaN(data.date.getTime())) {
      throw new Error('Invalid date');
    }

    return this.expenseRepository.create({
      title: data.title.trim(),
      amount: data.amount,
      category: data.category.trim(),
      date: data.date,
    });
  }

  async updateExpense(
    id: string,
    data: {
      title?: string;
      amount?: number;
      category?: string;
      date?: Date;
    },
  ): Promise<Expense> {
    if (!id) {
      throw new Error('Expense ID is required');
    }

    const updateData: {
      title?: string;
      amount?: number;
      category?: string;
      date?: Date;
    } = {};

    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        throw new Error('Expense title cannot be empty');
      }
      updateData.title = data.title.trim();
    }

    if (data.amount !== undefined) {
      if (data.amount <= 0) {
        throw new Error('Expense amount must be greater than 0');
      }
      updateData.amount = data.amount;
    }

    if (data.category !== undefined) {
      if (data.category.trim().length === 0) {
        throw new Error('Expense category cannot be empty');
      }
      updateData.category = data.category.trim();
    }

    if (data.date !== undefined) {
      if (isNaN(data.date.getTime())) {
        throw new Error('Invalid date');
      }
      updateData.date = data.date;
    }

    return this.expenseRepository.update(id, updateData);
  }

  async deleteExpense(id: string): Promise<void> {
    if (!id) {
      throw new Error('Expense ID is required');
    }

    await this.expenseRepository.delete(id);
  }

  async getTotalByMonth(month: string): Promise<number> {
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error('Invalid month format. Expected YYYY-MM');
    }

    return this.expenseRepository.sumByMonth(month);
  }
}
