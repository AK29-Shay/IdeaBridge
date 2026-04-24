"use client";

import { FileText, FolderKanban, LayoutDashboard, MessageSquareText, SendHorizonal, UserCircle2 } from "lucide-react";

import { RequireRoleAuth } from "@/components/auth/RequireRole";
import {
  DashboardPortalLayout,
  type DashboardNavItem,
} from "@/components/dashboard/DashboardPortalLayout";

const MENTOR_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/mentor", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/mentor/requests", label: "Requests", icon: SendHorizonal },
  { href: "/dashboard/mentor/mentorships", label: "Mentorships", icon: MessageSquareText },
  { href: "/dashboard/mentor/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/mentor/blog", label: "Blog", icon: FileText },
  { href: "/dashboard/mentor/profile", label: "Profile", icon: UserCircle2 },
];

export default function MentorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRoleAuth role="mentor">
      <DashboardPortalLayout
        portalLabel="Mentor Portal"
        portalDescription="Review student requests, guide active projects, and keep your mentor presence polished."
        navItems={MENTOR_NAV_ITEMS}
      >
        {children}
      </DashboardPortalLayout>
    </RequireRoleAuth>
  );
}
