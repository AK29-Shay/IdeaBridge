"use client";

import * as React from "react";
import { toast } from "sonner";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import type { StudentProject } from "@/types/project";
import { updateProgressSchemaWithConsistency as updateProgressSchema } from "@/lib/zod/projectSchemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type UpdateProgressFormValues = z.input<typeof updateProgressSchema>;
type UpdateProgressInput = z.output<typeof updateProgressSchema>;

function toDateInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getFieldErrorMessage(message: unknown) {
  return typeof message === "string" ? message : "Invalid value.";
}

export function UpdateProgressModal({
  open,
  onOpenChange,
  project,
  onSave,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  project: StudentProject | null;
  onSave: (next: UpdateProgressInput) => Promise<void> | void;
}) {
  const todayValue = toDateInputValue(new Date());
  const form = useForm<UpdateProgressFormValues, unknown, UpdateProgressInput>({
    resolver: zodResolver(updateProgressSchema),
    mode: "onChange",
    defaultValues: {
      progressPercent: project?.progressPercent ?? 0,
      status: project?.status ?? (project?.progressPercent === 0 ? "Not Started" : "In Progress"),
      milestoneNotes: project?.milestoneNotes ?? "",
      dateUpdated: todayValue,
    },
  });

  React.useEffect(() => {
    if (!project) return;
    form.reset({
      progressPercent: project.progressPercent,
      status: project.status,
      milestoneNotes: project.milestoneNotes,
      dateUpdated: todayValue,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, open]);

  function quickFill() {
    if (!project) return;
    const nextProgress = Math.min(100, project.progressPercent + 10);
    const nextStatus = nextProgress >= 100 ? "Completed" : nextProgress >= 70 ? "On Track" : nextProgress >= 40 ? "In Progress" : nextProgress === 0 ? "Not Started" : "Delayed";
    form.setValue("progressPercent", nextProgress);
    form.setValue("status", nextStatus);
    form.setValue("milestoneNotes", "Add a concise summary of what you accomplished since the last update.");
    form.setValue("dateUpdated", todayValue);
    toast.message("Quick-fill applied.");
  }

  async function submit(values: UpdateProgressInput) {
    if (!project) return;
    await onSave(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0F0F0F] text-white border border-[#FFCBA4]/20 shadow-xl rounded-xl p-6">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>Update the project progress percentage, status, and add short milestone notes.</DialogDescription>
        </DialogHeader>

        {!project ? (
          <div className="py-10 text-sm text-gray-400">No project selected.</div>
        ) : (
          <form onSubmit={form.handleSubmit(submit)} className="mt-5 space-y-5">
            {Object.keys(form.formState.errors).length > 0 ? (
              <div className="rounded-md border border-red-600/20 bg-red-50/10 p-3 text-sm text-red-600">
                <div className="font-semibold">Please fix the following:</div>
                <ul className="mt-1 list-disc list-inside">
                  {Object.entries(form.formState.errors).map(([k, v]) => (
                    <li key={k}>{getFieldErrorMessage(v?.message)}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label className="text-gray-300">Progress %</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Number(form.watch("progressPercent") ?? 0)}
                  onChange={(e) => form.setValue("progressPercent", Number(e.target.value))}
                  className="w-full accent-orange-200"
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className="w-28 bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-200"
                  value={Number(form.watch("progressPercent") ?? 0)}
                  onChange={(e) => form.setValue("progressPercent", Number(e.target.value))}
                />
              </div>
              <div className="text-sm text-gray-400">Current: {Number(form.watch("progressPercent") ?? 0)}%</div>
              {form.formState.errors.progressPercent ? (
                <div className="text-sm text-destructive">{form.formState.errors.progressPercent.message}</div>
              ) : null}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <ControllerSelect
                  form={form}
                  name="status"
                  options={["Not Started", "In Progress", "On Track", "Delayed", "Completed"]}
                />
                {form.formState.errors.status ? (
                  <div className="text-sm text-destructive">{getFieldErrorMessage(form.formState.errors.status.message)}</div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Date updated</Label>
                <Input type="date" className="bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-200" {...form.register("dateUpdated")} />
                {form.formState.errors.dateUpdated ? (
                  <div className="text-sm text-destructive">{form.formState.errors.dateUpdated.message}</div>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestoneNotes" className="text-gray-300">Milestone notes</Label>
              <Textarea id="milestoneNotes" placeholder="One or two short sentences describing progress, blockers, and next step" className="w-full bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-200 rounded-lg px-3 py-2.5" {...form.register("milestoneNotes")} />
              <div className="text-sm text-gray-400">Keep notes concise — mentors review these quickly.</div>
              {form.formState.errors.milestoneNotes ? (
                <div className="text-sm text-destructive">{form.formState.errors.milestoneNotes.message}</div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" className="rounded-xl border border-gray-600 text-white" onClick={quickFill}>
                Quick fill
              </Button>
              <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting} className="rounded-xl bg-orange-200 text-black hover:bg-orange-300">
                Save Update
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ControllerSelect({
  form,
  name,
  options,
}: {
  form: UseFormReturn<UpdateProgressFormValues, unknown, UpdateProgressInput>;
  name: "status";
  options: UpdateProgressInput["status"][];
}) {
  // Keep a small helper local to the modal for Select wiring.
  // Using watch/setValue avoids pulling in Controller for each field.
  return (
    <Select
      value={form.watch(name) ?? ""}
      onValueChange={(v) => form.setValue(name, v as UpdateProgressInput["status"])}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

