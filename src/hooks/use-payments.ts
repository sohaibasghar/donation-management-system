import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDonorsWithPaymentStatus,
  createPayment,
  updatePayment,
} from '@/actions/payment.actions';

export interface PaymentData {
  donor: {
    id: string;
    name: string;
    contact: string | null;
    monthlyAmount: number;
  };
  payment: {
    id: string;
    donorId: string;
    month: string;
    amount: number;
    status: 'PAID' | 'UNPAID';
    paidAt: string | null; // Always a string (ISO format) from server
  } | null;
}

export function usePayments(
  month: string,
  initialData?: PaymentData[],
  initialMonth?: string,
) {
  return useQuery<PaymentData[]>({
    queryKey: ['payments', month],
    queryFn: async () => {
      try {
        const data = await getDonorsWithPaymentStatus(month);
        // Data is already serialized (dates as strings) from server action
        return data;
      } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }
    },
    initialData: initialMonth === month ? initialData : undefined,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      donorId: string;
      month: string;
      amount: number;
      status?: 'PAID' | 'UNPAID';
    }) => {
      return await createPayment(data);
    },
    onSuccess: (_, variables) => {
      // Use setTimeout to defer query invalidation until after current render cycle
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['payments', variables.month] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }, 0);
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      month,
    }: {
      id: string;
      data: { amount?: number; status?: 'PAID' | 'UNPAID' };
      month: string;
    }) => {
      return await updatePayment(id, data);
    },
    onSuccess: (_, variables) => {
      // Use setTimeout to defer query invalidation until after current render cycle
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['payments', variables.month] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }, 0);
    },
  });
}

