export type RecommendationPost = {
  id: string;
  title: string;
  description: string;
  type: "full_project" | "idea" | "ai_driven" | "campus_req";
  mode: "post" | "request";
  author: string;
  role: string;
  tags: string[];
  views: number;
};

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

export function buildIdeaRecommendations(
  posts: RecommendationPost[],
  savedIdeaIds: string[],
  limit = 6
) {
  const savedSet = new Set(savedIdeaIds);
  const savedPosts = posts.filter((post) => savedSet.has(post.id));

  const preferredTags = new Map<string, number>();
  const preferredTypes = new Map<string, number>();

  for (const post of savedPosts) {
    preferredTypes.set(post.type, (preferredTypes.get(post.type) ?? 0) + 1);

    for (const tag of post.tags.map(normalizeTag)) {
      preferredTags.set(tag, (preferredTags.get(tag) ?? 0) + 1);
    }
  }

  const scored = posts
    .filter((post) => !savedSet.has(post.id))
    .map((post) => {
      const matchingTags = post.tags.map(normalizeTag);
      const tagScore = matchingTags.reduce(
        (total, tag) => total + (preferredTags.get(tag) ?? 0) * 3,
        0
      );
      const typeScore = (preferredTypes.get(post.type) ?? 0) * 4;
      const mentorBonus = post.role.toLowerCase() === "mentor" ? 2 : 0;
      const popularityScore = Math.min(post.views / 25, 6);
      const freshRequestBonus = post.mode === "request" ? 1 : 0;

      return {
        post,
        score: tagScore + typeScore + mentorBonus + popularityScore + freshRequestBonus,
      };
    })
    .sort((left, right) => right.score - left.score || right.post.views - left.post.views);

  if (scored.length === 0) {
    return [];
  }

  const recommended = savedPosts.length > 0 ? scored : scored.sort((left, right) => right.post.views - left.post.views);
  return recommended.slice(0, limit).map((entry) => entry.post);
}
