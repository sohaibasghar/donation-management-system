'use client';

import { useState, useEffect } from 'react';
import { DonorWithLastPayment } from '@/types/domain';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateDonor, useUpdateDonor } from '@/hooks/use-donors';

interface DonorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: DonorWithLastPayment | null;
  onSuccess: () => void;
}

export function DonorForm({
  open,
  onOpenChange,
  donor,
  onSuccess,
}: DonorFormProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateDonor();
  const updateMutation = useUpdateDonor();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (donor) {
      setName(donor.name);
      setContact(donor.contact || '');
      setMonthlyAmount(donor.monthlyAmount.toString());
      setIsActive(donor.isActive);
    } else {
      setName('');
      setContact('');
      setMonthlyAmount('');
      setIsActive(true);
    }
    setError(null);
  }, [donor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const amount = parseFloat(monthlyAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Monthly amount must be a positive number');
      }

      if (donor) {
        await updateMutation.mutateAsync({
          id: donor.id,
          data: {
            name,
            contact: contact || undefined,
            monthlyAmount: amount,
            isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name,
          contact: contact || undefined,
          monthlyAmount: amount,
        });
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
        <DialogHeader className="space-y-3 pb-2">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {donor ? 'Edit Donor' : 'Add Donor'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-semibold text-gray-700">
                Contact
              </Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={isSubmitting}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyAmount" className="text-sm font-semibold text-gray-700">
                Monthly Amount *
              </Label>
              <Input
                id="monthlyAmount"
                type="number"
                min="1"
                step="0.01"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {donor && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50/80 border border-red-200/60 p-4 text-sm font-medium text-red-800 shadow-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="hover:bg-gray-50 border-gray-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? 'Saving...' : donor ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
