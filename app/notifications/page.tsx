import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] to-[#FFEFE6] p-6 md:p-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#FFD4B1] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
          <Bell size={14} />
          Notifications
        </div>
        <h1 className="text-2xl font-extrabold text-black">Your Notification Center</h1>
        <p className="mt-2 text-sm text-black/60">
          Notification UI is now wired to a first-class route. Hook this page to
          the notifications API to render unread and read updates.
        </p>
      </div>
    </div>
  );
}