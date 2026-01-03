import { Donor } from '@prisma/client';
import { DonorRepository } from '@/repositories/donor.repository';
import { PaymentRepository } from '@/repositories/payment.repository';
import { DonorWithLastPayment } from '@/types/domain';

export class DonorService {
  constructor(
    private donorRepository: DonorRepository,
    private paymentRepository: PaymentRepository,
  ) {}

  async getAllDonors(): Promise<Donor[]> {
    return this.donorRepository.findAll();
  }

  async getDonorsWithLastPayment(): Promise<DonorWithLastPayment[]> {
    const donors = await this.donorRepository.findAll();

    const donorsWithLastPayment = await Promise.all(
      donors.map(async (donor) => {
        const lastPayment = await this.paymentRepository.findLastPaidByDonorId(
          donor.id,
        );

        return {
          ...donor,
          lastPayment: lastPayment
            ? {
                month: lastPayment.month,
                paidAt: lastPayment.paidAt,
              }
            : undefined,
        };
      }),
    );

    return donorsWithLastPayment;
  }

  async createDonor(data: {
    name: string;
    contact?: string;
    monthlyAmount: number;
  }): Promise<Donor> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Donor name is required');
    }

    if (!data.monthlyAmount || data.monthlyAmount <= 0) {
      throw new Error('Monthly amount must be greater than 0');
    }

    return this.donorRepository.create({
      name: data.name.trim(),
      contact: data.contact?.trim() || null,
      monthlyAmount: data.monthlyAmount,
      isActive: true,
    });
  }

  async createBulkDonors(
    donors: Array<{
      name: string;
      contact?: string;
      monthlyAmount: number;
    }>,
  ): Promise<{ count: number }> {
    if (!donors || donors.length === 0) {
      throw new Error('At least one donor is required');
    }

    const validatedDonors = donors.map((donor, index) => {
      if (!donor.name || donor.name.trim().length === 0) {
        throw new Error(`Donor ${index + 1}: Name is required`);
      }

      if (!donor.monthlyAmount || donor.monthlyAmount <= 0) {
        throw new Error(
          `Donor ${index + 1}: Monthly amount must be greater than 0`,
        );
      }

      return {
        name: donor.name.trim(),
        contact: donor.contact?.trim() || null,
        monthlyAmount: donor.monthlyAmount,
        isActive: true,
      };
    });

    return this.donorRepository.createBulk(validatedDonors);
  }

  async updateDonor(
    id: string,
    data: {
      name?: string;
      contact?: string;
      monthlyAmount?: number;
      isActive?: boolean;
    },
  ): Promise<Donor> {
    if (!id) {
      throw new Error('Donor ID is required');
    }

    const updateData: {
      name?: string;
      contact?: string | null;
      monthlyAmount?: number;
      isActive?: boolean;
    } = {};

    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new Error('Donor name cannot be empty');
      }
      updateData.name = data.name.trim();
    }

    if (data.contact !== undefined) {
      updateData.contact = data.contact.trim() || null;
    }

    if (data.monthlyAmount !== undefined) {
      if (data.monthlyAmount <= 0) {
        throw new Error('Monthly amount must be greater than 0');
      }
      updateData.monthlyAmount = data.monthlyAmount;
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    return this.donorRepository.update(id, updateData);
  }

  async deleteDonor(id: string): Promise<void> {
    if (!id) {
      throw new Error('Donor ID is required');
    }

    await this.donorRepository.delete(id);
  }
}
