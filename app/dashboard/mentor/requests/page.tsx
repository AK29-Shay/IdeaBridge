"use client";

import { toast } from "sonner";

import { RequestsSection } from "@/components/mentor/RequestsSection";
import { useMentorshipRequests } from "@/lib/useMentorshipRequests";

export default function MentorRequestsPage() {
  const { requests, updateRequestStatus } = useMentorshipRequests();

  return (
    <RequestsSection
      requests={requests}
      onUpdateRequest={async (requestId, status) => {
        try {
          await updateRequestStatus(requestId, status);
          toast.success(status === "in_progress" ? "Request accepted." : "Request declined.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed to update request.");
        }
      }}
    />
  );
}
