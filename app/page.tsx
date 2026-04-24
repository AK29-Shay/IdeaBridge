import Link from "next/link";
import { Lightbulb, Search, BarChart3, Users, Bell, User, ArrowRight, Sparkles } from "lucide-react";

const MODULE_CARDS = [
  {
    href: "/ideas/explore",
    label: "Idea & Guidance",
    description: "Post your project ideas, request guidance, and engage in threaded discussions.",
    icon: Lightbulb,
    color: "bg-[#FFF9F3] border-[#E7DED4] hover:border-[#E8B86D]",
    iconColor: "text-[#C86B4A] bg-[#F6E7D8]",
    badge: "AK29-Shay",
  },
  {
    href: "/search",
    label: "Explore & Search",
    description: "Discover trending projects, filter by tech stack, and find relevant ideas.",
    icon: Search,
    color: "bg-[#FFF9F3] border-[#E7DED4] hover:border-[#E8B86D]",
    iconColor: "text-[#C86B4A] bg-[#F6E7D8]",
    badge: "NethminiChinthana101",
  },
  {
    href: "/dashboard",
    label: "Analytics",
    description: "Track engagement metrics, view weekly activity, and top posts at a glance.",
    icon: BarChart3,
    color: "bg-[#FFF9F3] border-[#E7DED4] hover:border-[#E8B86D]",
    iconColor: "text-[#C86B4A] bg-[#F6E7D8]",
    badge: "abinayan03",
  },
  {
    href: "/mentors",
    label: "Find Mentors",
    description: "Search and connect with experienced mentors matched to your skill needs.",
    icon: Users,
    color: "bg-[#FFF9F3] border-[#E7DED4] hover:border-[#E8B86D]",
    iconColor: "text-[#C86B4A] bg-[#F6E7D8]",
    badge: "sneha-dhaya-IT",
  },
  {
    href: "/notifications",
    label: "Notifications",
    description: "Stay updated with real-time alerts on replies, mentions, and requests.",
    icon: Bell,
    color: "bg-[#FFF9F3] border-[#E7DED4] hover:border-[#E8B86D]",
    iconColor: "text-[#C86B4A] bg-[#F6E7D8]",
    badge: "sneha-dhaya-IT",
  },
  {
    href: "/profile",
    label: "Your Profile",
    description: "Manage your role, bio, tech stack, and view your activity history.",
    icon: User,
    color: "bg-[#FFF9F3] border-[#E7DED4] hover:border-[#E8B86D]",
    iconColor: "text-[#C86B4A] bg-[#F6E7D8]",
    badge: "sneha-dhaya-IT",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] app-page-enter">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
       
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1F2933] leading-tight mb-4">
          Connect with Mentors.<br />Build Better Projects.
        </h1>
        <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto mb-8">
          IdeaBridge brings together student ideas, mentor expertise, and structured collaboration tools in one unified platform.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/register"
            className="premium-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            Get Started <ArrowRight size={15} />
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 bg-white border border-[#E7DED4] text-[#1F2933] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#FFF9F3] transition-colors"
          >
            Explore Ideas
          </Link>
        </div>
      </section>

      {/* Module Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-4">Platform Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group block siri-border border rounded-2xl p-5 transition-all duration-200 ${card.color}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconColor}`}>
                    <Icon size={18} />
                  </div>
                  <ArrowRight size={16} className="text-[#6B7280] group-hover:text-[#1F2933] transition-colors mt-1" />
                </div>
                <h3 className="font-bold text-[#1F2933] text-sm mb-1">{card.label}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed mb-3">{card.description}</p>
                <span className="text-[10px] font-mono bg-[#FFF9F3] text-[#6B7280] px-2 py-0.5 rounded-full border border-[#E7DED4]">
                  @{card.badge}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7DED4] py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-[#6B7280]">
          © {new Date().getFullYear()} IdeaBridge — Connect. Learn. Build. &nbsp;|&nbsp; SLIIT · ITPM 2024 &nbsp;|&nbsp; Developed by <span className="font-bold text-[#1F2933]">Akshayan, Nethmini, abinayan, Dhayabari</span>
        </div>
      </footer>
    </div>
  );
}
