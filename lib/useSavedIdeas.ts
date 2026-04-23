"use client";

import * as React from "react";

import { getSavedIdeaIds, toggleSavedIdeaId } from "@/lib/ideaBookmarks";

export function useSavedIdeas(email?: string) {
  const [savedIdeaIds, setSavedIdeaIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    setSavedIdeaIds(getSavedIdeaIds(email));
  }, [email]);

  const toggleSaved = React.useCallback(
    (ideaId: string) => {
      const nextIds = toggleSavedIdeaId(email, ideaId);
      setSavedIdeaIds(nextIds);
      return nextIds;
    },
    [email]
  );

  return {
    savedIdeaIds,
    isSaved: (ideaId: string) => savedIdeaIds.includes(ideaId),
    toggleSaved,
  };
}
