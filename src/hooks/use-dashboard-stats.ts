import { useQuery } from '@tanstack/react-query';
import {
  getMonthlyStats,
  getAllTimeStats,
  getAllMonthlyCollections,
} from '@/actions/stats.actions';
import { MonthlyStats, AllTimeStats, MonthlyCollection } from '@/types/domain';

export function useDashboardStats(month: string) {
  const statsQuery = useQuery<MonthlyStats>({
    queryKey: ['dashboard-stats', month],
    queryFn: () => getMonthlyStats(month),
  });

  const allTimeStatsQuery = useQuery<AllTimeStats>({
    queryKey: ['all-time-stats'],
    queryFn: () => getAllTimeStats(),
  });

  const monthlyCollectionsQuery = useQuery<MonthlyCollection[]>({
    queryKey: ['monthly-collections-all'],
    queryFn: () => getAllMonthlyCollections(),
  });

  return {
    stats: statsQuery.data,
    allTimeStats: allTimeStatsQuery.data,
    monthlyCollections: monthlyCollectionsQuery.data || [],
    isLoading:
      statsQuery.isLoading ||
      allTimeStatsQuery.isLoading ||
      monthlyCollectionsQuery.isLoading,
    isError:
      statsQuery.isError ||
      allTimeStatsQuery.isError ||
      monthlyCollectionsQuery.isError,
    error:
      statsQuery.error ||
      allTimeStatsQuery.error ||
      monthlyCollectionsQuery.error,
    refetch: () => {
      statsQuery.refetch();
      allTimeStatsQuery.refetch();
      monthlyCollectionsQuery.refetch();
    },
  };
}
