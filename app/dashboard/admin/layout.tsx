"use client";

import { ShieldCheck } from "lucide-react";

import { RequireRoleAuth } from "@/components/auth/RequireRole";
import { DashboardPortalLayout, type DashboardNavItem } from "@/components/dashboard/DashboardPortalLayout";

const ADMIN_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: ShieldCheck },
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
        portalDescription="Approve mentors, moderate request flow, and keep platform operations healthy."
        navItems={ADMIN_NAV_ITEMS}
      >
        {children}
      </DashboardPortalLayout>
    </RequireRoleAuth>
  );
}
