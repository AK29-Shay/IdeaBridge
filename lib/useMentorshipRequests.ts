"use client";

import * as React from "react";

import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/authFetch";
import type {
  CreateMentorshipRequestInput,
  MentorshipRequestRecord,
  MentorshipRequestStatus,
} from "@/types/request";

function parseClientError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;

  if ("error" in payload && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return fallback;
}

async function readJson<T>(response: Response) {
  return response.json().catch(() => null) as Promise<T | null>;
}

export function useMentorshipRequests() {
  const { user, isReady } = useAuth();
  const [requests, setRequests] = React.useState<MentorshipRequestRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadRequests = React.useCallback(async () => {
    if (!isReady) return [];
    if (!user) {
      setRequests([]);
      setError(null);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch("/api/requests", { cache: "no-store" });
      const payload = await readJson<MentorshipRequestRecord[] | { error?: string }>(response);

      if (!response.ok) {
        throw new Error(parseClientError(payload, "Failed to load mentorship requests."));
      }

      const nextRequests = Array.isArray(payload) ? payload : [];
      setRequests(nextRequests);
      return nextRequests;
    } catch (nextError) {
      const message =
        nextError instanceof Error ? nextError.message : "Failed to load mentorship requests.";
      setError(message);
      setRequests([]);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  }, [isReady, user]);

  React.useEffect(() => {
    if (!isReady || !user) return;
    void loadRequests().catch(() => {});
  }, [isReady, user, loadRequests]);

  const createRequest = React.useCallback(async (input: CreateMentorshipRequestInput) => {
    const response = await authFetch("/api/requests", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const payload = await readJson<MentorshipRequestRecord | { error?: string }>(response);
    if (!response.ok || !payload || Array.isArray(payload)) {
      throw new Error(parseClientError(payload, "Failed to submit mentorship request."));
    }

    const nextRequest = payload as MentorshipRequestRecord;
    setRequests((current) => [nextRequest, ...current]);
    return nextRequest;
  }, []);

  const updateRequestStatus = React.useCallback(
    async (requestId: string, status: MentorshipRequestStatus) => {
      const response = await authFetch("/api/requests/status", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          status,
        }),
      });

      const payload = await readJson<MentorshipRequestRecord | { error?: string }>(response);
      if (!response.ok || !payload || Array.isArray(payload)) {
        throw new Error(parseClientError(payload, "Failed to update mentorship request."));
      }

      const updatedRequest = payload as MentorshipRequestRecord;
      setRequests((current) =>
        current.map((request) => (request.id === requestId ? { ...request, ...updatedRequest } : request))
      );

      return updatedRequest;
    },
    []
  );

  return {
    requests,
    isLoading,
    error,
    refreshRequests: loadRequests,
    createRequest,
    updateRequestStatus,
  };
}
