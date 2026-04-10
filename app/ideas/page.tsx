import { redirect } from "next/navigation";

// The Idea & Guidance module lives in src/app/page.tsx (Next.js nested routing)
// This catches /ideas and proxies to the src-based route.
export default function IdeasPage() {
  // Redirect to the dedicated ideas module entry point
  redirect("/ideas/explore");
}
