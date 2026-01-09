'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface YearMonthFilterProps {
  year?: number;
  month?: number;
  onYearChange: (year: number | undefined) => void;
  onMonthChange: (month: number | undefined) => void;
  onClear: () => void;
}

export function YearMonthFilter({
  year,
  month,
  onYearChange,
  onMonthChange,
  onClear,
}: YearMonthFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const hasFilter = year !== undefined || month !== undefined;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={year?.toString() || 'all'}
        onValueChange={(value) =>
          onYearChange(value === 'all' ? undefined : parseInt(value))
        }
      >
        <SelectTrigger className="w-[140px] h-9 border-gray-200">
          <SelectValue placeholder="All Years" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={month?.toString() || 'all'}
        onValueChange={(value) =>
          onMonthChange(value === 'all' ? undefined : parseInt(value))
        }
        disabled={year === undefined}
      >
        <SelectTrigger className="w-[160px] h-9 border-gray-200">
          <SelectValue placeholder="All Months" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Months</SelectItem>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value.toString()}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-9 text-gray-600 hover:text-gray-900"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
