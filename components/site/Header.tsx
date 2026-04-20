"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const ref = useRef<HTMLDivElement | null>(null);

  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "IB";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (profileOpen && ref.current && !ref.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-50">
      <div className="backdrop-blur-md bg-[#f8f1eb]/70 border border-[#e9dfd6]/60 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/" className="inline-flex items-center space-x-3">
                <div className="h-8 w-8 rounded-md bg-[#f4c79f] shadow-inner flex items-center justify-center text-black font-bold">IB</div>
                <span className="text-lg font-extrabold text-black">IdeaBridge</span>
              </Link>
            </div>

            {/* Center: Nav links (hidden on small) */}
            <nav className="hidden md:flex md:space-x-8">
              <Link href="/" className="text-sm font-medium text-black/80 hover:text-black transition-colors">
                Search & Filter
              </Link>
              <Link href="/features" className="text-sm font-medium text-black/80 hover:text-black transition-colors">
                Request form
              </Link>
              <Link href="/mentors" className="text-sm font-medium text-black/80 hover:text-black transition-colors">
                Analysis
              </Link>
            </nav>

            {/* Right: Profile / Mobile menu */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                {/* intentionally blank for consistent spacing */}
              </div>

              {/* Desktop: Profile dropdown */}
              <div className="relative" ref={ref}>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  aria-label="Open profile menu"
                  className="h-9 w-9 rounded-full bg-[#0F0F0F] flex items-center justify-center text-[#FFCBA4] font-bold text-sm shadow-md"
                >
                  {initials}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-lg bg-white border border-[#e9dfd6] shadow-md z-40">
                    <div className="py-1">
                      {/* Compute role-aware profile URLs to avoid defaulting when role is missing */}
                      {(() => {
                        const base = user?.role === "student" ? "/dashboard/student/profile" : user?.role === "mentor" ? "/dashboard/mentor/profile" : "/";
                        const edit = base === "/" ? "/" : `${base}?mode=edit`;
                        return (
                          <>
                            <Link href={base} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">View Profile</Link>
                            <Link href={edit} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit Profile</Link>
                          </>
                        );
                      })()}
                      <button
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setOpen(!open)}
                  aria-label="Toggle menu"
                  className="p-2 rounded-md inline-flex items-center justify-center text-black/80 hover:bg-[#ffffff]/30 transition"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {open ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div className={`${open ? "block" : "hidden"} md:hidden border-t border-[#e9dfd6]/40 bg-[#f8f1eb]/70 backdrop-blur-sm`}>
          <div className="px-4 pt-3 pb-4 space-y-2">
            <Link href="/" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800/90 hover:bg-white/20 transition">
              Home
            </Link>
            <Link href="/features" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800/90 hover:bg-white/20 transition">
              Features
            </Link>
            <Link href="/mentors" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800/90 hover:bg-white/20 transition">
              Mentors
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
