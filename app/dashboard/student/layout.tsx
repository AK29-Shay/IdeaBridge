"use client";

import { FolderKanban, LayoutDashboard, MessageCircle, SendHorizonal } from "lucide-react";

import { RequireRoleAuth } from "@/components/auth/RequireRole";
import {
  DashboardPortalLayout,
  type DashboardNavItem,
} from "@/components/dashboard/DashboardPortalLayout";

const STUDENT_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/student/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/student/requests", label: "Requests", icon: SendHorizonal },
  { href: "/ideas/explore", label: "Discussion Thread", icon: MessageCircle },
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
