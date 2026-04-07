"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { DayPicker } from "react-day-picker";

import type { ClassValue } from "clsx";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  className?: ClassValue;
};

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <div className={cn("p-3", className)}>
      <DayPicker
        showOutsideDays
        className="w-full"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button:
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md hover:bg-muted transition-colors",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
          day_range_end: "day-range-end",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-muted text-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-muted aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
        }}
        {...props}
      />
    </div>
  );
}

