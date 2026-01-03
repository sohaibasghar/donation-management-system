'use client';

import { useState } from 'react';
import { Expense } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonthSelector } from '@/components/shared/month-selector';
import { ExpenseForm } from './expense-form';
import { getExpenseTotalByMonth } from '@/actions/expense.actions';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit, Trash2, Loader2, Receipt } from 'lucide-react';
import { useExpensesByMonth, useDeleteExpense } from '@/hooks/use-expenses';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/providers/auth-provider';

interface ExpenseListProps {
  initialMonth: string;
  initialExpenses: Expense[];
}

export function ExpenseList({
  initialMonth,
  initialExpenses,
}: ExpenseListProps) {
  const [month, setMonth] = useState(initialMonth);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const { data: expenses = initialExpenses, isLoading } = useExpensesByMonth(
    month,
    month === initialMonth ? initialExpenses : undefined,
  );
  const deleteMutation = useDeleteExpense();

  const { data: total = 0 } = useQuery({
    queryKey: ['expense-total', month],
    queryFn: () => getExpenseTotalByMonth(month),
    enabled: !!month,
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to delete expense',
      );
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1.5">Expenses</h2>
          <p className="text-sm text-gray-600 font-medium">Track and manage expenses</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <MonthSelector value={month} onChange={setMonth} />
          {isAuthenticated && (
            <Button onClick={handleAdd} className="w-full sm:w-auto gradient-primary text-white hover:shadow-md transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-gray-200/60 bg-white shadow-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 via-gray-50/80 to-gray-100/50 border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700 h-12">Title</TableHead>
              <TableHead className="font-semibold text-gray-700">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">Amount</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              {isAuthenticated && (
                <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={isAuthenticated ? 5 : 4}
                  className="text-center py-8"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading expenses...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAuthenticated ? 5 : 4}
                  className="text-center py-12 text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-medium">No expenses found for this month</p>
                    <p className="text-sm text-gray-400">Try selecting a different month</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id} className="hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-blue-50/20 transition-all duration-300 border-b border-gray-100/80 group">
                  <TableCell className="font-medium py-4">
                    <span className="text-gray-900 font-semibold">{expense.title}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  {isAuthenticated && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                          className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                          disabled={deleteMutation.isPending}
                          className="hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading expenses...</span>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-500">No expenses found for this month</p>
              <p className="text-sm text-gray-400">Try selecting a different month</p>
            </div>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="rounded-xl border border-gray-200/60 bg-white shadow-md hover:shadow-xl transition-all duration-300 p-5 space-y-4 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {expense.title}
                  </h3>
                  <Badge variant="outline" className="mt-2">
                    {expense.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Date: {new Date(expense.date).toLocaleDateString()}
              </div>
              {isAuthenticated && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(expense)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(expense.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <div className="px-6 py-4 rounded-xl bg-gradient-to-br from-purple-50 via-purple-50/80 to-purple-100/50 border border-purple-200/60 shadow-lg">
          <div className="text-sm font-medium text-gray-600 mb-1.5">Total Expenses</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-800 bg-clip-text text-transparent">
            {formatCurrency(total)}
          </div>
        </div>
      </div>

      <ExpenseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        expense={editingExpense}
        month={month}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
