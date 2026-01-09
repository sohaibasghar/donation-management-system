import { Donor, MonthlyPayment, Expense, PaymentStatus } from '@prisma/client';

export type { Donor, MonthlyPayment, Expense, PaymentStatus };

export interface DonorWithLastPayment extends Donor {
  lastPayment?: {
    month: string;
    paidAt: Date | null;
  };
}

export interface MonthlyStats {
  totalDonations: number;
  totalExpenses: number;
  netBalance: number;
  paidCount: number;
  unpaidDonorsCount: number;
  month: string;
}

export interface LastPaymentByMonth {
  month: string;
  lastPaymentDate: Date | null;
  amount: number;
}

export interface AllTimeStats {
  totalDonations: number;
  totalExpenses: number;
  availableBalance: number;
}
