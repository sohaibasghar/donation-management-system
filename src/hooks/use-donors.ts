import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDonors,
  getDonorsWithLastPayment,
  createDonor,
  updateDonor,
  deleteDonor,
  createBulkDonors,
} from '@/actions/donor.actions';
import { Donor, DonorWithLastPayment } from '@/types/domain';

export function useDonors(initialData?: Donor[]) {
  return useQuery<Donor[]>({
    queryKey: ['donors'],
    queryFn: () => getDonors(),
    initialData,
    staleTime: 60 * 1000,
  });
}

export function useDonorsWithLastPayment(
  initialData?: DonorWithLastPayment[],
) {
  return useQuery<DonorWithLastPayment[]>({
    queryKey: ['donors-with-last-payment'],
    queryFn: () => getDonorsWithLastPayment(),
    initialData,
    staleTime: 60 * 1000,
  });
}

export function useCreateDonor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      contact?: string;
      monthlyAmount: number;
    }) => {
      return await createDonor(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['donors-with-last-payment'] });
    },
  });
}

export function useCreateBulkDonors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      donors: Array<{
        name: string;
        contact?: string;
        monthlyAmount: number;
      }>,
    ) => {
      return await createBulkDonors(donors);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['donors-with-last-payment'] });
    },
  });
}

export function useUpdateDonor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        contact?: string;
        monthlyAmount?: number;
        isActive?: boolean;
      };
    }) => {
      return await updateDonor(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['donors-with-last-payment'] });
    },
  });
}

export function useDeleteDonor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteDonor(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['donors-with-last-payment'] });
    },
  });
}

