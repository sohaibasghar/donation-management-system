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
import { YearMonthFilter } from '@/components/shared/year-month-filter';
import { ExpenseForm } from './expense-form';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useExpensesPaginated, useDeleteExpense } from '@/hooks/use-expenses';
import { useAuth } from '@/lib/providers/auth-provider';
import { getCurrentMonth } from '@/actions/payment.actions';

interface ExpenseListProps {
  initialMonth: string;
  initialExpenses: Expense[];
}

const PAGE_SIZE = 10;

export function ExpenseList({
  initialMonth,
  initialExpenses,
}: ExpenseListProps) {
  const [page, setPage] = useState(1);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useExpensesPaginated(
    page,
    PAGE_SIZE,
    year,
    month,
  );

  const expenses = data?.expenses || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const totalAmount = data?.totalAmount || 0;

  const deleteMutation = useDeleteExpense();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      // Reset to first page if current page becomes empty
      if (expenses.length === 1 && page > 1) {
        setPage(page - 1);
      }
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

  const handleAdd = async () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleYearChange = (newYear: number | undefined) => {
    setYear(newYear);
    setPage(1); // Reset to first page when filter changes
    if (newYear === undefined) {
      setMonth(undefined);
    }
  };

  const handleMonthChange = (newMonth: number | undefined) => {
    setMonth(newMonth);
    setPage(1); // Reset to first page when filter changes
  };

  const handleClearFilter = () => {
    setYear(undefined);
    setMonth(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1.5">
            Expenses
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            Track and manage all expenses
          </p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={handleAdd}
            className="w-full sm:w-auto gradient-primary text-white hover:shadow-md transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <YearMonthFilter
          year={year}
          month={month}
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
          onClear={handleClearFilter}
        />
        {total > 0 && (
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * PAGE_SIZE + 1} -{' '}
            {Math.min(page * PAGE_SIZE, total)} of {total} expenses
          </div>
        )}
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-gray-200/60 bg-white shadow-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 via-gray-50/80 to-gray-100/50 border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700 h-12">
                Title
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Description
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Category
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Date
              </TableHead>
              {isAuthenticated && (
                <TableHead className="text-right font-semibold text-gray-700">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={isAuthenticated ? 6 : 5}
                  className="text-center py-8"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading expenses...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={isAuthenticated ? 6 : 5}
                  className="text-center py-8 text-red-600"
                >
                  Failed to load expenses
                </TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAuthenticated ? 6 : 5}
                  className="text-center py-12 text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-medium">No expenses found</p>
                    <p className="text-sm text-gray-400">
                      {year || month
                        ? 'Try adjusting your filters'
                        : 'Add your first expense to get started'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow
                  key={expense.id}
                  className="hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-blue-50/20 transition-all duration-300 border-b border-gray-100/80 group"
                >
                  <TableCell className="font-medium py-4">
                    <span className="text-gray-900 font-semibold">
                      {expense.title}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-gray-700 text-sm line-clamp-2">
                      {expense.description || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-purple-200 text-purple-700 bg-purple-50"
                    >
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </TableCell>
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
              <p className="font-medium text-gray-500">No expenses found</p>
              <p className="text-sm text-gray-400">
                {year || month
                  ? 'Try adjusting your filters'
                  : 'Add your first expense to get started'}
              </p>
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
                  <p className="text-sm text-gray-600 mt-1">
                    {expense.description || '—'}
                  </p>
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

      {/* Total Amount */}
      {totalAmount > 0 && (
        <div className="flex justify-end">
          <div className="px-6 py-4 rounded-xl bg-gradient-to-br from-purple-50 via-purple-50/80 to-purple-100/50 border border-purple-200/60 shadow-lg">
            <div className="text-sm font-medium text-gray-600 mb-1.5">
              {year || month ? 'Filtered Total' : 'Total Amount'}
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-800 bg-clip-text text-transparent">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="h-9"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  disabled={isLoading}
                  className="h-9 w-9"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="h-9"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <ExpenseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        expense={editingExpense}
        month={
          month && year
            ? `${year}-${String(month).padStart(2, '0')}`
            : initialMonth
        }
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
