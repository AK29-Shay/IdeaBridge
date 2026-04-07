"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/common/StarRating";
import type { Mentor } from "@/types/mentor";
import type { AvailabilityStatus } from "@/types/auth";
import { getAvailabilityColor } from "@/lib/constants";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + second).toUpperCase();
}

function availabilityBadgeClass(status: AvailabilityStatus) {
  const color = getAvailabilityColor(status);
  if (color === "green") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
  if (color === "yellow") return "bg-amber-500/15 text-amber-700 border-amber-500/30";
  return "bg-red-500/15 text-red-700 border-red-500/30";
}

export function MentorCard({
  mentor,
  availabilityBadgeVariant = true,
  className,
  actionSlot,
}: {
  mentor: Mentor;
  availabilityBadgeVariant?: boolean;
  className?: string;
  actionSlot?: React.ReactNode;
}) {
  return (
    <Card className={cn("h-full border-border/70 bg-background/70", className)}>
      <CardHeader className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              {mentor.profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mentor.profile.avatarUrl} alt={mentor.fullName} className="h-11 w-11 rounded-full" />
              ) : null}
              <AvatarFallback>{initials(mentor.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold leading-tight">{mentor.fullName}</div>
              <div className="mt-1">
                <StarRating rating={mentor.rating} />
              </div>
            </div>
          </div>

          {availabilityBadgeVariant ? (
            <Badge
              variant="outline"
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold", availabilityBadgeClass(mentor.profile.availabilityStatus))}
            >
              {mentor.profile.availabilityStatus}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4">
        <div className="flex flex-wrap gap-2">
          {mentor.profile.skills.slice(0, 4).map((s) => (
            <Badge key={s} variant="secondary" className="rounded-full bg-accent/15 border-accent/30">
              {s}
            </Badge>
          ))}
          {mentor.profile.skills.length > 4 ? (
            <Badge variant="secondary" className="rounded-full">
              +{mentor.profile.skills.length - 4}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Mentor Focus</div>
          <Progress value={Math.round((mentor.rating / 5) * 100)} className="bg-secondary" />
        </div>

        {actionSlot ? <div className="pt-1">{actionSlot}</div> : null}
      </CardContent>
    </Card>
  );
}

