import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExpenses,
  getExpensesByMonth,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesPaginated,
} from '@/actions/expense.actions';
import { Expense } from '@/types/domain';

export function useExpenses(initialData?: Expense[]) {
  return useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: () => getExpenses(),
    initialData,
    staleTime: 0,
  });
}

export function useExpensesByMonth(month: string, initialData?: Expense[]) {
  return useQuery<Expense[]>({
    queryKey: ['expenses', month],
    queryFn: () => getExpensesByMonth(month),
    initialData,
    staleTime: 0,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
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
      queryClient.invalidateQueries({ queryKey: ['all-time-stats'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-paginated'] });
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
        description?: string;
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
      queryClient.invalidateQueries({ queryKey: ['all-time-stats'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-paginated'] });
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
      queryClient.invalidateQueries({ queryKey: ['expenses-paginated'] });
    },
  });
}

export function useExpensesPaginated(
  page: number,
  pageSize: number,
  year?: number,
  month?: number,
) {
  return useQuery<{
    expenses: Expense[];
    total: number;
    totalPages: number;
    totalAmount: number;
  }>({
    queryKey: ['expenses-paginated', page, pageSize, year, month],
    queryFn: () => getExpensesPaginated(page, pageSize, year, month),
    staleTime: 0,
  });
}
