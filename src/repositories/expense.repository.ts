import { Expense, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class ExpenseRepository {
  async create(data: Prisma.ExpenseCreateInput): Promise<Expense> {
    return prisma.expense.create({ data });
  }

  async findById(id: string): Promise<Expense | null> {
    return prisma.expense.findUnique({ where: { id } });
  }

  async findAll(): Promise<Expense[]> {
    return prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findByMonth(month: string): Promise<Expense[]> {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    return prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async update(id: string, data: Prisma.ExpenseUpdateInput): Promise<Expense> {
    return prisma.expense.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Expense> {
    return prisma.expense.delete({ where: { id } });
  }

  async countByMonth(month: string): Promise<number> {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    return prisma.expense.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async sumByMonth(month: string): Promise<number> {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    const result = await prisma.expense.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  }
}
