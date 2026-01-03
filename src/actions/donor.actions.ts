'use server';

import { DonorService } from '@/services/donor.service';
import { DonorRepository } from '@/repositories/donor.repository';
import { PaymentRepository } from '@/repositories/payment.repository';
import { Donor, DonorWithLastPayment } from '@/types/domain';

const getDonorService = (): DonorService => {
  return new DonorService(new DonorRepository(), new PaymentRepository());
};

export async function getDonors(): Promise<Donor[]> {
  try {
    const service = getDonorService();
    return await service.getAllDonors();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to load donors',
    );
  }
}

export async function getDonorsWithLastPayment(): Promise<
  DonorWithLastPayment[]
> {
  try {
    const service = getDonorService();
    return await service.getDonorsWithLastPayment();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to load donors',
    );
  }
}

export async function createDonor(data: {
  name: string;
  contact?: string;
  monthlyAmount: number;
}): Promise<Donor> {
  try {
    const service = getDonorService();
    return await service.createDonor(data);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create donor',
    );
  }
}

export async function createBulkDonors(
  donors: Array<{
    name: string;
    contact?: string;
    monthlyAmount: number;
  }>,
): Promise<{ count: number }> {
  try {
    const service = getDonorService();
    return await service.createBulkDonors(donors);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create bulk donors',
    );
  }
}

export async function updateDonor(
  id: string,
  data: {
    name?: string;
    contact?: string;
    monthlyAmount?: number;
    isActive?: boolean;
  },
): Promise<Donor> {
  try {
    const service = getDonorService();
    return await service.updateDonor(id, data);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to update donor',
    );
  }
}

export async function deleteDonor(id: string): Promise<void> {
  try {
    const service = getDonorService();
    await service.deleteDonor(id);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to delete donor',
    );
  }
}
