import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExpenses,
  getExpensesByMonth,
  createExpense,
  updateExpense,
  deleteExpense,
} from '@/actions/expense.actions';
import { Expense } from '@/types/domain';

export function useExpenses(initialData?: Expense[]) {
  return useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: () => getExpenses(),
    initialData,
    staleTime: 60 * 1000,
  });
}

export function useExpensesByMonth(month: string, initialData?: Expense[]) {
  return useQuery<Expense[]>({
    queryKey: ['expenses', month],
    queryFn: () => getExpensesByMonth(month),
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      amount: number;
      category: string;
      date: Date;
    }) => {
      return await createExpense(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.date.toISOString().slice(0, 7)],
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        amount?: number;
        category?: string;
        date?: Date;
      };
    }) => {
      return await updateExpense(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteExpense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

