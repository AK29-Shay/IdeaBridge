"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

export const Avatar = AvatarPrimitive.Root;
export const AvatarImage = AvatarPrimitive.Image;
export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.AvatarFallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.AvatarFallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.AvatarFallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.AvatarFallback.displayName;

