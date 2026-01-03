'use client';

import { format, subMonths, addMonths, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DATE_FORMAT } from '@/lib/constants';

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const currentDate = parse(value, DATE_FORMAT, new Date());

  const handlePrevious = () => {
    const previousMonth = subMonths(currentDate, 1);
    onChange(format(previousMonth, DATE_FORMAT));
  };

  const handleNext = () => {
    const nextMonth = addMonths(currentDate, 1);
    onChange(format(nextMonth, DATE_FORMAT));
  };

  const handleSelectChange = (newValue: string) => {
    onChange(newValue);
  };

  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    const startDate = subMonths(today, 12);

    for (let i = 0; i < 24; i++) {
      const date = addMonths(startDate, i);
      const monthValue = format(date, DATE_FORMAT);
      const monthLabel = format(date, 'MMMM yyyy');
      options.push({ value: monthValue, label: monthLabel });
    }

    return options.reverse();
  };

  return (
    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        aria-label="Previous month"
        className="h-9 w-9 hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[180px] h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {generateMonthOptions().map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        aria-label="Next month"
        disabled={
          format(addMonths(currentDate, 1), DATE_FORMAT) >
          format(new Date(), DATE_FORMAT)
        }
        className="h-9 w-9 hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
