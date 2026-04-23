"use client";

import { FolderKanban, Lightbulb, LayoutDashboard, MessageSquareText, SendHorizonal, UserCircle2 } from "lucide-react";

import { RequireRoleAuth } from "@/components/auth/RequireRole";
import {
  DashboardPortalLayout,
  type DashboardNavItem,
} from "@/components/dashboard/DashboardPortalLayout";

const STUDENT_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/student/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/student/requests", label: "Requests", icon: SendHorizonal },
  { href: "/dashboard/student/mentorships", label: "Mentorships", icon: MessageSquareText },
  { href: "/dashboard/student/recommendations", label: "Recommendations", icon: Lightbulb },
  { href: "/dashboard/student/profile", label: "Profile", icon: UserCircle2 },
];

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRoleAuth role="student">
      <DashboardPortalLayout
        portalLabel="Student Portal"
        portalDescription="Manage your idea pipeline, mentorship requests, and personal progress from one workspace."
        navItems={STUDENT_NAV_ITEMS}
      >
        {children}
      </DashboardPortalLayout>
    </RequireRoleAuth>
  );
}
