import { MainLayout } from '@/components/layout/main-layout';
import { getCurrentMonth } from '@/actions/payment.actions';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';

export default async function DashboardPage() {
  const currentMonth = await getCurrentMonth();

  return (
    <MainLayout>
      <DashboardStats initialMonth={currentMonth} />
    </MainLayout>
  );
}
