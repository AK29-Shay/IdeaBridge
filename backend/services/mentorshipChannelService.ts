import supabaseServer from "../config/supabaseServer";
import { getRequestById, listRequestsForUser } from "./requestService";
import type { MentorshipRequestStatus, MentorshipRequestType } from "@/types/request";
import type {
  MentorshipBookingSlot,
  MentorshipBookingState,
  MentorshipChannelSummary,
  MentorshipMessage,
  MentorshipParticipant,
} from "@/types/mentorship";

const MENTORSHIP_MODULE = "mentorship_chat_booking";
const AUTH_USERS_PAGE_SIZE = 200;

type RequestRow = {
  id: string;
  student_id: string | null;
  title: string;
  description: string | null;
  deadline: string | null;
  type: MentorshipRequestType | null;
  status: MentorshipRequestStatus;
  assigned_mentor: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type ChannelPostRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  dynamic_content: unknown;
  created_at: string;
  updated_at: string;
};

type ChannelMessageRow = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type AuthAdminUser = {
  id?: string;
  email?: string | null;
};

export class MentorshipChannelError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeRole(value: unknown): "Student" | "Mentor" | "Admin" {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (raw === "mentor") return "Mentor";
  if (raw === "admin") return "Admin";
  return "Student";
}

function toObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function formatDisplayName(email: string) {
  const username = email.split("@")[0] || "member";
  const parts = username.replace(/[._-]+/g, " ").split(" ").filter(Boolean);
  if (parts.length === 0) return "Member";
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .slice(0, 64);
}

function toParticipant(id: string, profile: ProfileRow | undefined): MentorshipParticipant {
  return {
    id,
    fullName: normalizeString(profile?.full_name) || "IdeaBridge Member",
    avatarUrl:
      normalizeString(profile?.avatar_url) || `https://i.pravatar.cc/150?u=${encodeURIComponent(id)}`,
    role: normalizeRole(profile?.role),
  };
}

function isChannelPost(row: ChannelPostRow, requestId: string) {
  const dynamic = toObject(row.dynamic_content);
  return (
    normalizeString(dynamic.module) === MENTORSHIP_MODULE &&
    normalizeString(dynamic.requestId) === requestId
  );
}

function normalizeBookingSlot(
  value: unknown,
  fallbackIndex: number
): MentorshipBookingSlot | null {
  const slot = toObject(value);
  const startsAt = normalizeString(slot.startsAt);
  if (!startsAt) return null;

  const endCandidate = normalizeString(slot.endsAt);
  const startsDate = new Date(startsAt);
  const endsAt =
    endCandidate ||
    (Number.isNaN(startsDate.getTime())
      ? startsAt
      : new Date(startsDate.getTime() + 60 * 60 * 1000).toISOString());

  const proposedBy = normalizeString(slot.proposedBy) === "student" ? "student" : "mentor";
  const status = normalizeString(slot.status) === "confirmed" ? "confirmed" : "open";

  return {
    id: normalizeString(slot.id) || `slot-${fallbackIndex + 1}`,
    startsAt,
    endsAt,
    label: normalizeString(slot.label) || "Mentorship session",
    proposedBy,
    status,
  };
}

function readBookingState(dynamicContent: unknown): MentorshipBookingState {
  const dynamic = toObject(dynamicContent);
  const booking = toObject(dynamic.booking);
  const slots = Array.isArray(booking.slots)
    ? booking.slots
        .map((slot, index) => normalizeBookingSlot(slot, index))
        .filter((slot): slot is MentorshipBookingSlot => Boolean(slot))
    : [];

  return {
    slots,
    confirmedSlotId: normalizeString(booking.confirmedSlotId) || null,
    confirmedAt: normalizeString(booking.confirmedAt) || null,
  };
}

async function ensureAuthUserIdByEmail(params: {
  email: string;
  name?: string;
  role?: string;
}): Promise<string> {
  const email = normalizeEmail(params.email);
  if (!email) {
    throw new MentorshipChannelError("actorEmail is required.", 400);
  }

  let page = 1;
  let userId: string | null = null;

  while (page <= 10 && !userId) {
    const { data, error } = await supabaseServer.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PAGE_SIZE,
    });

    if (error) {
      throw new MentorshipChannelError(error.message, 500);
    }

    const existing = data.users.find((entry: AuthAdminUser) => normalizeEmail(entry.email) === email);
    if (existing?.id) {
      userId = existing.id;
      break;
    }

    if (data.users.length < AUTH_USERS_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  if (!userId) {
    const password = `IdeaBridge_${Date.now()}_Aa1!`;
    const { data, error } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: normalizeString(params.name) || formatDisplayName(email),
      },
    });

    if (error || !data.user?.id) {
      throw new MentorshipChannelError(error?.message || "Failed to create actor account.", 500);
    }

    userId = data.user.id;
  }

  const { error } = await supabaseServer.from("profiles").upsert(
    {
      id: userId,
      full_name: normalizeString(params.name) || formatDisplayName(email),
      role: normalizeRole(params.role),
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new MentorshipChannelError(error.message, 500);
  }

  if (!userId) {
    throw new MentorshipChannelError("Failed to resolve actor account.", 500);
  }

  return userId;
}

async function loadProfiles(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const { data, error } = await supabaseServer
    .from("profiles")
    .select("id,full_name,avatar_url,role")
    .in("id", userIds);

  if (error) {
    throw new MentorshipChannelError(error.message, 500);
  }

  const profileMap = new Map<string, ProfileRow>();
  for (const row of (data ?? []) as ProfileRow[]) {
    profileMap.set(row.id, row);
  }

  return profileMap;
}

async function loadRequestOrThrow(requestId: string) {
  const request = (await getRequestById(requestId)) as RequestRow | null;

  if (!request) {
    throw new MentorshipChannelError("Mentorship request not found.", 404);
  }

  if (!request.student_id || !request.assigned_mentor) {
    throw new MentorshipChannelError("Mentorship request is missing participants.", 400);
  }

  if (request.status !== "in_progress" && request.status !== "completed") {
    throw new MentorshipChannelError(
      "Mentorship channels are available only for accepted or completed requests.",
      400
    );
  }

  return request;
}

async function loadChannelPost(requestId: string) {
  const { data, error } = await supabaseServer
    .from("posts")
    .select("id,user_id,title,description,dynamic_content,created_at,updated_at")
    .contains("dynamic_content", { module: MENTORSHIP_MODULE, requestId })
    .maybeSingle();

  if (error) {
    throw new MentorshipChannelError(error.message, 500);
  }

  return data ? (data as ChannelPostRow) : null;
}

async function createChannelPost(request: RequestRow) {
  const dynamicContent = {
    module: MENTORSHIP_MODULE,
    requestId: request.id,
    studentId: request.student_id,
    mentorId: request.assigned_mentor,
    booking: {
      slots: [],
      confirmedSlotId: null,
      confirmedAt: null,
    },
  };

  const { data, error } = await supabaseServer
    .from("posts")
    .insert({
      user_id: request.student_id,
      post_mode: "post",
      post_type: request.type === "specific_idea" ? "idea" : "full_project",
      title: request.title,
      description: request.description,
      dynamic_content: dynamicContent,
      tech_stack: [],
    })
    .select("id,user_id,title,description,dynamic_content,created_at,updated_at")
    .single();

  if (error) {
    throw new MentorshipChannelError(error.message, 500);
  }

  return data as ChannelPostRow;
}

function mapChannelSummary(
  request: RequestRow,
  channel: ChannelPostRow,
  profileMap: Map<string, ProfileRow>
): MentorshipChannelSummary {
  return {
    requestId: request.id,
    channelId: channel.id,
    title: channel.title,
    description: normalizeString(channel.description),
    requestStatus: request.status === "completed" ? "completed" : "in_progress",
    student: toParticipant(request.student_id as string, profileMap.get(request.student_id as string)),
    mentor: toParticipant(
      request.assigned_mentor as string,
      profileMap.get(request.assigned_mentor as string)
    ),
    booking: readBookingState(channel.dynamic_content),
    createdAt: channel.created_at,
    updatedAt: channel.updated_at,
  };
}

export async function ensureMentorshipChannel(requestId: string) {
  const request = await loadRequestOrThrow(requestId);
  let channel = await loadChannelPost(requestId);

  if (!channel) {
    channel = await createChannelPost(request);
  }

  if (!isChannelPost(channel, requestId)) {
    throw new MentorshipChannelError("Mentorship channel is invalid.", 500);
  }

  const profiles = await loadProfiles([request.student_id as string, request.assigned_mentor as string]);
  return mapChannelSummary(request, channel, profiles);
}

export async function listMentorshipChannelsForUser(userId: string, role?: string) {
  const requests = (await listRequestsForUser(userId, role)) as RequestRow[];
  const activeRequests = requests.filter(
    (request) => request.status === "in_progress" || request.status === "completed"
  );

  const channels: MentorshipChannelSummary[] = [];
  for (const request of activeRequests) {
    channels.push(await ensureMentorshipChannel(request.id));
  }

  return channels.sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

export async function listMentorshipMessages(requestId: string) {
  const channel = await ensureMentorshipChannel(requestId);
  const { data, error } = await supabaseServer
    .from("comments")
    .select("id,post_id,user_id,content,created_at")
    .eq("post_id", channel.channelId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new MentorshipChannelError(error.message, 500);
  }

  const rows = (data ?? []) as ChannelMessageRow[];
  const profileMap = await loadProfiles(Array.from(new Set(rows.map((row) => row.user_id))));

  return rows.map((row): MentorshipMessage => {
    const profile = profileMap.get(row.user_id);
    return {
      id: row.id,
      authorId: row.user_id,
      authorName: normalizeString(profile?.full_name) || "IdeaBridge Member",
      authorAvatarUrl:
        normalizeString(profile?.avatar_url) ||
        `https://i.pravatar.cc/150?u=${encodeURIComponent(row.user_id)}`,
      authorRole: normalizeRole(profile?.role),
      content: row.content,
      createdAt: row.created_at,
    };
  });
}

export async function createMentorshipMessage(
  requestId: string,
  input: {
    actorEmail: string;
    actorName?: string;
    actorRole?: string;
    content: string;
  }
) {
  const channel = await ensureMentorshipChannel(requestId);
  const actorId = await ensureAuthUserIdByEmail({
    email: input.actorEmail,
    name: input.actorName,
    role: input.actorRole,
  });
  const content = normalizeString(input.content);

  if (!content) {
    throw new MentorshipChannelError("Message content is required.", 400);
  }

  const { data, error } = await supabaseServer
    .from("comments")
    .insert({
      post_id: channel.channelId,
      user_id: actorId,
      content,
    })
    .select("id,post_id,user_id,content,created_at")
    .single();

  if (error) {
    throw new MentorshipChannelError(error.message, 500);
  }

  const profileMap = await loadProfiles([actorId]);
  const profile = profileMap.get(actorId);

  return {
    id: data.id,
    authorId: actorId,
    authorName: normalizeString(profile?.full_name) || "IdeaBridge Member",
    authorAvatarUrl:
      normalizeString(profile?.avatar_url) ||
      `https://i.pravatar.cc/150?u=${encodeURIComponent(actorId)}`,
    authorRole: normalizeRole(profile?.role),
    content: data.content,
    createdAt: data.created_at,
  } satisfies MentorshipMessage;
}

function nextBookingSlot(
  slot: { startsAt: string; endsAt?: string; label?: string },
  proposedBy: "student" | "mentor"
): MentorshipBookingSlot {
  const startsAt = normalizeString(slot.startsAt);
  if (!startsAt) {
    throw new MentorshipChannelError("Booking slots must include a start time.", 400);
  }

  const startsDate = new Date(startsAt);
  if (Number.isNaN(startsDate.getTime())) {
    throw new MentorshipChannelError("Booking slots must use valid ISO date-time values.", 400);
  }

  const endsAt =
    normalizeString(slot.endsAt) ||
    new Date(startsDate.getTime() + 60 * 60 * 1000).toISOString();

  return {
    id: crypto.randomUUID(),
    startsAt: startsDate.toISOString(),
    endsAt,
    label: normalizeString(slot.label) || "Mentorship session",
    proposedBy,
    status: "open",
  };
}

export async function updateMentorshipBooking(
  requestId: string,
  input:
    | {
        action: "propose";
        proposedBy: "student" | "mentor";
        slots: Array<{ startsAt: string; endsAt?: string; label?: string }>;
      }
    | {
        action: "confirm";
        slotId: string;
      }
) {
  const request = await loadRequestOrThrow(requestId);
  const channel = await loadChannelPost(requestId);

  if (!channel) {
    throw new MentorshipChannelError("Mentorship channel not found.", 404);
  }

  const dynamic = toObject(channel.dynamic_content);
  const booking = readBookingState(channel.dynamic_content);

  const nextBooking =
    input.action === "propose"
      ? {
          slots: input.slots.map((slot) => nextBookingSlot(slot, input.proposedBy)),
          confirmedSlotId: null,
          confirmedAt: null,
        }
      : (() => {
          const confirmedSlot = booking.slots.find((slot) => slot.id === input.slotId);
          if (!confirmedSlot) {
            throw new MentorshipChannelError("Selected booking slot was not found.", 404);
          }

          return {
            slots: booking.slots.map((slot) => ({
              ...slot,
              status: slot.id === input.slotId ? "confirmed" : "open",
            })),
            confirmedSlotId: confirmedSlot.id,
            confirmedAt: new Date().toISOString(),
          };
        })();

  const { data, error } = await supabaseServer
    .from("posts")
    .update({
      dynamic_content: {
        ...dynamic,
        booking: nextBooking,
      },
    })
    .eq("id", channel.id)
    .select("id,user_id,title,description,dynamic_content,created_at,updated_at")
    .single();

  if (error) {
    throw new MentorshipChannelError(error.message, 500);
  }

  const profiles = await loadProfiles([request.student_id as string, request.assigned_mentor as string]);
  return mapChannelSummary(request, data as ChannelPostRow, profiles);
}
