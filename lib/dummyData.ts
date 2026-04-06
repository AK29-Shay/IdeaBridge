import type { AvailabilityStatus } from "@/types/auth";
import type { Mentor, MentorProfile } from "@/types/mentor";
import type { ProjectProgressStatus } from "@/types/auth";
import type { StudentProject } from "@/types/project";

export const IDEABRIDGE_STORAGE_KEYS = {
  users: "ideabridge_users_v1",
  auth: "ideabridge_auth_v1",
  projects: "ideabridge_projects_v1",
} as const;

const availabilityColorMap: Record<AvailabilityStatus, "green" | "yellow" | "red"> = {
  "Available Now": "green",
  "Available in 1-2 days": "yellow",
  Busy: "red",
  "On Leave": "red",
};

export function getAvailabilityColor(status: AvailabilityStatus): "green" | "yellow" | "red" {
  return availabilityColorMap[status];
}

export const ALL_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "Python",
  "Machine Learning",
  "System Design",
  "Databases",
  "UI/UX",
] as const;

function makeMentorProfile(input: Omit<MentorProfile, "portfolioLinks"> & { portfolioLinks?: string[] }): MentorProfile {
  return {
    ...input,
    portfolioLinks: input.portfolioLinks ?? [],
  };
}

export const DUMMY_MENTORS: Mentor[] = [
  {
    id: "m-aria",
    fullName: "Dr. Aria Chen",
    email: "aria.mentor@ideabridge.dev",
    rating: 4.9,
    profile: makeMentorProfile({
      bio: "Senior front-end engineer and university mentor focused on structured feedback and clean architecture. I help students ship production-quality features with confidence.",
      skills: ["React", "Next.js", "TypeScript", "UI/UX"],
      availability: "Full-time",
      availabilityStatus: "Available Now",
      yearsExperience: 8,
      linkedIn: "https://linkedin.com/in/aria-chen",
      github: "https://github.com/ariachen",
      portfolioLinks: ["https://ariachen.dev"],
      availabilityCalendarNote: "Best for weekly check-ins and code reviews.",
      avatarUrl: "",
    }),
  },
  {
    id: "m-malik",
    fullName: "Prof. Malik Johnson",
    email: "malik.mentor@ideabridge.dev",
    rating: 4.7,
    profile: makeMentorProfile({
      bio: "Backend + system design mentor. I prioritize milestones, risk management, and pragmatic engineering trade-offs for student teams.",
      skills: ["System Design", "Databases", "Node.js", "Python"],
      availability: "Part-time",
      availabilityStatus: "Available in 1-2 days",
      yearsExperience: 10,
      linkedIn: "https://linkedin.com/in/malik-johnson",
      github: "https://github.com/malikjohnson",
      portfolioLinks: ["https://malikjohnson.net"],
      availabilityCalendarNote: "Typically responds between project milestones.",
      avatarUrl: "",
    }),
  },
  {
    id: "m-sophia",
    fullName: "Sophia Rivera",
    email: "sophia.mentor@ideabridge.dev",
    rating: 4.6,
    profile: makeMentorProfile({
      bio: "ML + applied engineering mentor. I help you break down complex learning goals into implementable steps and measurable progress.",
      skills: ["Machine Learning", "Python", "Databases", "React"],
      availability: "Evenings",
      availabilityStatus: "Busy",
      yearsExperience: 6,
      linkedIn: "https://linkedin.com/in/sophia-rivera",
      github: "https://github.com/sophia-rivera",
      portfolioLinks: ["https://sophia-rivera.ai"],
      availabilityCalendarNote: "Evening office hours for active projects.",
      avatarUrl: "",
    }),
  },
] as const;

export const DUMMY_STUDENT_PROJECTS: StudentProject[] = [
  {
    id: "p-quantum-notes",
    title: "Quantum Notes: Smart Study Companion",
    mentorId: "m-aria",
    progressPercent: 65,
    status: "On Track",
    milestoneNotes: "Completed the core UI flows and validated token-based navigation. Next: polish onboarding and add mentor feedback summaries.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "p-campus-map",
    title: "CampusMap: Accessibility-first Navigation",
    mentorId: "m-malik",
    progressPercent: 35,
    status: "Delayed",
    milestoneNotes: "Navigation graph is working locally, but we still need integration tests and performance profiling for routing. Waiting on data schema finalization.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "p-ml-coach",
    title: "ML Coach: Personalized Learning Plan Generator",
    mentorId: "m-sophia",
    progressPercent: 92,
    status: "Completed",
    milestoneNotes: "Finalized model evaluation harness and shipped a minimal planner UI. Next: demo recording + documentation for mentor review.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "p-startup-idea",
    title: "Startup Idea: Research & Validation",
    mentorId: undefined,
    progressPercent: 0,
    status: "Not Started",
    milestoneNotes: "Project created. Waiting to define scope and find a mentor.",
    updatedAt: new Date().toISOString(),
  },
] as StudentProject[];

export function defaultProjectStatusFromProgress(progressPercent: number): ProjectProgressStatus {
  if (progressPercent >= 100) return "Completed";
  if (progressPercent >= 70) return "On Track";
  if (progressPercent >= 40) return "In Progress";
  if (progressPercent === 0) return "Not Started";
  return "Delayed";
}

