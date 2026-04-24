type IdeaRefinementInput = {
  title?: string;
  description?: string;
  techStack?: string[];
  variant?: string;
};

export type IdeaRefinementResult = {
  refinedTitle: string;
  refinedDescription: string;
  recommendedTags: string[];
  checklist: string[];
  rationale: string[];
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeTags(tags: unknown) {
  if (!Array.isArray(tags)) return [];

  return Array.from(
    new Set(
      tags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter(Boolean)
        .map((tag) => toTitleCase(tag))
    )
  );
}

function extractProblemStatement(description: string) {
  if (!description) {
    return "Students and mentors need a clearer workflow for collaboration, feedback, and measurable progress.";
  }

  const firstSentence = description
    .split(/\n+/)
    .map((segment) => segment.trim())
    .find(Boolean);

  return firstSentence || description;
}

function inferAudience(variant: string) {
  const normalized = variant.toLowerCase();
  if (normalized.includes("campus")) return "campus supervisors and academic stakeholders";
  if (normalized.includes("ai")) return "student builders exploring AI-assisted delivery";
  if (normalized.includes("project")) return "student teams and assigned mentors";
  return "students who need actionable project guidance";
}

export function refineIdeaDraft(input: IdeaRefinementInput): IdeaRefinementResult {
  const title = normalizeString(input.title);
  const description = normalizeString(input.description);
  const variant = normalizeString(input.variant) || "Idea";
  const tags = normalizeTags(input.techStack);

  const refinedTitle = title
    ? title.includes(":")
      ? title
      : `${title}: Outcome-Focused ${variant}`
    : "IdeaBridge Concept: Outcome-Focused Student Collaboration";

  const problemStatement = extractProblemStatement(description);
  const audience = inferAudience(variant);
  const stackLine =
    tags.length > 0
      ? `- Suggested stack emphasis: ${tags.join(", ")}`
      : "- Suggested stack emphasis: call out the core technologies that make the build credible";

  const refinedDescription = [
    `## Problem`,
    `${problemStatement}`,
    ``,
    `## Target Outcome`,
    `Deliver a solution for ${audience} with a clear user journey, measurable milestone flow, and visible value during the demo.`,
    ``,
    `## Key Experience`,
    `- Show how a user discovers the feature, starts using it, and reaches a concrete result`,
    `- Highlight how mentors, students, or admins stay aligned through the workflow`,
    `${stackLine}`,
    ``,
    `## Demo-Ready Scope`,
    `- Prioritize the minimum set of CRUD and navigation states needed for a live walkthrough`,
    `- Include one strong success metric or validation signal to prove the idea is useful`,
  ].join("\n");

  const recommendedTags = Array.from(
    new Set([
      ...tags,
      variant.includes("AI") ? "AI Workflow" : "Student Collaboration",
      "Mentorship",
      "Product Thinking",
    ])
  ).slice(0, 6);

  const checklist = [
    "Clarify the user problem in one sentence",
    "Name the primary user and their desired outcome",
    "Show one end-to-end flow that can be demonstrated live",
    "Mention the core data entities or CRUD states involved",
    "Call out the strongest implementation or architecture choice",
  ];

  const rationale = [
    "Makes the idea easier to explain in a short viva demo",
    "Turns a feature list into a clear before-and-after story",
    "Highlights implementation depth without losing the user value",
  ];

  return {
    refinedTitle,
    refinedDescription,
    recommendedTags,
    checklist,
    rationale,
  };
}
