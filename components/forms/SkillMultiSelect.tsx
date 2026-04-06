"use client";

import * as React from "react";
import { ChevronDown, Plus, X } from "@/components/ui/icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function SkillMultiSelect({
  value,
  onChange,
  options,
  placeholder = "Select skills",
  className,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
}) {
  const toggle = (skill: string) => {
    const has = value.includes(skill);
    if (has) onChange(value.filter((s) => s !== skill));
    else onChange([...value, skill]);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {value.length === 0 ? (
          <div className="text-sm text-muted-foreground">{placeholder}</div>
        ) : (
          value.map((s) => (
            <Badge key={s} variant="secondary" className="rounded-full bg-accent/15 text-foreground border-accent/30">
              <span className="mr-1">{s}</span>
              <button
                type="button"
                onClick={() => toggle(s)}
                aria-label={`Remove ${s}`}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" type="button" className="w-full justify-between rounded-md">
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add skills
            </span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <div className="px-2 py-1 text-xs text-muted-foreground">Click to toggle</div>
          <DropdownMenuSeparator />
          <div className="max-h-56 overflow-auto">
            {options.map((skill) => {
              const selected = value.includes(skill);
              return (
                <DropdownMenuItem
                  key={skill}
                  onSelect={(e) => {
                    e.preventDefault();
                    toggle(skill);
                  }}
                  className="cursor-pointer"
                >
                  <span className={cn("mr-2 inline-flex h-2 w-2 rounded-full", selected ? "bg-primary" : "bg-muted")} />
                  {skill}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

