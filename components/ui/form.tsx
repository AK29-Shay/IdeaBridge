"use client";

import * as React from "react";
import { FormProvider, useFormContext } from "react-hook-form";

import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";

export function Form(props: React.FormHTMLAttributes<HTMLFormElement>) {
  return <form {...props} />;
}

export function FormProviderWrapper<TFieldValues extends FieldValues>({
  children,
  ...methods
}: React.PropsWithChildren<UseFormReturn<TFieldValues>>) {
  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function useRHFFieldError() {
  const ctx = useFormContext();
  return ctx.formState.errors;
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  render,
}: {
  name: FieldPath<TFieldValues>;
  render: (fieldProps: { name: FieldPath<TFieldValues> }) => React.ReactNode;
}) {
  useFormContext<TFieldValues>();
  return <>{render({ name })}</>;
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

