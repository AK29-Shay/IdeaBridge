"use client";

import { LayoutDashboard, ShieldCheck, ShieldAlert, History } from "lucide-react";

import { RequireRoleAuth } from "@/components/auth/RequireRole";
import {
  DashboardPortalLayout,
  type DashboardNavItem,
} from "@/components/dashboard/DashboardPortalLayout";

const ADMIN_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/dashboard/admin/moderation", label: "Moderation", icon: ShieldAlert },
  { href: "/dashboard/admin/activity", label: "Activity", icon: History },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRoleAuth role="admin">
      <DashboardPortalLayout
        portalLabel="Admin Portal"
        portalDescription="Manage mentor approvals, moderation actions, and platform operations visibility."
        navItems={ADMIN_NAV_ITEMS}
      >
        {children}
      </DashboardPortalLayout>
    </RequireRoleAuth>
  );
}

