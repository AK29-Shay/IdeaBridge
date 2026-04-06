"use client";

import * as React from "react";
import { Star } from "@/components/ui/icons";

import { cn } from "@/lib/utils";

export function StarRating({ rating, className }: { rating: number; className?: string }) {
  const stars = 5;
  const rounded = Math.max(0, Math.min(5, rating));
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`Rating ${rounded.toFixed(1)} out of 5`}>
      {Array.from({ length: stars }).map((_, i) => {
        const filled = rounded >= i + 1 - 0.25;
        return <Star key={i} className={cn("h-4 w-4", filled ? "fill-primary text-primary" : "text-muted-foreground")} />;
      })}
      <span className="ml-2 text-xs text-muted-foreground">{rounded.toFixed(1)}</span>
    </div>
  );
}

