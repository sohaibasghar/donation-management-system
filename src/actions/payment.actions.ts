'use server';

import { PaymentService } from '@/services/payment.service';
import { PaymentRepository } from '@/repositories/payment.repository';
import { DonorRepository } from '@/repositories/donor.repository';
import { MonthlyPayment } from '@/types/domain';

const getPaymentService = (): PaymentService => {
  return new PaymentService(new PaymentRepository(), new DonorRepository());
};

export async function getPaymentsByMonth(
  month: string,
): Promise<MonthlyPayment[]> {
  try {
    const service = getPaymentService();
    return await service.getPaymentsByMonth(month);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to load payments',
    );
  }
}

export async function markPaymentAsPaid(id: string): Promise<MonthlyPayment> {
  try {
    const service = getPaymentService();
    return await service.markAsPaid(id);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to mark payment as paid',
    );
  }
}

export async function generateMonthlyPayments(
  month: string,
): Promise<{ count: number }> {
  try {
    const service = getPaymentService();
    return await service.generateMonthlyPayments(month);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to generate monthly payments',
    );
  }
}

export async function getPaymentStats(month: string): Promise<{
  totalDonations: number;
  paidCount: number;
  pendingCount: number;
}> {
  try {
    const service = getPaymentService();
    return await service.getMonthlyStats(month);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get payment stats',
    );
  }
}

export async function getCurrentMonth(): Promise<string> {
  const service = getPaymentService();
  return service.getCurrentMonth();
}

export async function createPayment(data: {
  donorId: string;
  month: string;
  amount: number;
  status?: 'PAID' | 'UNPAID';
}): Promise<{
  id: string;
  donorId: string;
  month: string;
  amount: number;
  status: 'PAID' | 'UNPAID';
  paidAt: string | null;
}> {
  try {
    const service = getPaymentService();
    const payment = await service.createPayment(data);
    
    // Serialize dates to strings
    return {
      id: payment.id,
      donorId: payment.donorId,
      month: payment.month,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString() : null,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create payment',
    );
  }
}

export async function updatePayment(
  id: string,
  data: {
    amount?: number;
    status?: 'PAID' | 'UNPAID';
  },
): Promise<{
  id: string;
  donorId: string;
  month: string;
  amount: number;
  status: 'PAID' | 'UNPAID';
  paidAt: string | null;
}> {
  try {
    const service = getPaymentService();
    const payment = await service.updatePayment(id, data);
    
    // Serialize dates to strings
    return {
      id: payment.id,
      donorId: payment.donorId,
      month: payment.month,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString() : null,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to update payment',
    );
  }
}

export async function getDonorsWithPaymentStatus(month: string): Promise<
  Array<{
    donor: { id: string; name: string; contact: string | null; monthlyAmount: number };
    payment: {
      id: string;
      donorId: string;
      month: string;
      amount: number;
      status: 'PAID' | 'UNPAID';
      paidAt: string | null;
    } | null;
  }>
> {
  try {
    const service = getPaymentService();
    const data = await service.getDonorsWithPaymentStatus(month);
    
    // Convert Date objects to ISO strings for serialization
    return data.map((item) => ({
      donor: item.donor,
      payment: item.payment
        ? {
            id: item.payment.id,
            donorId: item.payment.donorId,
            month: item.payment.month,
            amount: item.payment.amount,
            status: item.payment.status,
            paidAt: item.payment.paidAt
              ? new Date(item.payment.paidAt).toISOString()
              : null,
          }
        : null,
    }));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to load donors with payment status',
    );
  }
}
