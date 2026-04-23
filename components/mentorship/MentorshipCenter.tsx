"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, Clock3, MessageSquareText, Send, Sparkles, Users } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/authFetch";
import type {
  MentorshipBookingSlot,
  MentorshipChannelSummary,
  MentorshipMessage,
} from "@/types/mentorship";

type MentorshipCenterProps = {
  role: "student" | "mentor";
};

type SlotDraft = {
  startsAt: string;
  label: string;
};

const DEFAULT_SLOT_DRAFTS: SlotDraft[] = [
  { startsAt: "", label: "Kickoff session" },
  { startsAt: "", label: "Architecture review" },
  { startsAt: "", label: "Progress check-in" },
];

function parseApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  if ("error" in payload && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  return fallback;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function slotStatusTone(slot: MentorshipBookingSlot, confirmedSlotId: string | null) {
  if (slot.id === confirmedSlotId || slot.status === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-[#FFD4B1] bg-[#FFF8F2] text-[#8A4E2A]";
}

export function MentorshipCenter({ role }: MentorshipCenterProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [channels, setChannels] = React.useState<MentorshipChannelSummary[]>([]);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<MentorshipMessage[]>([]);
  const [draftMessage, setDraftMessage] = React.useState("");
  const [slotDrafts, setSlotDrafts] = React.useState<SlotDraft[]>(DEFAULT_SLOT_DRAFTS);
  const [isLoadingChannels, setIsLoadingChannels] = React.useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);
  const [isSendingMessage, setIsSendingMessage] = React.useState(false);
  const [isUpdatingBooking, setIsUpdatingBooking] = React.useState(false);

  const preferredRequestId = searchParams.get("request");

  const selectedChannel = React.useMemo(
    () => channels.find((channel) => channel.requestId === selectedRequestId) ?? null,
    [channels, selectedRequestId]
  );

  const loadChannels = React.useCallback(async () => {
    setIsLoadingChannels(true);
    try {
      const response = await authFetch("/api/mentorships", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiError(payload, "Failed to load mentorship spaces."));
      }

      const rows = Array.isArray(payload) ? (payload as MentorshipChannelSummary[]) : [];
      setChannels(rows);

      const nextRequestId =
        preferredRequestId && rows.some((channel) => channel.requestId === preferredRequestId)
          ? preferredRequestId
          : selectedRequestId && rows.some((channel) => channel.requestId === selectedRequestId)
            ? selectedRequestId
            : rows[0]?.requestId ?? null;

      setSelectedRequestId(nextRequestId);
    } catch (error) {
      setChannels([]);
      setSelectedRequestId(null);
      toast.error(error instanceof Error ? error.message : "Failed to load mentorship spaces.");
    } finally {
      setIsLoadingChannels(false);
    }
  }, [preferredRequestId, selectedRequestId]);

  const loadMessages = React.useCallback(async (requestId: string | null) => {
    if (!requestId) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    try {
      const response = await authFetch(`/api/mentorships/${requestId}/messages`, {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiError(payload, "Failed to load mentorship messages."));
      }

      setMessages(Array.isArray(payload) ? (payload as MentorshipMessage[]) : []);
    } catch (error) {
      setMessages([]);
      toast.error(error instanceof Error ? error.message : "Failed to load mentorship messages.");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  React.useEffect(() => {
    void loadChannels();
  }, [loadChannels]);

  React.useEffect(() => {
    void loadMessages(selectedRequestId);
  }, [loadMessages, selectedRequestId]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      void loadChannels();
      void loadMessages(selectedRequestId);
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadChannels, loadMessages, selectedRequestId]);

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedChannel) return;

    const content = draftMessage.trim();
    if (!content) {
      toast.error("Type a message before sending.");
      return;
    }

    setIsSendingMessage(true);
    try {
      const response = await authFetch(`/api/mentorships/${selectedChannel.requestId}/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiError(payload, "Failed to send message."));
      }

      setDraftMessage("");
      await Promise.all([loadChannels(), loadMessages(selectedChannel.requestId)]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  }

  async function handleProposeSlots() {
    if (!selectedChannel) return;

    const slots = slotDrafts
      .map((slot) => ({
        startsAt: slot.startsAt,
        label: slot.label.trim() || "Mentorship session",
      }))
      .filter((slot) => slot.startsAt);

    if (slots.length === 0) {
      toast.error("Add at least one slot before sending availability.");
      return;
    }

    setIsUpdatingBooking(true);
    try {
      const response = await authFetch(`/api/mentorships/${selectedChannel.requestId}/booking`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action: "propose",
          slots,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiError(payload, "Failed to propose mentorship slots."));
      }

      toast.success("Mentorship slots sent to the student.");
      setSlotDrafts(DEFAULT_SLOT_DRAFTS);
      await loadChannels();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to propose mentorship slots.");
    } finally {
      setIsUpdatingBooking(false);
    }
  }

  async function handleConfirmSlot(slotId: string) {
    if (!selectedChannel) return;

    setIsUpdatingBooking(true);
    try {
      const response = await authFetch(`/api/mentorships/${selectedChannel.requestId}/booking`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action: "confirm",
          slotId,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiError(payload, "Failed to confirm mentorship slot."));
      }

      toast.success("Mentorship slot confirmed.");
      await loadChannels();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm mentorship slot.");
    } finally {
      setIsUpdatingBooking(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="rounded-2xl bg-gradient-to-br from-[#0F0F0F] via-[#1c0f00] to-[#2a1200] p-6 text-[#FFCBA4] shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#FFCBA4]">
              <Sparkles className="h-3.5 w-3.5" />
              Mentorship Space
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              Live chat and booking for active mentorships
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#FFCBA4]/70">
              Use this shared workspace to keep conversations moving, confirm meeting times, and stay aligned on project milestones.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#FFCBA4]/80">
            <div className="font-semibold">{channels.length}</div>
            <div>Active mentorship space{channels.length === 1 ? "" : "s"}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
        <section className="overflow-hidden rounded-2xl border border-[#FFD4B1] bg-white shadow-sm">
          <div className="border-b border-[#FFD4B1] bg-[#FFF8F3] px-5 py-4">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <Users className="h-4 w-4 text-[#c97a30]" />
              Active Mentorships
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoadingChannels ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">Loading mentorship spaces...</div>
            ) : channels.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No accepted mentorship requests yet. Once a request is accepted, the shared chat and booking space appears here.
              </div>
            ) : (
              channels.map((channel) => {
                const counterpart = role === "mentor" ? channel.student : channel.mentor;
                const isActive = selectedRequestId === channel.requestId;
                return (
                  <button
                    key={channel.requestId}
                    type="button"
                    onClick={() => setSelectedRequestId(channel.requestId)}
                    className={`w-full px-5 py-4 text-left transition ${
                      isActive ? "bg-[#FFF4EA]" : "hover:bg-[#FFF8F3]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-slate-800">{channel.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {role === "mentor" ? "Student" : "Mentor"}: {counterpart.fullName}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          channel.requestStatus === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#FFF1E6] text-[#8A4E2A]"
                        }`}
                      >
                        {channel.requestStatus === "completed" ? "Completed" : "Active"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="space-y-5">
          {selectedChannel ? (
            <>
              <div className="rounded-2xl border border-[#FFD4B1] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedChannel.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {selectedChannel.description || "Use this shared mentorship space to coordinate progress and planning."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#FFD4B1] bg-[#FFF8F3] px-4 py-3 text-xs text-[#8A4E2A]">
                    <div className="font-semibold">Participants</div>
                    <div className="mt-1">{selectedChannel.student.fullName}</div>
                    <div>{selectedChannel.mentor.fullName}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#FFD4B1] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <CalendarDays className="h-4 w-4 text-[#c97a30]" />
                    Booking & Session Planning
                  </h3>
                  {selectedChannel.booking.confirmedSlotId ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Session confirmed
                    </span>
                  ) : null}
                </div>

                {selectedChannel.booking.slots.length > 0 ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {selectedChannel.booking.slots.map((slot) => {
                      const isConfirmed =
                        slot.id === selectedChannel.booking.confirmedSlotId || slot.status === "confirmed";
                      return (
                        <div
                          key={slot.id}
                          className={`rounded-2xl border px-4 py-4 ${slotStatusTone(
                            slot,
                            selectedChannel.booking.confirmedSlotId
                          )}`}
                        >
                          <div className="text-sm font-semibold">{slot.label}</div>
                          <div className="mt-1 text-xs">
                            {formatDateTime(slot.startsAt)} to {formatDateTime(slot.endsAt)}
                          </div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.14em] opacity-80">
                            Proposed by {slot.proposedBy}
                          </div>
                          {role === "student" && !selectedChannel.booking.confirmedSlotId ? (
                            <button
                              type="button"
                              onClick={() => void handleConfirmSlot(slot.id)}
                              disabled={isUpdatingBooking}
                              className="mt-3 rounded-xl bg-[#0F0F0F] px-4 py-2 text-xs font-semibold text-[#FFCBA4] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Confirm this slot
                            </button>
                          ) : isConfirmed ? (
                            <div className="mt-3 text-xs font-semibold">Confirmed session slot</div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-[#FFD4B1] bg-[#FFF8F3] px-4 py-5 text-sm text-slate-500">
                    No slots proposed yet. {role === "mentor" ? "Share a few time options below." : "Wait for your mentor to propose availability."}
                  </div>
                )}

                {role === "mentor" && !selectedChannel.booking.confirmedSlotId ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-800">Propose mentorship slots</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {slotDrafts.map((slot, index) => (
                        <div key={`${index}-${slot.label}`} className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {slot.label}
                          </label>
                          <input
                            type="datetime-local"
                            value={slot.startsAt}
                            onChange={(event) =>
                              setSlotDrafts((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, startsAt: event.target.value } : item
                                )
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleProposeSlots()}
                      disabled={isUpdatingBooking}
                      className="mt-4 rounded-xl bg-[#0F0F0F] px-4 py-2.5 text-sm font-semibold text-[#FFCBA4] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Send availability
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#FFD4B1] bg-white shadow-sm">
                <div className="border-b border-[#FFD4B1] bg-[#FFF8F3] px-5 py-4">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                    <MessageSquareText className="h-4 w-4 text-[#c97a30]" />
                    Live Mentorship Chat
                  </h3>
                </div>

                <div className="max-h-[420px] space-y-4 overflow-y-auto px-5 py-5">
                  {isLoadingMessages ? (
                    <div className="text-sm text-slate-500">Loading chat...</div>
                  ) : messages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#FFD4B1] bg-[#FFF8F3] px-4 py-5 text-sm text-slate-500">
                      No messages yet. Start the conversation to align on goals and next steps.
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isMine = message.authorId === user?.id;
                      return (
                        <article
                          key={message.id}
                          className={`max-w-3xl rounded-2xl border px-4 py-3 ${
                            isMine
                              ? "ml-auto border-[#0F0F0F] bg-[#0F0F0F] text-[#FFCBA4]"
                              : "border-[#FFD4B1] bg-[#FFF8F3] text-slate-700"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                            <span>{message.authorName}</span>
                            <span className={isMine ? "text-[#FFCBA4]/70" : "text-slate-400"}>
                              {message.authorRole}
                            </span>
                            <span className={isMine ? "text-[#FFCBA4]/70" : "text-slate-400"}>
                              <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                              {formatDateTime(message.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                        </article>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="border-t border-slate-100 bg-white px-5 py-4">
                  <div className="flex gap-3">
                    <textarea
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      rows={3}
                      placeholder="Send a progress update, ask a question, or confirm the next step..."
                      className="min-h-[88px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
                    />
                    <button
                      type="submit"
                      disabled={isSendingMessage}
                      className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#0F0F0F] px-5 py-3 text-sm font-semibold text-[#FFCBA4] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      {isSendingMessage ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#FFD4B1] bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
              Select an accepted mentorship to open its chat and booking workspace.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
