import { Donor, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class DonorRepository {
  async create(data: Prisma.DonorCreateInput): Promise<Donor> {
    return prisma.donor.create({ data });
  }

  async findById(id: string): Promise<Donor | null> {
    return prisma.donor.findUnique({ where: { id } });
  }

  async findAll(): Promise<Donor[]> {
    return prisma.donor.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findActive(): Promise<Donor[]> {
    return prisma.donor.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: Prisma.DonorUpdateInput): Promise<Donor> {
    return prisma.donor.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Donor> {
    return prisma.donor.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return prisma.donor.count();
  }

  async countActive(): Promise<number> {
    return prisma.donor.count({ where: { isActive: true } });
  }

  async countInactive(): Promise<number> {
    return prisma.donor.count({ where: { isActive: false } });
  }

  async createBulk(
    data: Prisma.DonorCreateInput[],
  ): Promise<{ count: number }> {
    return prisma.donor.createMany({ data });
  }

  async sumMonthlyAmountActive(): Promise<number> {
    const result = await prisma.donor.aggregate({
      where: { isActive: true },
      _sum: { monthlyAmount: true },
    });
    return result._sum.monthlyAmount || 0;
  }
}
