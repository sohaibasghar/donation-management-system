'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@prisma/client';
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
import {
  useCreateExpense,
  useUpdateExpense,
} from '@/hooks/use-expenses';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  month: string;
  onSuccess: () => void;
}

export function ExpenseForm({
  open,
  onOpenChange,
  expense,
  month,
  onSuccess,
}: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDate(new Date(expense.date).toISOString().split('T')[0]);
    } else {
      setTitle('');
      setAmount('');
      setCategory('');
      const defaultDate = new Date(`${month}-01`).toISOString().split('T')[0];
      setDate(defaultDate);
    }
    setError(null);
  }, [expense, open, month]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const expenseAmount = parseFloat(amount);
      if (isNaN(expenseAmount) || expenseAmount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      if (!category) {
        throw new Error('Category is required');
      }

      const expenseDate = new Date(date);
      if (isNaN(expenseDate.getTime())) {
        throw new Error('Invalid date');
      }

      if (expense) {
        await updateMutation.mutateAsync({
          id: expense.id,
          data: {
            title,
            amount: expenseAmount,
            category,
            date: expenseDate,
          },
        });
      } else {
        await createMutation.mutateAsync({
          title,
          amount: expenseAmount,
          category,
          date: expenseDate,
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
            {expense ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                Category *
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
                required
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
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
              disabled={isSubmitting}
              className="gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? 'Saving...' : expense ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
