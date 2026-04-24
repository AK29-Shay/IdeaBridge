export type PostType = "full_project" | "idea" | "ai_driven" | "campus_req";
export type PostMode = "post" | "request";

export type SearchPost = {
  id: string;
  title: string;
  type: PostType;
  mode: PostMode;
  author: string;
  role: string;
  tags: string[];
  views: number;
  description: string;
  category: string;
  year: string;
  semester: string;
  difficulty: string;
  status: string;
  date: string;
  trending: boolean;
};

export const DEMO_PROJECTS: SearchPost[] = [
  {
    id: "demo-1",
    title: "AI-Powered Study Planner",
    type: "full_project",
    mode: "post",
    author: "Alex Morgan",
    role: "Student",
    tags: ["React", "Node.js", "AI/ML", "MongoDB"],
    views: 1250,
    description: "An intelligent study planner that adapts to your learning pace and upcoming deadlines. Uses ML to predict optimal study times.",
    category: "AI/ML",
    year: "Year 3",
    semester: "Sem 1",
    difficulty: "Advanced",
    status: "In Progress",
    date: "2026-04-20",
    trending: true,
  },
  {
    id: "demo-2",
    title: "Campus Ride Share App",
    type: "idea",
    mode: "request",
    author: "Jordan Lee",
    role: "Student",
    tags: ["Mobile", "React", "Firebase", "TypeScript"],
    views: 890,
    description: "Looking for team members to build a campus-specific ride-sharing app. Need help with mobile development and Firebase auth.",
    category: "Mobile",
    year: "Year 2",
    semester: "Sem 2",
    difficulty: "Intermediate",
    status: "Open",
    date: "2026-04-22",
    trending: true,
  },
  {
    id: "demo-3",
    title: "Secure Voting System",
    type: "full_project",
    mode: "post",
    author: "Sam Chen",
    role: "Student",
    tags: ["Cyber Security", "Java", "Spring Boot", "MySQL"],
    views: 1100,
    description: "A blockchain-inspired voting system for university club elections. Focuses on anonymity and verification.",
    category: "Cyber Security",
    year: "Year 4",
    semester: "Sem 1",
    difficulty: "Hard",
    status: "Completed",
    date: "2026-04-15",
    trending: true,
  },
  {
    id: "demo-4",
    title: "Smart Dorm Thermostat",
    type: "idea",
    mode: "post",
    author: "Taylor Swift",
    role: "Student",
    tags: ["Python", "TensorFlow", "Node.js"],
    views: 450,
    description: "IoT project to optimize dorm room temperatures based on occupancy and weather forecasts.",
    category: "SE",
    year: "Year 3",
    semester: "Sem 2",
    difficulty: "Intermediate",
    status: "Planning",
    date: "2026-04-23",
    trending: false,
  },
  {
    id: "demo-5",
    title: "Course Recommendation Engine",
    type: "ai_driven",
    mode: "post",
    author: "Chris Evans",
    role: "Student",
    tags: ["Python", "Data Science", "React"],
    views: 1500,
    description: "Suggests electives based on past grades, career interests, and prerequisite chains.",
    category: "Data Science",
    year: "Year 4",
    semester: "Sem 1",
    difficulty: "Advanced",
    status: "Completed",
    date: "2026-04-10",
    trending: true,
  },
  {
    id: "demo-6",
    title: "Library Seat Tracker",
    type: "full_project",
    mode: "post",
    author: "Emma Stone",
    role: "Student",
    tags: ["Web", "Next.js", "Firebase", "TypeScript"],
    views: 720,
    description: "Real-time dashboard showing available seats in the main library using camera feeds and object detection.",
    category: "Web",
    year: "Year 2",
    semester: "Sem 1",
    difficulty: "Intermediate",
    status: "In Progress",
    date: "2026-04-18",
    trending: false,
  },
  {
    id: "demo-7",
    title: "Hackathon Team Matcher",
    type: "campus_req",
    mode: "request",
    author: "Tom Holland",
    role: "Student",
    tags: ["Web", "Node.js", "MySQL"],
    views: 630,
    description: "Need a backend developer to help finish a platform that matches students for upcoming hackathons based on skills.",
    category: "SE",
    year: "Year 1",
    semester: "Sem 2",
    difficulty: "Beginner",
    status: "Open",
    date: "2026-04-24",
    trending: false,
  },
  {
    id: "demo-8",
    title: "Dockerized Autograder",
    type: "full_project",
    mode: "post",
    author: "Mark Ruffalo",
    role: "TA",
    tags: ["Docker", "Python", "REST API"],
    views: 950,
    description: "A secure, sandboxed environment for grading student programming assignments automatically.",
    category: "SE",
    year: "Year 4",
    semester: "Sem 2",
    difficulty: "Advanced",
    status: "Completed",
    date: "2026-04-05",
    trending: true,
  }
];
