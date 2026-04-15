import Link from "next/link";
import { Lightbulb, Search, BarChart3, Users, Bell, User, ArrowRight, Sparkles } from "lucide-react";

const MODULE_CARDS = [
  {
    href: "/ideas/explore",
    label: "Idea & Guidance",
    description: "Post your project ideas, request guidance, and engage in threaded discussions.",
    icon: Lightbulb,
    color: "bg-amber-50 border-amber-200 hover:border-amber-400",
    iconColor: "text-amber-600 bg-amber-100",
    badge: "AK29-Shay",
  },
  {
    href: "/search",
    label: "Explore & Search",
    description: "Discover trending projects, filter by tech stack, and find relevant ideas.",
    icon: Search,
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
    iconColor: "text-blue-600 bg-blue-100",
    badge: "NethminiChinthana101",
  },
  {
    href: "/dashboard",
    label: "Analytics",
    description: "Track engagement metrics, view weekly activity, and top posts at a glance.",
    icon: BarChart3,
    color: "bg-violet-50 border-violet-200 hover:border-violet-400",
    iconColor: "text-violet-600 bg-violet-100",
    badge: "abinayan03",
  },
  {
    href: "/mentors",
    label: "Find Mentors",
    description: "Search and connect with experienced mentors matched to your skill needs.",
    icon: Users,
    color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400",
    iconColor: "text-emerald-600 bg-emerald-100",
    badge: "sneha-dhaya-IT",
  },
  {
    href: "/notifications",
    label: "Notifications",
    description: "Stay updated with real-time alerts on replies, mentions, and requests.",
    icon: Bell,
    color: "bg-rose-50 border-rose-200 hover:border-rose-400",
    iconColor: "text-rose-600 bg-rose-100",
    badge: "sneha-dhaya-IT",
  },
  {
    href: "/profile",
    label: "Your Profile",
    description: "Manage your role, bio, tech stack, and view your activity history.",
    icon: User,
    color: "bg-slate-50 border-slate-200 hover:border-slate-400",
    iconColor: "text-slate-600 bg-slate-100",
    badge: "sneha-dhaya-IT",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] to-[#FFEFE6]">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#FFD4B1] text-[#c97a30] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 shadow-sm">
          <Sparkles size={12} />
          Progress 2 — Fully Integrated Build
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-black leading-tight mb-4">
          Connect with Mentors.<br />Build Better Projects.
        </h1>
        <p className="text-base md:text-lg text-black/60 max-w-2xl mx-auto mb-8">
          IdeaBridge brings together student ideas, mentor expertise, and structured collaboration tools in one unified platform.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-black/80 transition-colors"
          >
            Get Started <ArrowRight size={15} />
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 bg-white border border-[#FFD4B1] text-black px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#FFF0E6] transition-colors"
          >
            Explore Ideas
          </Link>
        </div>
      </section>

      {/* Module Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">Platform Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group block border-2 rounded-2xl p-5 bg-white transition-all duration-200 shadow-sm hover:shadow-md ${card.color}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconColor}`}>
                    <Icon size={18} />
                  </div>
                  <ArrowRight size={16} className="text-black/20 group-hover:text-black/60 transition-colors mt-1" />
                </div>
                <h3 className="font-bold text-black text-sm mb-1">{card.label}</h3>
                <p className="text-xs text-black/60 leading-relaxed mb-3">{card.description}</p>
                <span className="text-[10px] font-mono bg-black/5 text-black/40 px-2 py-0.5 rounded-full">
                  @{card.badge}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#FFD4B1] py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-black/40">
          © {new Date().getFullYear()} IdeaBridge — Connect. Learn. Build. &nbsp;|&nbsp; SLIIT · ITPM · Progress 2
        </div>
      </footer>
    </div>
  );
}
