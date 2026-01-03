import { MainLayout } from '@/components/layout/main-layout';
import { getDonorsWithLastPayment } from '@/actions/donor.actions';
import { DonorList } from '@/components/donor/donor-list';

export const dynamic = 'force-dynamic';

export default async function DonorsPage() {
  const donors = await getDonorsWithLastPayment();

  return (
    <MainLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Donors
          </h1>
        </div>
        <DonorList donors={donors} />
      </div>
    </MainLayout>
  );
}
