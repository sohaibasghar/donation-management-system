import { MonthlyPayment, PaymentStatus } from '@prisma/client';
import { PaymentRepository } from '@/repositories/payment.repository';
import { DonorRepository } from '@/repositories/donor.repository';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/lib/constants';

export class PaymentService {
  constructor(
    private paymentRepository: PaymentRepository,
    private donorRepository: DonorRepository,
  ) {}

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

  async getPaymentsByMonth(month: string): Promise<MonthlyPayment[]> {
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error('Invalid month format. Expected YYYY-MM');
    }

    return this.paymentRepository.findByMonth(month);
  }

  async markAsPaid(id: string): Promise<MonthlyPayment> {
    if (!id) {
      throw new Error('Payment ID is required');
    }

    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'PAID') {
      throw new Error('Payment is already marked as paid');
    }

    return this.paymentRepository.markAsPaid(id);
  }

  async createPayment(data: {
    donorId: string;
    month: string;
    amount: number;
    status?: PaymentStatus;
  }): Promise<MonthlyPayment> {
    if (!data.donorId) {
      throw new Error('Donor ID is required');
    }

    if (!data.month || !this.isValidMonthFormat(data.month)) {
      throw new Error('Invalid month format. Expected YYYY-MM');
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const donor = await this.donorRepository.findById(data.donorId);
    if (!donor) {
      throw new Error('Donor not found');
    }

    const existingPayment = await this.paymentRepository.findByDonorIdAndMonth(
      data.donorId,
      data.month,
    );

    if (existingPayment) {
      throw new Error('Payment record already exists for this donor and month');
    }

    const createData: {
      donor: { connect: { id: string } };
      month: string;
      amount: number;
      status: PaymentStatus;
      paidAt?: Date | null;
    } = {
      donor: { connect: { id: data.donorId } },
      month: data.month,
      amount: data.amount,
      status: data.status || 'UNPAID',
    };

    if (data.status === 'PAID') {
      createData.paidAt = new Date();
    }

    return this.paymentRepository.create(createData);
  }

  async updatePayment(
    id: string,
    data: {
      amount?: number;
      status?: PaymentStatus;
    },
  ): Promise<MonthlyPayment> {
    if (!id) {
      throw new Error('Payment ID is required');
    }

    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const updateData: {
      amount?: number;
      status?: PaymentStatus;
      paidAt?: Date | null;
    } = {};

    if (data.amount !== undefined) {
      if (data.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      updateData.amount = data.amount;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'PAID' && payment.status === 'UNPAID') {
        updateData.paidAt = new Date();
      } else if (data.status === 'UNPAID' && payment.status === 'PAID') {
        updateData.paidAt = null;
      }
    }

    return this.paymentRepository.update(id, updateData);
  }

  async getDonorsWithPaymentStatus(month: string): Promise<
    Array<{
      donor: {
        id: string;
        name: string;
        contact: string | null;
        monthlyAmount: number;
      };
      payment: MonthlyPayment | null;
    }>
  > {
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error('Invalid month format. Expected YYYY-MM');
    }

    const activeDonors = await this.donorRepository.findActive();
    const payments = await this.paymentRepository.findByMonth(month);

    const paymentMap = new Map<string, MonthlyPayment>();
    payments.forEach((p) => {
      paymentMap.set(p.donorId, p);
    });

    return activeDonors.map((donor) => ({
      donor: {
        id: donor.id,
        name: donor.name,
        contact: donor.contact,
        monthlyAmount: donor.monthlyAmount,
      },
      payment: paymentMap.get(donor.id) || null,
    }));
  }

  async generateMonthlyPayments(month: string): Promise<{ count: number }> {
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error('Invalid month format. Expected YYYY-MM');
    }

    const activeDonors = await this.donorRepository.findActive();

    if (activeDonors.length === 0) {
      throw new Error('No active donors found');
    }

    const paymentData = activeDonors.map((donor) => ({
      donorId: donor.id,
      month,
      amount: donor.monthlyAmount,
      status: 'UNPAID' as PaymentStatus,
    }));

    const result = await this.paymentRepository.createMany(paymentData);

    return { count: result.count };
  }

  async getMonthlyStats(month: string): Promise<{
    totalDonations: number;
    paidCount: number;
    pendingCount: number;
  }> {
    if (!month || !this.isValidMonthFormat(month)) {
      throw new Error('Invalid month format. Expected YYYY-MM');
    }

    const [totalDonations, paidCount, pendingCount] = await Promise.all([
      this.paymentRepository.sumByMonth(month),
      this.paymentRepository.countByMonthAndStatus(month, 'PAID'),
      this.paymentRepository.countByMonthAndStatus(month, 'UNPAID'),
    ]);

    return {
      totalDonations,
      paidCount,
      pendingCount,
    };
  }

  getCurrentMonth(): string {
    return format(new Date(), DATE_FORMAT);
  }

  async getAllTimeTotalDonations(): Promise<number> {
    return this.paymentRepository.sumAllPaid();
  }
}
