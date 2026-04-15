"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Clock,
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
import { RequestsSection } from "@/components/mentor/RequestsSection";

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = "dashboard" | "requests" | "blog" | "profile";

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
  { id: "requests",  label: "Requests",  icon: Clock           },
  { id: "blog",      label: "Blog",      icon: FileText         },
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
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
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

  const firstName = user.fullName ? user.fullName.split(" ")[0] : "Mentor";

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
        {/* Context label instead of duplicated logo */}
        <div className="px-6 py-4 border-b border-[#FFCBA4]/30">
          <div className="text-sm text-slate-600">Mentor Portal</div>
          <div className="text-xs text-slate-400 mt-1">Welcome, {firstName}</div>
          <button
            className="ml-auto lg:hidden mt-2 text-slate-400 hover:text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User card (lightweight) */}
        <div className="mx-4 mt-4 rounded-2xl p-4 bg-white border border-[#FFCBA4]/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#f4c79f] flex items-center justify-center font-bold text-sm text-black shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate text-sm text-slate-800">{user.fullName}</div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
            </div>
          </div>

          {/* Availability badge (subtle) */}
          <div className="mt-3">
            {(() => {
              const s = availabilityStatus;
              const dot = s === "Available" ? "bg-emerald-400" : s === "Busy" ? "bg-amber-400" : "bg-slate-400";
              return (
                <span className="inline-flex items-center gap-1 rounded-full bg-white border px-3 py-1 text-xs font-medium text-slate-700">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
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
        {/* Top navbar is provided globally by components/site/Header */}

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
          {activeTab === "requests" && (
            <RequestsSection requests={requests} onUpdateRequest={handleUpdateRequest} />
          )}
          {activeTab === "blog"    && <BlogSection />}
          {activeTab === "profile" && <ProfileSection />}
        </main>
      </div>
    </div>
  );
}
