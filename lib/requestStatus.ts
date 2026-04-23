import type { MentorshipRequestStatus } from "@/types/request";

export function getRequestStatusLabel(status: MentorshipRequestStatus) {
  switch (status) {
    case "open":
      return "Pending";
    case "in_progress":
      return "Accepted";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Declined";
  }
}

export function getRequestStatusTone(status: MentorshipRequestStatus) {
  switch (status) {
    case "open":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-400",
      };
    case "in_progress":
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "completed":
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
      };
    case "cancelled":
      return {
        badge: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
      };
  }
}

export function isPendingRequest(status: MentorshipRequestStatus) {
  return status === "open";
}

export function isActiveRequest(status: MentorshipRequestStatus) {
  return status === "in_progress";
}

export function isClosedRequest(status: MentorshipRequestStatus) {
  return status === "completed" || status === "cancelled";
}
