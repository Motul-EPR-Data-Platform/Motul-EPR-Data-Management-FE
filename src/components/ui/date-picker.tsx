"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function formatDate(date: Date | undefined): string {
  if (!date) {
    return "";
  }
  if (!isValidDate(date)) {
    return "";
  }
  return format(date, "dd/MM/yyyy");
}

function isValidDate(date: Date | undefined): boolean {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    value && isValidDate(value) ? value : undefined
  );
  const [month, setMonth] = React.useState<Date | undefined>(
    date && isValidDate(date) ? date : new Date()
  );
  const [inputValue, setInputValue] = React.useState(formatDate(date));

  // Sync with external value changes
  React.useEffect(() => {
    if (value !== date) {
      const validDate = value && isValidDate(value) ? value : undefined;
      setDate(validDate);
      setMonth(validDate && isValidDate(validDate) ? validDate : new Date());
      setInputValue(formatDate(validDate));
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    // Try to parse dd/mm/yyyy format
    const dateMatch = inputVal.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isValidDate(parsedDate)) {
        setDate(parsedDate);
        setMonth(parsedDate);
        onChange?.(parsedDate);
      }
    } else {
      // Try to parse as ISO date string
      const parsedDate = new Date(inputVal);
      if (isValidDate(parsedDate)) {
        setDate(parsedDate);
        setMonth(parsedDate);
        onChange?.(parsedDate);
      }
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && isValidDate(selectedDate)) {
      setDate(selectedDate);
      setMonth(selectedDate);
      setInputValue(formatDate(selectedDate));
      onChange?.(selectedDate);
    } else {
      setDate(undefined);
      setInputValue("");
      onChange?.(undefined);
    }
    setOpen(false);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex gap-2">
        <Input
          value={inputValue}
          placeholder={placeholder}
          className="w-full bg-background pr-10"
          onChange={handleInputChange}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              disabled={disabled}
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Chọn ngày</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date && isValidDate(date) ? date : undefined}
              captionLayout="dropdown"
              month={month && isValidDate(month) ? month : new Date()}
              onMonthChange={(newMonth) => {
                if (newMonth && isValidDate(newMonth)) {
                  setMonth(newMonth);
                }
              }}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
