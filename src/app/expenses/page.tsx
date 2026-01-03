import { MainLayout } from '@/components/layout/main-layout';
import { getCurrentMonth } from '@/actions/payment.actions';
import {
  getExpensesByMonth,
  getExpenseTotalByMonth,
} from '@/actions/expense.actions';
import { ExpenseList } from '@/components/expense/expense-list';

export default async function ExpensesPage() {
  const currentMonth = await getCurrentMonth();
  const [expenses, total] = await Promise.all([
    getExpensesByMonth(currentMonth),
    getExpenseTotalByMonth(currentMonth),
  ]);

  return (
    <MainLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Expenses
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track and manage all expenses
          </p>
        </div>
        <ExpenseList initialMonth={currentMonth} initialExpenses={expenses} />
      </div>
    </MainLayout>
  );
}
