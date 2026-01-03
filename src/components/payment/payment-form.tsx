'use client';

import { useState, useEffect } from 'react';
import { Donor } from '@prisma/client';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPayment } from '@/actions/payment.actions';
import { getDonors } from '@/actions/donor.actions';
import { formatCurrency } from '@/lib/utils';

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  onSuccess: () => void;
}

export function PaymentForm({
  open,
  onOpenChange,
  month,
  onSuccess,
}: PaymentFormProps) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donorId, setDonorId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDonors, setIsLoadingDonors] = useState(false);

  useEffect(() => {
    if (open) {
      loadDonors();
      setDonorId('');
      setAmount('');
      setStatus('UNPAID');
      setError(null);
    }
  }, [open]);

  const loadDonors = async () => {
    setIsLoadingDonors(true);
    try {
      const data = await getDonors();
      setDonors(data.filter((d) => d.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donors');
    } finally {
      setIsLoadingDonors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      if (!donorId) {
        throw new Error('Please select a donor');
      }

      await createPayment({
        donorId,
        month,
        amount: paymentAmount,
        status,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDonor = donors.find((d) => d.id === donorId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
        <DialogHeader className="space-y-3 pb-2">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Add Payment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="donor"
                className="text-sm font-semibold text-gray-700"
              >
                Donor *
              </Label>
              <Select
                value={donorId}
                onValueChange={setDonorId}
                required
                disabled={isSubmitting || isLoadingDonors}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select donor" />
                </SelectTrigger>
                <SelectContent>
                  {donors.map((donor) => (
                    <SelectItem key={donor.id} value={donor.id}>
                      {donor.name} ({donor.monthlyAmount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDonor && (
                <p className="text-xs text-gray-600 font-medium mt-1.5">
                  Default monthly amount:{' '}
                  {formatCurrency(selectedDonor.monthlyAmount)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-sm font-semibold text-gray-700"
              >
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={
                  selectedDonor
                    ? selectedDonor.monthlyAmount.toString()
                    : 'Enter amount'
                }
                required
                disabled={isSubmitting}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-semibold text-gray-700"
              >
                Status *
              </Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as 'PAID' | 'UNPAID')}
                required
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              disabled={isSubmitting || isLoadingDonors}
              className="gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? 'Adding...' : 'Add Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
