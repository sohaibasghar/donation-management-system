'use server';

import { PaymentService } from '@/services/payment.service';
import { ExpenseService } from '@/services/expense.service';
import { PaymentRepository } from '@/repositories/payment.repository';
import { DonorRepository } from '@/repositories/donor.repository';
import { ExpenseRepository } from '@/repositories/expense.repository';
import { MonthlyStats, LastPaymentByMonth } from '@/types/domain';
import { format, subMonths } from 'date-fns';
import { DATE_FORMAT } from '@/lib/constants';

const getPaymentService = (): PaymentService => {
  return new PaymentService(new PaymentRepository(), new DonorRepository());
};

const getExpenseService = (): ExpenseService => {
  return new ExpenseService(new ExpenseRepository());
};

export async function getMonthlyStats(month: string): Promise<MonthlyStats> {
  try {
    const paymentService = getPaymentService();
    const expenseService = getExpenseService();
    const paymentRepository = new PaymentRepository();
    const donorRepository = new DonorRepository();

    const [paymentStats, totalExpenses] = await Promise.all([
      paymentService.getMonthlyStats(month),
      expenseService.getTotalByMonth(month),
    ]);

    // Count unpaid donors: those with unpaid payments + active donors without payment records
    const unpaidPayments = await paymentRepository.findByMonth(month);
    const paidDonorIds = new Set(
      unpaidPayments.filter((p) => p.status === 'PAID').map((p) => p.donorId),
    );
    const allActiveDonors = await donorRepository.findActive();
    const unpaidDonorsCount = allActiveDonors.filter(
      (donor) => !paidDonorIds.has(donor.id),
    ).length;

    const netBalance = paymentStats.totalDonations - totalExpenses;

    return {
      totalDonations: paymentStats.totalDonations,
      totalExpenses,
      netBalance,
      paidCount: paymentStats.paidCount,
      unpaidDonorsCount,
      month,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get monthly stats',
    );
  }
}

export async function getLastPaymentsByMonth(
  months: number = 6,
): Promise<LastPaymentByMonth[]> {
  try {
    const paymentRepository = new PaymentRepository();
    const currentDate = new Date();
    const results: LastPaymentByMonth[] = [];

    for (let i = 0; i < months; i++) {
      const monthDate = subMonths(currentDate, i);
      const month = format(monthDate, DATE_FORMAT);

      const lastPayment =
        await paymentRepository.findLastPaidPaymentByMonth(month);

      results.push({
        month,
        lastPaymentDate: lastPayment?.paidAt || null,
        amount: lastPayment?.amount || 0,
      });
    }

    return results;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to get last payments by month',
    );
  }
}

export async function getAllTimeStats(): Promise<{
  totalDonations: number;
  totalExpenses: number;
  availableBalance: number;
}> {
  try {
    const paymentService = getPaymentService();
    const expenseService = getExpenseService();

    const [totalDonations, totalExpenses] = await Promise.all([
      paymentService.getAllTimeTotalDonations(),
      expenseService.getTotalAll(),
    ]);

    const availableBalance = totalDonations - totalExpenses;

    return {
      totalDonations,
      totalExpenses,
      availableBalance,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get all-time stats',
    );
  }
}
