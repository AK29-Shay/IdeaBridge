"use client";

import * as React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import type { AvailabilityStatus } from "@/types/auth";
import { requestMentorshipSchema } from "@/lib/zod/mentorshipSchemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type RequestInput = z.infer<typeof requestMentorshipSchema>;

export function RequestMentorshipModal({
  open,
  onOpenChange,
  mentorName,
  mentorAvailabilityStatus,
  defaultProjectTitle,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  mentorName: string;
  mentorAvailabilityStatus: AvailabilityStatus;
  defaultProjectTitle?: string;
  onSubmit: (values: RequestInput) => Promise<void> | void;
}) {
  const form = useForm<RequestInput>({
    resolver: zodResolver(requestMentorshipSchema),
    mode: "onChange",
    defaultValues: {
      projectTitle: defaultProjectTitle ?? "",
      goals: "",
      preferredStartDate: "",
      message: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.setValue("projectTitle", defaultProjectTitle ?? form.getValues("projectTitle"));
  }, [open, defaultProjectTitle, form]);

  

  async function submit(values: RequestInput) {
    await onSubmit(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>Submit a structured request with project goals and a preferred start date.</DialogDescription>
          </DialogHeader>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full px-4 py-1 text-sm font-semibold">
            {mentorName}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
            Mentor status: {mentorAvailabilityStatus}
          </Badge>
        </div>

        <form onSubmit={form.handleSubmit(submit)} className="mt-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="projectTitle">Project Title</Label>
            <Input id="projectTitle" placeholder="What are you building?" {...form.register("projectTitle")} />
            {form.formState.errors.projectTitle ? (
              <div className="text-sm text-destructive">{form.formState.errors.projectTitle.message}</div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Textarea id="goals" placeholder="Describe what success looks like" {...form.register("goals")} />
            {form.formState.errors.goals ? (
              <div className="text-sm text-destructive">{form.formState.errors.goals.message}</div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredStartDate">Preferred Start Date</Label>
            <Input id="preferredStartDate" type="date" {...form.register("preferredStartDate")} />
            {form.formState.errors.preferredStartDate ? (
              <div className="text-sm text-destructive">{form.formState.errors.preferredStartDate.message}</div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Add context and your approach to mentorship" {...form.register("message")} />
            {form.formState.errors.message ? (
              <div className="text-sm text-destructive">{form.formState.errors.message.message}</div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" className="rounded-xl bg-primary hover:brightness-110">
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

