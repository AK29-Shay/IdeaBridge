"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  FolderKanban,
  SendHorizonal,
  UserCircle2,
  LogOut,
  Menu,
  X,
  Bell,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { RequireRoleAuth } from "@/components/auth/RequireRole";
import { getProjectsForUser, setProjectsForUser } from "@/lib/storage";
import type { StudentProject } from "@/types/project";

import { DashboardSection } from "@/components/student/DashboardSection";
import { ProjectsSection } from "@/components/student/ProjectsSection";
import { RequestsSection } from "@/components/student/RequestsSection";
import { ProfileSection } from "@/components/student/ProfileSection";

type Tab = "dashboard" | "projects" | "requests" | "profile";

const NAV_ITEMS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "My Projects", icon: FolderKanban },
  { id: "requests", label: "Requests", icon: SendHorizonal },
  { id: "profile", label: "Profile", icon: UserCircle2 },
];

export default function StudentDashboardPage() {
  return (
    <RequireRoleAuth role="student">
      <StudentDashboard />
    </RequireRoleAuth>
  );
}

function StudentDashboard() {
  const { user, logout } = useAuth();
  const email = user?.email ?? "";

  const [activeTab, setActiveTab] = React.useState<Tab>("dashboard");
  const [projects, setProjectsState] = React.useState<StudentProject[]>([]);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Load projects from localStorage on mount
  React.useEffect(() => {
    if (!email) return;
    setProjectsState(getProjectsForUser(email));
  }, [email]);

  function setProjects(p: StudentProject[]) {
    setProjectsState(p);
    if (email) setProjectsForUser(email, p);
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab as Tab);
    setSidebarOpen(false);
  }

  function handleLogout() {
    logout();
    toast.success("Logged out successfully.");
  }

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "S";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFF3E8]/60 to-[#FFF8F3] flex">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-72 flex-col
          border-r border-[#FFCBA4]/30 bg-white shadow-xl
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-[#FFCBA4]/30 px-6 py-5">
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm text-[#FFCBA4] shadow-md" style={{background:'linear-gradient(135deg,#0F0F0F 60%,#1c0f00)'}}>
            IB
          </div>
          <div>
            <div className="font-bold text-slate-800">IdeaBridge</div>
            <div className="text-xs text-[#F5A97F] font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Student Portal
            </div>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User card */}
        <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-[#0F0F0F] to-[#1c1000] p-4 shadow-md" style={{border:'1px solid rgba(255,203,164,0.25)'}}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm border border-white/30">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate text-sm text-[#FFCBA4]">{user.fullName}</div>
              <div className="text-xs text-[#FFCBA4]/70 truncate">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
            Navigation
          </div>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`
                  w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
                  transition-all duration-200
                  ${active
                    ? "bg-gradient-to-r from-[#FFCBA4] to-[#F5A97F] text-[#0F0F0F] shadow-md shadow-[#FFCBA4]/30"
                    : "text-slate-600 hover:bg-[#FFCBA4]/10 hover:text-[#0F0F0F]"
                  }
                `}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#0F0F0F]" : "text-[#FFCBA4]/60"}`} />
                {label}
                {id === "projects" && projects.length > 0 && (
                  <span className={`ml-auto text-xs rounded-full px-2 py-0.5 font-medium
                    ${active ? "bg-black/20 text-[#0F0F0F]" : "bg-[#FFCBA4]/20 text-[#0F0F0F]"}`}>
                    {projects.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-[#FFCBA4]/30 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="sticky top-0 z-10 border-b border-[#FFCBA4]/30/60 bg-white/80 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden rounded-xl border border-[#FFCBA4]/30 p-2 text-slate-500 hover:bg-[#FFCBA4]/10 hover:text-[#0F0F0F] transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / page title */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:block">Student Portal</span>
              <span className="text-slate-300 hidden sm:block">/</span>
              <span className="text-sm font-semibold text-slate-700 capitalize">
                {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {/* Greeting */}
              <div className="hidden md:block text-right">
                <div className="text-xs text-slate-400">Welcome back 👋</div>
                <div className="text-sm font-semibold text-slate-700">{user.fullName}</div>
              </div>

              {/* Bell */}
              <button className="relative rounded-xl border border-[#FFCBA4]/30 bg-white p-2 text-slate-500 hover:bg-[#FFCBA4]/10 hover:text-[#0F0F0F] transition-colors shadow-sm">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#F5A97F]" />
              </button>

              {/* Avatar */}
              <div className="h-9 w-9 rounded-full bg-[#0F0F0F] flex items-center justify-center text-[#FFCBA4] font-bold text-sm shadow-md">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-6xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <DashboardSection projects={projects} onTabChange={handleTabChange} />
          )}
          {activeTab === "projects" && (
            <ProjectsSection
              projects={projects}
              setProjects={setProjects}
              userEmail={email}
            />
          )}
          {activeTab === "requests" && <RequestsSection />}
          {activeTab === "profile" && <ProfileSection />}
        </main>
      </div>
    </div>
  );
}
