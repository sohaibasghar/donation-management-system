'use client';

import { useState } from 'react';
import { DonorWithLastPayment } from '@/types/domain';
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
import { DonorForm } from './donor-form';
import { Plus, Edit, Trash2, Loader2, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { DISPLAY_DATE_FORMAT } from '@/lib/constants';
import { useDonorsWithLastPayment, useDeleteDonor } from '@/hooks/use-donors';
import { useAuth } from '@/lib/providers/auth-provider';

interface DonorListProps {
  donors: DonorWithLastPayment[];
}

export function DonorList({ donors: initialDonors }: DonorListProps) {
  const [editingDonor, setEditingDonor] = useState<DonorWithLastPayment | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const { data: donors = initialDonors, isLoading } =
    useDonorsWithLastPayment(initialDonors);
  const deleteMutation = useDeleteDonor();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donor?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete donor');
    }
  };

  const handleEdit = (donor: DonorWithLastPayment) => {
    setEditingDonor(donor);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingDonor(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingDonor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {isAuthenticated && (
          <Button
            onClick={handleAdd}
            className="w-full sm:w-auto gradient-primary text-white hover:shadow-md transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Donor
          </Button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-gray-200/60 bg-white shadow-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 via-gray-50/80 to-gray-100/50 border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700 h-14">
                Name
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
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={isAuthenticated ? 6 : 5}
                  className="text-center py-12"
                >
                  <div className="flex items-center justify-center gap-3 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-medium">Loading donors...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : donors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAuthenticated ? 3 : 2}
                  className="text-center py-16 text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700">
                      No donors found
                    </p>
                    <p className="text-sm text-gray-500">
                      Add your first donor to get started
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              donors.map((donor, index) => (
                <TableRow
                  key={donor.id}
                  className="hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-blue-50/20 transition-all duration-300 border-b border-gray-100/80 group"
                >
                  <TableCell className="font-medium py-5">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-normal text-sm min-w-[2rem]">
                        {String(index + 1).padStart(2, '0')}.
                      </span>
                      <span className="text-gray-900 font-semibold group-hover:text-blue-700 transition-colors">
                        {donor.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={donor.isActive ? 'default' : 'secondary'}
                      className={
                        donor.isActive
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 shadow-sm'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }
                    >
                      {donor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  {isAuthenticated && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(donor)}
                          className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(donor.id)}
                          disabled={deleteMutation.isPending}
                          className="h-9 w-9 hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:scale-110"
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
              <span>Loading donors...</span>
            </div>
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-500">No donors found</p>
              <p className="text-sm text-gray-400">
                Add your first donor to get started
              </p>
            </div>
          </div>
        ) : (
          donors.map((donor) => (
            <div
              key={donor.id}
              className="rounded-xl border border-gray-200/60 bg-white shadow-md hover:shadow-xl transition-all duration-300 p-5 space-y-4 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {donor.name}
                  </h3>
                  {donor.contact && (
                    <p className="text-sm text-gray-600 mt-1.5">
                      {donor.contact}
                    </p>
                  )}
                </div>
                <Badge
                  variant={donor.isActive ? 'default' : 'secondary'}
                  className={
                    donor.isActive
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }
                >
                  {donor.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Monthly Amount</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(donor.monthlyAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Payment</p>
                  <p className="font-medium text-gray-900">
                    {donor.lastPayment?.paidAt
                      ? format(
                          new Date(donor.lastPayment.paidAt),
                          DISPLAY_DATE_FORMAT,
                        )
                      : 'Never'}
                  </p>
                </div>
              </div>
              {isAuthenticated && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(donor)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(donor.id)}
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

      <DonorForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        donor={editingDonor}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
