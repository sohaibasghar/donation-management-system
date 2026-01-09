'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthSelector } from '@/components/shared/month-selector';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DISPLAY_DATE_FORMAT } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  DollarSign,
  Receipt,
  Wallet,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react';

import { useDashboardStats } from '@/hooks/use-dashboard-stats';

interface DashboardStatsProps {
  initialMonth: string;
}

export function DashboardStats({ initialMonth }: DashboardStatsProps) {
  const [month, setMonth] = useState(initialMonth);
  const [currentTime, setCurrentTime] = useState<string>('');
  const { stats, allTimeStats, isLoading } = useDashboardStats(month);

  useEffect(() => {
    // Only set time on client to avoid hydration mismatch
    setCurrentTime(format(new Date(), 'MMM dd, yyyy HH:mm'));
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  const monthDate = new Date(`${stats.month}-01`);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="mt-3 space-y-1">
            <p className="text-gray-700 font-medium">
              {format(monthStart, DISPLAY_DATE_FORMAT)}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100/50">
                <Calendar className="h-3.5 w-3.5" />
                {format(monthStart, 'MMM dd')} -{' '}
                {format(monthEnd, 'MMM dd, yyyy')}
              </span>
              {currentTime && (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100/50">
                  <Clock className="h-3.5 w-3.5" />
                  Updated: {currentTime}
                </span>
              )}
            </div>
          </div>
        </div>
        <MonthSelector value={month} onChange={setMonth} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-blue-50 via-blue-50/80 to-blue-100/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Total Collected Amount
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              {formatCurrency(stats.totalDonations)}
            </div>
            <p className="text-xs text-gray-600 font-medium">
              {stats.paidCount} paid payments
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-emerald-100/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Paid Members
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center shadow-md shadow-emerald-500/10 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-2">
              {stats.paidCount}
            </div>
            <p className="text-xs text-gray-600 font-medium">
              Donors with paid status
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-orange-50 via-orange-50/80 to-orange-100/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Pending Paid Members
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
              {stats.unpaidDonorsCount}
            </div>
            <p className="text-xs text-gray-600 font-medium">
              Donors with unpaid status
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-purple-50 via-purple-50/80 to-purple-100/50 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Total Expenses (All Time)
            </CardTitle>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center shadow-md shadow-purple-500/10 group-hover:scale-110 transition-transform duration-300">
              <Receipt className="h-6 w-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              {formatCurrency(allTimeStats?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-gray-600 font-medium">
              {formatCurrency(stats.totalExpenses)} this month
            </p>
          </CardContent>
        </Card>

        <Card
          className={`lg:col-span-2 card-hover border-0 shadow-lg bg-gradient-to-br overflow-hidden relative group ${(allTimeStats?.availableBalance || 0) >= 0 ? 'from-emerald-50 via-emerald-50/80 to-emerald-100/50' : 'from-red-50 via-red-50/80 to-red-100/50'}`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${(allTimeStats?.availableBalance || 0) >= 0 ? 'from-emerald-500/5' : 'from-red-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          ></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Available Balance (All Time)
            </CardTitle>
            <div
              className={`h-12 w-12 rounded-xl ${(allTimeStats?.availableBalance || 0) >= 0 ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-md shadow-emerald-500/10' : 'bg-gradient-to-br from-red-500/20 to-red-600/10 shadow-md shadow-red-500/10'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <Wallet
                className={`h-6 w-6 ${(allTimeStats?.availableBalance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
              />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className={`text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${(allTimeStats?.availableBalance || 0) >= 0 ? 'from-emerald-600 to-emerald-700' : 'from-red-600 to-red-700'}`}
            >
              {formatCurrency(allTimeStats?.availableBalance || 0)}
            </div>
            <p className="text-xs text-gray-600 font-medium">
              {formatCurrency(stats.netBalance)} this month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
