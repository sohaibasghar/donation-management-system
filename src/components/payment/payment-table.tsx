'use client';

import { useState, useTransition } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthSelector } from '@/components/shared/month-selector';
import { formatCurrency } from '@/lib/utils';
import { Save, X, Edit, Loader2, Users } from 'lucide-react';
import {
  usePayments,
  useCreatePayment,
  useUpdatePayment,
} from '@/hooks/use-payments';
import { useAuth } from '@/lib/providers/auth-provider';

import { PaymentData } from '@/hooks/use-payments';

interface PaymentTableProps {
  initialMonth: string;
  initialData: PaymentData[];
}

export function PaymentTable({ initialMonth, initialData }: PaymentTableProps) {
  const [month, setMonth] = useState(initialMonth);
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  const [editing, setEditing] = useState<{
    donorId: string;
    amount: string;
    status: 'PAID' | 'UNPAID';
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const { isAuthenticated } = useAuth();

  const {
    data = initialData,
    isLoading,
    error,
  } = usePayments(month, initialData, initialMonth);
  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();

  const startEditing = (
    donorId: string,
    currentPayment: {
      id: string;
      donorId: string;
      month: string;
      amount: number;
      status: 'PAID' | 'UNPAID';
      paidAt: string | null;
    } | null,
  ) => {
    const donor = data?.find((d) => d.donor.id === donorId)?.donor;
    if (!donor) return;

    // Ensure we only use plain values
    const paymentAmount = currentPayment?.amount;
    const paymentStatus = currentPayment?.status;

    setEditing({
      donorId,
      amount:
        paymentAmount !== undefined
          ? paymentAmount.toString()
          : donor.monthlyAmount.toString(),
      status: paymentStatus || 'UNPAID',
    });
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing || !data) return;

    const amount = parseFloat(editing.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Amount must be a positive number');
      return;
    }

    try {
      const currentItem = data.find((d) => d.donor.id === editing.donorId);
      const currentPayment = currentItem?.payment;

      if (currentPayment) {
        await updateMutation.mutateAsync({
          id: currentPayment.id,
          data: {
            amount: Math.round(amount),
            status: editing.status,
          },
          month,
        });
      } else {
        await createMutation.mutateAsync({
          donorId: editing.donorId,
          month,
          amount: Math.round(amount),
          status: editing.status,
        });
      }

      // Use startTransition to defer state update until after render
      startTransition(() => {
        setEditing(null);
      });
    } catch (error) {
      console.error('Error saving payment:', error);
      alert(error instanceof Error ? error.message : 'Failed to save payment');
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          {error instanceof Error ? error.message : 'Failed to load payments'}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Filter donors by payment status
  const paidDonors = data.filter(
    (item) => item.payment && item.payment.status === 'PAID',
  );
  const unpaidDonors = data.filter(
    (item) => !item.payment || item.payment.status === 'UNPAID',
  );

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const renderTable = (donors: typeof data, showAmount: boolean) => {
    // For unpaid tab: show amount only if authenticated
    // For paid tab: always show amount
    const shouldShowAmount = showAmount || (isAuthenticated && !showAmount);
    const colSpan = isAuthenticated
      ? shouldShowAmount
        ? 4
        : 3
      : shouldShowAmount
        ? 3
        : 2;

    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={colSpan} className="text-center py-8">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading payments...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (donors.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={colSpan}
            className="text-center py-12 text-gray-500"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <p className="font-medium">No donors found for this month</p>
              <p className="text-sm text-gray-400">
                Try selecting a different month
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return donors.map((item) => {
      const isEditing = editing?.donorId === item.donor.id;
      const payment = item.payment;

      return (
        <TableRow
          key={item.donor.id}
          className="hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-blue-50/20 transition-all duration-300 border-b border-gray-100/80 group"
        >
          <TableCell className="font-medium py-4">
            <div className="flex flex-col">
              <span className="text-gray-900 font-semibold">
                {item.donor.name}
              </span>
              {item.donor.contact && (
                <span className="text-xs text-gray-500 mt-1">
                  {item.donor.contact}
                </span>
              )}
            </div>
          </TableCell>
          {shouldShowAmount && (
            <TableCell>
              {isEditing ? (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editing.amount}
                  onChange={(e) =>
                    setEditing({ ...editing, amount: e.target.value })
                  }
                  className="w-32 h-9"
                  disabled={isMutating}
                />
              ) : (
                <span className="text-gray-900 font-semibold text-lg">
                  {payment ? (
                    formatCurrency(payment.amount)
                  ) : (
                    <span className="text-gray-400 italic font-normal">
                      Not set
                    </span>
                  )}
                </span>
              )}
            </TableCell>
          )}
          <TableCell>
            {isEditing ? (
              <Select
                value={editing.status}
                onValueChange={(value) =>
                  setEditing({
                    ...editing,
                    status: value as 'PAID' | 'UNPAID',
                  })
                }
                disabled={isMutating}
              >
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge
                variant={payment?.status === 'PAID' ? 'default' : 'destructive'}
                className={`font-medium ${
                  payment?.status === 'PAID'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                    : 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'
                }`}
              >
                {payment?.status || 'UNPAID'}
              </Badge>
            )}
          </TableCell>
          {isAuthenticated && (
            <TableCell className="text-right">
              {isEditing ? (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    disabled={isMutating}
                    className="h-8 gradient-primary text-white hover:shadow-md transition-shadow"
                  >
                    {isMutating ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3 mr-1" />
                    )}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                    disabled={isMutating}
                    className="h-8 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEditing(item.donor.id, payment)}
                  disabled={isMutating}
                  className="h-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </TableCell>
          )}
        </TableRow>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <MonthSelector value={month} onChange={setMonth} />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'unpaid' | 'paid')}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100/60 p-1.5 rounded-xl overflow-x-auto shadow-inner h-full">
          <TabsTrigger
            value="unpaid"
            className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-orange-600 rounded-lg transition-all duration-300 font-semibold hover:text-orange-600"
          >
            <span>Unpaid</span>
            <Badge
              variant="secondary"
              className="ml-2 bg-orange-100 text-orange-700 border-orange-200 shadow-sm"
            >
              {unpaidDonors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="paid"
            className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 rounded-lg transition-all duration-300 font-semibold hover:text-emerald-600"
          >
            <span>Paid</span>
            <Badge
              variant="secondary"
              className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm"
            >
              {paidDonors.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unpaid" className="space-y-4 mt-6">
          <div className="rounded-xl border border-gray-200/60 bg-white shadow-lg overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 via-gray-50/80 to-gray-100/50 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700 h-12">
                    Donor
                  </TableHead>
                  {isAuthenticated && (
                    <TableHead className="font-semibold text-gray-700">
                      Amount Paid
                    </TableHead>
                  )}
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                  {isAuthenticated && (
                    <TableHead className="text-right font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>{renderTable(unpaidDonors, false)}</TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="paid" className="space-y-4 mt-6">
          <div className="rounded-xl border border-gray-200/60 bg-white shadow-lg overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 via-gray-50/80 to-gray-100/50 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700 h-12">
                    Donor
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Amount Paid
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                  {isAuthenticated && (
                    <TableHead className="text-right font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>{renderTable(paidDonors, true)}</TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
