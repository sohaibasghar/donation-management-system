import { useQuery } from '@tanstack/react-query';
import { getMonthlyStats, getLastPaymentsByMonth } from '@/actions/stats.actions';
import { MonthlyStats, LastPaymentByMonth } from '@/types/domain';

export function useDashboardStats(month: string) {
  const statsQuery = useQuery<MonthlyStats>({
    queryKey: ['dashboard-stats', month],
    queryFn: () => getMonthlyStats(month),
  });


  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    refetch: () => {
      statsQuery.refetch();
    },
  };
}

