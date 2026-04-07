"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "@/components/ui/icons";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const current = resolvedTheme ?? theme ?? "system";

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={() => {
          if (current === "light") setTheme("dark");
          else if (current === "dark") setTheme("system");
          else setTheme("light");
        }}
        className="rounded-full"
      >
        {current === "light" ? (
          <Sun className="h-4 w-4" />
        ) : current === "dark" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Monitor className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

