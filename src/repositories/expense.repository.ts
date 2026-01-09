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

  async sumAll(): Promise<number> {
    const result = await prisma.expense.aggregate({
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async findAllPaginated(
    page: number,
    pageSize: number,
    year?: number,
    month?: number,
  ): Promise<{ expenses: Expense[]; total: number; totalAmount: number }> {
    const where: Prisma.ExpenseWhereInput = {};

    if (year !== undefined && month !== undefined) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (year !== undefined) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [expenses, total, sumResult] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.expense.count({ where }),
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      expenses,
      total,
      totalAmount: sumResult._sum.amount || 0,
    };
  }
}
