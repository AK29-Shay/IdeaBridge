"use client";

import * as React from "react";
import {
  LayoutDashboard,
  FileText,
  UserCircle2,
  LogOut,
  Menu,
  X,
  Bell,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { RequireRoleAuth } from "@/components/auth/RequireRole";
import { DashboardSection } from "@/components/mentor/DashboardSection";
import { BlogSection } from "@/components/mentor/BlogSection";
import { ProfileSection } from "@/components/mentor/ProfileSection";

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = "dashboard" | "blog" | "profile";

type RequestStatus = "Pending" | "Accepted" | "Rejected";
interface RequestItem {
  id: string;
  studentName: string;
  projectTitle: string;
  message?: string;
  status: RequestStatus;
  sentAt?: string;
}

interface ProjectItem {
  id: string;
  title: string;
  studentName: string;
  progressPercent: number;
  status: "In Progress" | "Completed" | "Delayed";
  updatedAt?: string;
}

// ── Initial dummy data ─────────────────────────────────────────────────────────
const INITIAL_REQUESTS: RequestItem[] = [
  { id: "r-1", studentName: "Alex Harper",  projectTitle: "CampusMap Improvements",  message: "Would you mentor our accessibility improvements project? We'd love your systems expertise.", status: "Pending",  sentAt: "2026-03-27" },
  { id: "r-2", studentName: "Lina Gomez",   projectTitle: "ML Coach Enhancements",   message: "Looking for model evaluation and feedback pipeline help.", status: "Pending",  sentAt: "2026-03-26" },
  { id: "r-3", studentName: "Noah Williams",projectTitle: "Blockchain Voting App",   message: "Need architectural guidance on smart contract design.", status: "Accepted", sentAt: "2026-03-22" },
  { id: "r-4", studentName: "Yumi Tanaka",  projectTitle: "IoT Dashboard",           message: "Seeking mentor for embedded systems and real-time data.", status: "Rejected", sentAt: "2026-03-18" },
];

const INITIAL_PROJECTS: ProjectItem[] = [
  { id: "p-1", title: "Quantum Notes",    studentName: "Priya N.",    progressPercent: 65,  status: "In Progress", updatedAt: "2026-03-27" },
  { id: "p-2", title: "CampusMap",        studentName: "Noah W.",     progressPercent: 35,  status: "Delayed",     updatedAt: "2026-03-25" },
  { id: "p-3", title: "ML Coach",         studentName: "Ava T.",      progressPercent: 100, status: "Completed",   updatedAt: "2026-03-20" },
  { id: "p-4", title: "SmartHR System",   studentName: "Jordan K.",   progressPercent: 48,  status: "In Progress", updatedAt: "2026-03-28" },
  { id: "p-5", title: "EduAssist AI",     studentName: "Sam R.",      progressPercent: 82,  status: "In Progress", updatedAt: "2026-03-26" },
];

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "blog",      label: "Blog",      icon: FileText         },
  { id: "profile",   label: "Profile",   icon: UserCircle2      },
];

// ── Page export ────────────────────────────────────────────────────────────────
export default function MentorDashboardPage() {
  return (
    <RequireRoleAuth role="mentor">
      <MentorDashboard />
    </RequireRoleAuth>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function MentorDashboard() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab]     = React.useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [requests, setRequests]       = React.useState<RequestItem[]>(INITIAL_REQUESTS);
  const [projects]                    = React.useState<ProjectItem[]>(INITIAL_PROJECTS);

  function handleTabChange(tab: string) {
    setActiveTab(tab as Tab);
    setSidebarOpen(false);
  }

  function handleUpdateRequest(id: string, status: "Accepted" | "Rejected") {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  function handleLogout() {
    logout();
    toast.success("Logged out successfully.");
  }

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "M";

  const availabilityStatus =
    (user.mentorProfile?.availabilityStatus as "Available" | "Busy" | "On Leave" | undefined)
    ?? (user.availabilityStatus as "Available" | "Busy" | "On Leave" | undefined)
    ?? "Available";

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
              Mentor Portal
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
        <div className="mx-4 mt-4 rounded-2xl p-4 shadow-md" style={{background:'linear-gradient(135deg,#0F0F0F 70%,#1c0f00)',border:'1px solid rgba(255,203,164,0.2)'}}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm border border-white/30 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate text-sm text-[#FFCBA4]">{user.fullName}</div>
              <div className="text-xs text-[#FFCBA4]/60 truncate">{user.email}</div>
            </div>
          </div>

          {/* Availability badge */}
          <div className="mt-3">
            {(() => {
              const s = availabilityStatus;
              const dot = s === "Available" ? "bg-emerald-400" : s === "Busy" ? "bg-amber-400" : "bg-slate-400";
              return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/25 px-3 py-1 text-xs font-semibold text-[#0F0F0F] backdrop-blur-sm">
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                  {s}
                </span>
              );
            })()}
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
            {/* Mobile hamburger */}
            <button
              className="lg:hidden rounded-xl border border-[#FFCBA4]/30 p-2 text-slate-500 hover:bg-[#FFCBA4]/10 hover:text-[#0F0F0F] transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:block">Mentor Portal</span>
              <span className="text-slate-300 hidden sm:block">/</span>
              <span className="text-sm font-semibold text-slate-700">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {/* Greeting */}
              <div className="hidden md:block text-right">
                <div className="text-xs text-slate-400">Good to see you 👋</div>
                <div className="text-sm font-semibold text-slate-700">{user.fullName}</div>
              </div>

              {/* Bell */}
              <button className="relative rounded-xl border border-[#FFCBA4]/30 bg-white p-2 text-slate-500 hover:bg-[#FFCBA4]/10 hover:text-[#0F0F0F] transition-colors shadow-sm">
                <Bell className="h-4 w-4" />
                {requests.filter(r => r.status === "Pending").length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#F5A97F] flex items-center justify-center text-[#0F0F0F] text-[10px] font-bold">
                    {requests.filter(r => r.status === "Pending").length}
                  </span>
                )}
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
            <DashboardSection
              mentorName={user.fullName}
              availabilityStatus={availabilityStatus as "Available" | "Busy" | "On Leave"}
              requests={requests}
              projects={projects}
              onUpdateRequest={handleUpdateRequest}
              onTabChange={handleTabChange}
            />
          )}
          {activeTab === "blog"    && <BlogSection />}
          {activeTab === "profile" && <ProfileSection />}
        </main>
      </div>
    </div>
  );
}
