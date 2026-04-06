import { MainLayout } from '@/components/layout/main-layout';
import {
  getCurrentMonth,
  getDonorsWithPaymentStatus,
} from '@/actions/payment.actions';
import { PaymentTable } from '@/components/payment/payment-table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PaymentsPageProps {
  searchParams?: Promise<{
    status?: string;
  }>;
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const currentMonth = await getCurrentMonth();
  const initialData = await getDonorsWithPaymentStatus(currentMonth);
  const params = await searchParams;
  const status = params?.status;
  const initialTab =
    status === 'paid' || status === 'unpaid' ? status : 'unpaid';

  return (
    <MainLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Monthly Payments
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and track payment status for all donors
          </p>
        </div>
        <PaymentTable
          initialMonth={currentMonth}
          initialData={initialData}
          initialTab={initialTab}
        />
      </div>
    </MainLayout>
  );
}
