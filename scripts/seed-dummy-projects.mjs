import { createClient } from "@supabase/supabase-js";

const PROJECT_SEEDS = [
  {
    postId: "3f63157e-9e28-4825-a74a-f9ecf7d2f101",
    localProjectId: "p-quantum-notes",
    author: {
      email: "nethmi.perera@ideabridge.dev",
      fullName: "Nethmi Perera",
      bio: "Final-year student building study tooling and workflow automation for campus teams.",
      studyYear: "3rd Year",
      faculty: "Computing",
      specialization: "Software Engineering",
    },
    title: "Quantum Notes: Smart Study Companion",
    postMode: "post",
    postType: "full_project",
    techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    progressPercent: 65,
    status: "On Track",
    milestoneNotes:
      "Completed the core UI flows and validated token-based navigation. Next: polish onboarding and add mentor feedback summaries.",
    createdAt: "2026-04-05T09:00:00.000Z",
    updatedAt: "2026-04-21T09:00:00.000Z",
    mentorLegacyId: "m-aria",
  },
  {
    postId: "6bf8bf00-c10a-4d0d-a1ef-b1ed907d5c02",
    localProjectId: "p-campus-map",
    author: {
      email: "akash.silva@ideabridge.dev",
      fullName: "Akash Silva",
      bio: "Student focused on accessibility-first interfaces and mapping systems for campus life.",
      studyYear: "4th Year",
      faculty: "Computing",
      specialization: "Information Technology",
    },
    title: "CampusMap: Accessibility-first Navigation",
    postMode: "post",
    postType: "campus_req",
    techStack: ["React", "TypeScript", "Node.js", "UI/UX"],
    progressPercent: 35,
    status: "Delayed",
    milestoneNotes:
      "Navigation graph is working locally, but we still need integration tests and performance profiling for routing. Waiting on data schema finalization.",
    createdAt: "2026-04-03T09:00:00.000Z",
    updatedAt: "2026-04-17T09:00:00.000Z",
    mentorLegacyId: "m-malik",
  },
  {
    postId: "a7a4ea2f-7dde-4476-a84c-5178f0879803",
    localProjectId: "p-ml-coach",
    author: {
      email: "raveen.desilva@ideabridge.dev",
      fullName: "Raveen De Silva",
      bio: "Applied AI student shipping practical product experiments with measurable outcomes.",
      studyYear: "4th Year",
      faculty: "Computing",
      specialization: "Data Science",
    },
    title: "ML Coach: Personalized Learning Plan Generator",
    postMode: "post",
    postType: "ai_driven",
    techStack: ["Python", "Machine Learning", "Databases", "React"],
    progressPercent: 92,
    status: "Completed",
    milestoneNotes:
      "Finalized model evaluation harness and shipped a minimal planner UI. Next: demo recording + documentation for mentor review.",
    createdAt: "2026-03-29T09:00:00.000Z",
    updatedAt: "2026-04-23T05:45:00.000Z",
    mentorLegacyId: "m-sophia",
  },
  {
    postId: "e2d3447e-7470-4fe4-93bc-98d4717b6404",
    localProjectId: "p-startup-idea",
    author: {
      email: "sanjana.fernando@ideabridge.dev",
      fullName: "Sanjana Fernando",
      bio: "Student founder exploring product discovery, validation, and MVP framing.",
      studyYear: "3rd Year",
      faculty: "Business",
      specialization: "Entrepreneurship",
    },
    title: "Startup Idea: Research & Validation",
    postMode: "request",
    postType: "idea",
    techStack: ["Research", "Validation", "Next.js"],
    progressPercent: 0,
    status: "Not Started",
    milestoneNotes: "Project created. Waiting to define scope and find a mentor.",
    createdAt: "2026-04-18T09:00:00.000Z",
    updatedAt: "2026-04-24T09:00:00.000Z",
    mentorLegacyId: null,
  },
  {
    postId: "c91cf2e4-3020-485d-bca5-f796aa6e7d05",
    localProjectId: "p-wellness-bot",
    author: {
      email: "dineli.karunaratne@ideabridge.dev",
      fullName: "Dineli Karunaratne",
      bio: "Student product builder interested in safe conversational UX and wellbeing support systems.",
      studyYear: "4th Year",
      faculty: "Computing",
      specialization: "Software Engineering",
    },
    title: "WellnessBot: Campus Mental Health Check-in Assistant",
    postMode: "post",
    postType: "ai_driven",
    techStack: ["Next.js", "AI Safety", "Prompt Design", "Supabase"],
    progressPercent: 58,
    status: "In Progress",
    milestoneNotes:
      "Finished the guided mood check-in flow and started training the recommendation prompts. Next: add safety guardrails and counselor escalation rules.",
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-19T09:00:00.000Z",
    mentorLegacyId: "m-sophia",
  },
  {
    postId: "7dbe1952-a240-4b4f-b145-65c53fc0a006",
    localProjectId: "p-lab-booking",
    author: {
      email: "tharindu.jayasekara@ideabridge.dev",
      fullName: "Tharindu Jayasekara",
      bio: "Systems-oriented student optimizing operations, scheduling, and resource planning.",
      studyYear: "4th Year",
      faculty: "Engineering",
      specialization: "Information Systems",
    },
    title: "LabSlot: Smart Lab Booking and Queue Manager",
    postMode: "post",
    postType: "full_project",
    techStack: ["Next.js", "PostgreSQL", "Scheduling", "Node.js"],
    progressPercent: 81,
    status: "On Track",
    milestoneNotes:
      "Reservation rules and queue conflict handling are working. Next: optimize slot prediction and add lecturer approval history.",
    createdAt: "2026-03-27T09:00:00.000Z",
    updatedAt: "2026-04-15T09:00:00.000Z",
    mentorLegacyId: "m-malik",
  },
  {
    postId: "4d33d2ce-fc78-4d81-87e5-06f1df1e0b07",
    localProjectId: "p-career-sprint",
    author: {
      email: "ishara.mendis@ideabridge.dev",
      fullName: "Ishara Mendis",
      bio: "Student focused on growth tools, dashboards, and habit systems for career readiness.",
      studyYear: "3rd Year",
      faculty: "Computing",
      specialization: "Software Engineering",
    },
    title: "CareerSprint: Placement Preparation Planner",
    postMode: "post",
    postType: "full_project",
    techStack: ["React", "TypeScript", "Analytics", "UI/UX"],
    progressPercent: 47,
    status: "In Progress",
    milestoneNotes:
      "Built the dashboard for weekly goals, mock interview tracking, and recruiter activity snapshots. Next: connect reminders and progress badges.",
    createdAt: "2026-03-31T09:00:00.000Z",
    updatedAt: "2026-04-13T09:00:00.000Z",
    mentorLegacyId: "m-aria",
  },
  {
    postId: "dc594942-6531-4fd5-bf5c-d2d84ebf9308",
    localProjectId: "p-green-route",
    author: {
      email: "manula.fernandez@ideabridge.dev",
      fullName: "Manula Fernandez",
      bio: "Student working on sustainable mobility, data cleanup, and route recommendation systems.",
      studyYear: "4th Year",
      faculty: "Engineering",
      specialization: "Information Technology",
    },
    title: "GreenRoute: Carbon-aware Commute Recommender",
    postMode: "post",
    postType: "campus_req",
    techStack: ["GIS", "Data Cleaning", "Node.js", "TypeScript"],
    progressPercent: 23,
    status: "Delayed",
    milestoneNotes:
      "Route comparison logic is drafted, but transport datasets still need cleanup before reliable scoring can be shown in the UI.",
    createdAt: "2026-03-24T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
    mentorLegacyId: "m-malik",
  },
  {
    postId: "f61eb05a-6f8f-4fd4-8acf-1c3f0149c409",
    localProjectId: "p-peer-tutor",
    author: {
      email: "kaushi.weerasinghe@ideabridge.dev",
      fullName: "Kaushi Weerasinghe",
      bio: "Student interested in community products, trust systems, and matching marketplaces.",
      studyYear: "2nd Year",
      faculty: "Computing",
      specialization: "Information Technology",
    },
    title: "PeerTutor Match: Skill-based Student Support Network",
    postMode: "request",
    postType: "idea",
    techStack: ["Matching", "Moderation", "UX Research", "React"],
    progressPercent: 12,
    status: "Not Started",
    milestoneNotes:
      "Initial concept, matching criteria, and user personas are drafted. Need validation on moderation rules and mentor oversight model.",
    createdAt: "2026-04-08T09:00:00.000Z",
    updatedAt: "2026-04-22T09:00:00.000Z",
    mentorLegacyId: null,
  },
  {
    postId: "fd632449-e37a-4822-a972-49fd3e842610",
    localProjectId: "p-event-pulse",
    author: {
      email: "yenuli.abeywickrama@ideabridge.dev",
      fullName: "Yenuli Abeywickrama",
      bio: "Student building campus discovery products with strong information architecture and accessibility.",
      studyYear: "3rd Year",
      faculty: "Computing",
      specialization: "Human Computer Interaction",
    },
    title: "EventPulse: Smart University Event Discovery",
    postMode: "post",
    postType: "full_project",
    techStack: ["Next.js", "Recommendations", "Accessibility", "Supabase"],
    progressPercent: 88,
    status: "On Track",
    milestoneNotes:
      "Recommendation cards, event tagging, and interest-based filtering are nearly done. Final step is polishing accessibility and RSVP reminders.",
    createdAt: "2026-03-26T09:00:00.000Z",
    updatedAt: "2026-04-18T09:00:00.000Z",
    mentorLegacyId: "m-aria",
  },
];

const MENTOR_SEEDS = [
  {
    legacyId: "m-aria",
    email: "aria.mentor@ideabridge.dev",
    fullName: "Dr. Aria Chen",
    role: "Mentor",
    bio: "Senior front-end engineer and university mentor focused on structured feedback and clean architecture. I help students ship production-quality features with confidence.",
    skills: ["React", "Next.js", "TypeScript", "UI/UX"],
    availability: "Full-time",
    availabilityStatus: "Available Now",
    yearsExperience: 8,
    linkedIn: "https://linkedin.com/in/aria-chen",
    github: "https://github.com/ariachen",
    portfolioLinks: ["https://ariachen.dev"],
    availabilityCalendarNote: "Best for weekly check-ins and code reviews.",
    reputation: 4.9,
  },
  {
    legacyId: "m-malik",
    email: "malik.mentor@ideabridge.dev",
    fullName: "Prof. Malik Johnson",
    role: "Mentor",
    bio: "Backend + system design mentor. I prioritize milestones, risk management, and pragmatic engineering trade-offs for student teams.",
    skills: ["System Design", "Databases", "Node.js", "Python"],
    availability: "Part-time",
    availabilityStatus: "Available in 1-2 days",
    yearsExperience: 10,
    linkedIn: "https://linkedin.com/in/malik-johnson",
    github: "https://github.com/malikjohnson",
    portfolioLinks: ["https://malikjohnson.net"],
    availabilityCalendarNote: "Typically responds between project milestones.",
    reputation: 4.7,
  },
  {
    legacyId: "m-sophia",
    email: "sophia.mentor@ideabridge.dev",
    fullName: "Sophia Rivera",
    role: "Mentor",
    bio: "ML + applied engineering mentor. I help you break down complex learning goals into implementable steps and measurable progress.",
    skills: ["Machine Learning", "Python", "Databases", "React"],
    availability: "Evenings",
    availabilityStatus: "Busy",
    yearsExperience: 6,
    linkedIn: "https://linkedin.com/in/sophia-rivera",
    github: "https://github.com/sophia-rivera",
    portfolioLinks: ["https://sophia-rivera.ai"],
    availabilityCalendarNote: "Evening office hours for active projects.",
    reputation: 4.6,
  },
];

const AUTH_USERS_PAGE_SIZE = 200;
const SEED_TAG = "dummy_project_seed_v1";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function defaultPassword() {
  return `IdeaBridge_${Date.now()}_Aa1!`;
}

function makeDescription(project) {
  return `${project.milestoneNotes} Progress: ${project.progressPercent}% (${project.status}).`;
}

function makeViewCount(project, index) {
  return 90 + project.progressPercent * 4 + index * 17;
}

async function findUserByEmail(supabase, email) {
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PAGE_SIZE,
    });

    if (error) {
      throw error;
    }

    const found = data.users.find(
      (entry) => String(entry.email ?? "").trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (found) {
      return found;
    }

    if (data.users.length < AUTH_USERS_PAGE_SIZE) {
      return null;
    }

    page += 1;
  }

  return null;
}

async function findOrCreateAuthUser(supabase, seed) {
  const existing = await findUserByEmail(supabase, seed.email);
  if (existing?.id) {
    return existing;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: seed.email,
    password: defaultPassword(),
    email_confirm: true,
    user_metadata: {
      full_name: seed.fullName,
      role: seed.role,
    },
  });

  if (error || !data.user?.id) {
    throw new Error(error?.message || `Failed to create auth user for ${seed.email}`);
  }

  return data.user;
}

async function upsertProfile(supabase, userId, seed, extra = {}) {
  const payload = {
    id: userId,
    full_name: seed.fullName,
    avatar_url: null,
    bio: seed.bio ?? null,
    role: seed.role,
    skills: seed.skills ?? null,
    availability: seed.availability ?? null,
    ...extra,
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(error.message || `Failed to upsert profile for ${seed.email}`);
  }
}

async function upsertPost(supabase, project, authorId, mentorDirectory, index) {
  const mentor = project.mentorLegacyId
    ? mentorDirectory.get(project.mentorLegacyId) ?? null
    : null;

  const payload = {
    id: project.postId,
    user_id: authorId,
    post_mode: project.postMode,
    post_type: project.postType,
    title: project.title,
    description: makeDescription(project),
    tech_stack: project.techStack,
    dynamic_content: {
      module: "idea_guidance",
      seedSource: SEED_TAG,
      legacyProjectId: project.localProjectId,
      progressPercent: project.progressPercent,
      progressStatus: project.status,
      projectDetails: project.milestoneNotes,
      mentorLegacyId: project.mentorLegacyId,
      mentorName: mentor?.fullName ?? null,
      mentorEmail: mentor?.email ?? null,
      updatedAt: project.updatedAt,
    },
    view_count: makeViewCount(project, index),
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };

  const { error } = await supabase.from("posts").upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(error.message || `Failed to upsert post ${project.title}`);
  }
}

async function main() {
  const supabase = createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const mentorDirectory = new Map();

  for (const mentor of MENTOR_SEEDS) {
    const user = await findOrCreateAuthUser(supabase, mentor);
    await upsertProfile(supabase, user.id, mentor);
    mentorDirectory.set(mentor.legacyId, mentor);
  }

  for (const [index, project] of PROJECT_SEEDS.entries()) {
    const studentSeed = {
      email: project.author.email,
      fullName: project.author.fullName,
      role: "Student",
      bio: project.author.bio,
      studyYear: project.author.studyYear,
      faculty: project.author.faculty,
      specialization: project.author.specialization,
      skills: project.techStack,
      portfolioLinks: [],
    };

    const user = await findOrCreateAuthUser(supabase, studentSeed);
    await upsertProfile(supabase, user.id, studentSeed);
    await upsertPost(supabase, project, user.id, mentorDirectory, index);
  }

  const { data, error } = await supabase
    .from("posts")
    .select("id,title,dynamic_content")
    .contains("dynamic_content", { module: "idea_guidance", seedSource: SEED_TAG })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to verify seeded posts.");
  }

  console.log(`Seeded or updated ${data?.length ?? 0} dummy project posts.`);
  for (const row of data ?? []) {
    console.log(`- ${row.title} (${row.id})`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
