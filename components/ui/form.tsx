"use client";

import * as React from "react";
import { FormProvider, useFormContext } from "react-hook-form";

import type { FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@/lib/utils";

export function Form<TFieldValues extends FieldValues>({
  ...props
}: React.PropsWithChildren<{ children: React.ReactNode }>) {
  // This wrapper exists mostly for naming consistency with shadcn examples.
  // We rely on RHF's FormProvider directly in the pages.
  return <form {...(props as any)} />;
}

export function FormProviderWrapper<TFieldValues extends FieldValues>({
  children,
  ...methods
}: React.PropsWithChildren<ReturnType<typeof import("react-hook-form").useForm<TFieldValues>>>) {
  return <FormProvider {...(methods as any)}>{children}</FormProvider>;
}

export function useRHFFieldError() {
  const ctx = useFormContext();
  return ctx.formState.errors;
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  ...props
}: {
  name: FieldPath<TFieldValues>;
  render: (fieldProps: any) => React.ReactNode;
}) {
  // Minimal placeholder; in this project we use `Controller` directly per-form.
  const ctx = useFormContext<TFieldValues>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const error = (ctx.formState.errors as any)?.[name as string];
  return null;
}

// Note: Many shadcn `Form*` components assume specific helpers.
// For this app, we use `Controller` in each form to keep validation
// and real-time errors consistent.

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium leading-none", className)} {...props} />;
}

export function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {children}
    </p>
  );
}

