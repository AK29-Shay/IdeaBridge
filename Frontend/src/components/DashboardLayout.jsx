import React from 'react';
import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Send,
  UserCircle2
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'My Projects', icon: FolderKanban },
  { label: 'Requests', icon: Send },
  { label: 'Profile', icon: UserCircle2 }
];

function DashboardLayout({ title, children }) {
  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-[320px] shrink-0 border-r border-[#ecdccf] bg-white/88 px-6 py-5 backdrop-blur xl:flex xl:flex-col">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#110f0c] text-lg font-bold text-[#fecdac] shadow-[0_14px_28px_-16px_rgba(17,15,12,0.85)]">
              IB
            </div>
            <div>
              <p className="text-[1.75rem] font-bold leading-none tracking-tight text-slate-900">IdeaBridge</p>
              <p className="mt-1 text-sm font-semibold text-[#8b6b57]">Student Portal</p>
            </div>
          </div>

          <div className="mt-11 rounded-[28px] bg-[#110f0c] p-4 text-[#fecdac] shadow-[0_30px_70px_-40px_rgba(17,15,12,0.95)]">
            <div className="flex items-center gap-4 rounded-[22px] bg-[#fecdac]/6 px-4 py-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fecdac]/10 text-lg font-semibold text-[#fecdac]">
                DB
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-[#fecdac]">Abinayan Kesavan</p>
                <p className="truncate text-sm text-[#fecdac]/72">abinayankesavan@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Navigation</p>
            <nav className="mt-4 space-y-2.5">
              {navItems.map(({ label, icon: Icon, active }) => (
                <button
                  key={label}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-lg font-semibold transition ${
                    active
                      ? 'bg-gold-gradient text-darkPrimary shadow-[0_18px_40px_-28px_rgba(245,169,127,0.95)]'
                      : 'text-slate-600 hover:bg-[#fff4eb] hover:text-darkPrimary'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-darkPrimary' : 'text-goldSecondary'}`} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[#ead8cb] bg-white/72 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#efd7c4] bg-white text-slate-500 shadow-sm xl:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                    <LayoutDashboard className="h-4 w-4 text-goldSecondary" />
                    <span>Student Portal</span>
                    <span>/</span>
                    <span className="text-slate-700">{title}</span>
                  </div>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm text-slate-400">Welcome back</p>
                  <p className="text-lg font-semibold text-slate-800">Abinayan Kesavan</p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#efd7c4] bg-white text-slate-500 shadow-sm"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-goldSecondary" />
                </button>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-darkPrimary text-sm font-bold text-goldPrimary shadow-[0_14px_28px_-16px_rgba(15,15,15,0.85)]">
                  DB
                </div>
              </div>
            </div>
          </header>

          <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-6">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default DashboardLayout;
