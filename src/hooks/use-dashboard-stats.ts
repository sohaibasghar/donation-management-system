import { useQuery } from '@tanstack/react-query';
import {
  getMonthlyStats,
  getLastPaymentsByMonth,
  getAllTimeStats,
} from '@/actions/stats.actions';
import { MonthlyStats, LastPaymentByMonth, AllTimeStats } from '@/types/domain';

export function useDashboardStats(month: string) {
  const statsQuery = useQuery<MonthlyStats>({
    queryKey: ['dashboard-stats', month],
    queryFn: () => getMonthlyStats(month),
  });

  const allTimeStatsQuery = useQuery<AllTimeStats>({
    queryKey: ['all-time-stats'],
    queryFn: () => getAllTimeStats(),
  });

  return {
    stats: statsQuery.data,
    allTimeStats: allTimeStatsQuery.data,
    isLoading: statsQuery.isLoading || allTimeStatsQuery.isLoading,
    isError: statsQuery.isError || allTimeStatsQuery.isError,
    error: statsQuery.error || allTimeStatsQuery.error,
    refetch: () => {
      statsQuery.refetch();
      allTimeStatsQuery.refetch();
    },
  };
}
