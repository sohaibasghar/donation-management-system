import { MonthlyPayment, Prisma, PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class PaymentRepository {
  async create(
    data: Prisma.MonthlyPaymentCreateInput,
  ): Promise<MonthlyPayment> {
    return prisma.monthlyPayment.create({ data });
  }

  async findById(id: string): Promise<MonthlyPayment | null> {
    return prisma.monthlyPayment.findUnique({
      where: { id },
      include: { donor: true },
    });
  }

  async findByMonth(month: string): Promise<MonthlyPayment[]> {
    return prisma.monthlyPayment.findMany({
      where: { month },
      include: { donor: true },
      orderBy: { amount: 'desc' },
    });
  }

  async findByDonorId(donorId: string): Promise<MonthlyPayment[]> {
    return prisma.monthlyPayment.findMany({
      where: { donorId },
      orderBy: { month: 'desc' },
    });
  }

  async findByDonorIdAndMonth(
    donorId: string,
    month: string,
  ): Promise<MonthlyPayment | null> {
    return prisma.monthlyPayment.findUnique({
      where: {
        donorId_month: {
          donorId,
          month,
        },
      },
    });
  }

  async findLastPaidByDonorId(donorId: string): Promise<MonthlyPayment | null> {
    return prisma.monthlyPayment.findFirst({
      where: {
        donorId,
        status: 'PAID',
      },
      orderBy: { month: 'desc' },
    });
  }

  async update(
    id: string,
    data: Prisma.MonthlyPaymentUpdateInput,
  ): Promise<MonthlyPayment> {
    return prisma.monthlyPayment.update({
      where: { id },
      data,
    });
  }

  async markAsPaid(id: string, paidAt?: Date): Promise<MonthlyPayment> {
    return prisma.monthlyPayment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: paidAt || new Date(),
      },
    });
  }

  async createMany(
    data: Prisma.MonthlyPaymentCreateManyInput[],
  ): Promise<{ count: number }> {
    return prisma.monthlyPayment.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async countByMonthAndStatus(
    month: string,
    status: PaymentStatus,
  ): Promise<number> {
    return prisma.monthlyPayment.count({
      where: { month, status },
    });
  }

  async countByMonth(month: string): Promise<number> {
    return prisma.monthlyPayment.count({
      where: { month },
    });
  }

  async sumByMonth(month: string): Promise<number> {
    const result = await prisma.monthlyPayment.aggregate({
      where: { month, status: 'PAID' },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async sumUnpaidByMonth(month: string): Promise<number> {
    const result = await prisma.monthlyPayment.aggregate({
      where: { month, status: 'UNPAID' },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async findLastPaidPaymentByMonth(
    month: string,
  ): Promise<MonthlyPayment | null> {
    return prisma.monthlyPayment.findFirst({
      where: { month, status: 'PAID' },
      orderBy: { paidAt: 'desc' },
    });
  }

  async countUnpaidDonorsByMonth(month: string): Promise<number> {
    // Count unique donors who have unpaid payments
    const unpaidPayments = await prisma.monthlyPayment.findMany({
      where: { month, status: 'UNPAID' },
      select: { donorId: true },
      distinct: ['donorId'],
    });
    return unpaidPayments.length;
  }

  async getPaidDonorIdsByMonth(month: string): Promise<string[]> {
    const paidPayments = await prisma.monthlyPayment.findMany({
      where: { month, status: 'PAID' },
      select: { donorId: true },
      distinct: ['donorId'],
    });
    return paidPayments.map((p) => p.donorId);
  }

  async sumAllPaid(): Promise<number> {
    const result = await prisma.monthlyPayment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }
}
