"use client";

import * as React from "react";
import { toast } from "sonner";

import type { AvailabilityStatus } from "@/types/auth";
import { getAvailabilityColor } from "@/lib/constants";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function buildDummySlots(status: AvailabilityStatus): string[] {
  switch (status) {
    case "Available Now":
      return ["10:00 AM", "12:30 PM", "3:00 PM"];
    case "Available in 1-2 days":
      return ["9:30 AM", "1:00 PM", "4:15 PM"];
    case "Busy":
      return ["6:00 PM", "7:30 PM"];
    case "On Leave":
      return ["Next week (schedule later)"];
    default:
      return ["—"];
  }
}

export function CheckAvailabilityModal({
  open,
  onOpenChange,
  mentorName,
  availabilityStatus,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  mentorName: string;
  availabilityStatus: AvailabilityStatus;
}) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);

  const today = React.useMemo(() => new Date(), []);

  const availableDates = React.useMemo(() => {
    const status = availabilityStatus;
    if (status === "Available Now") return [0, 1, 2, 4].map((n) => addDays(today, n));
    if (status === "Available in 1-2 days") return [2, 3, 5].map((n) => addDays(today, n));
    if (status === "Busy") return [6, 7, 9].map((n) => addDays(today, n));
    return [10, 14].map((n) => addDays(today, n));
  }, [availabilityStatus, today]);

  const disabled = React.useCallback(
    (date: Date) => {
      const isSame = availableDates.some((d) => d.toDateString() === date.toDateString());
      return !isSame;
    },
    [availableDates]
  );

  const slots = React.useMemo(() => buildDummySlots(availabilityStatus), [availabilityStatus]);

  React.useEffect(() => {
    if (!open) setSelectedDate(undefined);
  }, [open]);

  const message = React.useMemo(() => {
    const color = getAvailabilityColor(availabilityStatus);
    const base =
      color === "green"
        ? "You can expect a response quickly. Consider proposing a milestone-focused agenda."
        : color === "yellow"
          ? "Scheduling is limited soon. Suggest 2-3 milestone times and your preferred goals."
          : "This mentor is currently busy. Submit a concise plan and wait for the next available window.";

    if (!selectedDate) return base;
    const datePart = `Selected date: ${formatShortDate(selectedDate)}.`;
    return `${datePart} ${base}`;
  }, [availabilityStatus, selectedDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Check Availability</DialogTitle>
          <DialogDescription>Dummy availability calendar + status message for presentation.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <span className="font-semibold">{mentorName}</span>
              <span className="ml-2 text-muted-foreground">is currently</span>
            </div>
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1 text-sm font-semibold"
            >
              {availabilityStatus}
            </Badge>
          </div>
          <Separator />

          <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => setSelectedDate(d)}
                disabled={(date) => disabled(date)}
              />
              <div className="mt-2 text-xs text-muted-foreground">Only highlighted dates are available.</div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/15 p-4">
              <div className="text-sm font-semibold">Status message</div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{message}</div>
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Possible time slots</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <Badge key={s} variant="secondary" className="rounded-full bg-accent/15 border-accent/30">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  className="rounded-xl bg-primary hover:brightness-110"
                  onClick={() => {
                    toast.success("Availability checked.");
                    onOpenChange(false);
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

