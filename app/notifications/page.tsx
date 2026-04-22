"use client";

import * as React from "react";
import { Bell, CheckCircle2, Clock3 } from "lucide-react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { authFetch } from "@/lib/authFetch";

type NotificationRecord = {
  id: string;
  type: string;
  payload?: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsView />
    </RequireAuth>
  );
}

function NotificationsView() {
  const [notifications, setNotifications] = React.useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await authFetch("/api/notifications", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as NotificationRecord[] | { error?: string } | null;

        if (!response.ok) {
          const message =
            payload &&
            typeof payload === "object" &&
            !Array.isArray(payload) &&
            "error" in payload
              ? payload.error
              : undefined;
          throw new Error(message || "Failed to load notifications.");
        }

        if (!cancelled) {
          setNotifications(Array.isArray(payload) ? payload : []);
        }
      } catch (error) {
        if (!cancelled) {
          setNotifications([]);
          setLoadError(error instanceof Error ? error.message : "Failed to load notifications.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFF4EA] to-[#FFEBDD] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[30px] border border-[#FFD4B1] bg-white/90 p-6 shadow-[0_30px_65px_-46px_rgba(63,31,7,0.35)] backdrop-blur sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFF1E6] px-3 py-1 text-xs font-semibold text-[#8A4E2A]">
            <Bell size={14} />
            Notifications
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F0F0F]">Your notification center</h1>
          <p className="mt-2 text-sm leading-6 text-[#5D4739]">
            Track new mentorship requests, updates, and system activity from one place.
          </p>

          {loadError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
          ) : null}

          <div className="mt-6 space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border border-[#FFD7BC] bg-[#FFF8F2] px-4 py-6 text-sm text-[#8A4E2A]">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-2xl border border-[#FFD7BC] bg-[#FFF8F2] px-4 py-6 text-sm text-[#8A4E2A]">
                No notifications yet. Activity updates will appear here as the platform usage grows.
              </div>
            ) : (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`rounded-2xl border px-4 py-4 shadow-sm ${
                    notification.read
                      ? "border-[#FFE1CC] bg-[#FFF9F4]"
                      : "border-[#FFD4B1] bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 rounded-full p-2 ${
                          notification.read ? "bg-[#FFF1E6] text-[#8A4E2A]" : "bg-[#0F0F0F] text-[#FFCBA4]"
                        }`}
                      >
                        {notification.read ? <CheckCircle2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0F0F0F]">{formatNotificationTitle(notification)}</p>
                        <p className="mt-1 text-sm leading-6 text-[#5D4739]">{formatNotificationBody(notification)}</p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-[#8A4E2A]/80">
                        <Clock3 className="h-3.5 w-3.5" />
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNotificationTitle(notification: NotificationRecord) {
  if (notification.type === "mentorship_request") {
    return "New mentorship request";
  }

  return notification.type.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatNotificationBody(notification: NotificationRecord) {
  const title = typeof notification.payload?.title === "string" ? notification.payload.title : "";
  if (notification.type === "mentorship_request" && title) {
    return `A student submitted a mentorship request for "${title}".`;
  }

  return "A new platform update is available for your review.";
}
