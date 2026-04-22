import { redirect } from "next/navigation";

// Legacy compatibility route from older member branches.
export default function AuthEntryPage() {
  redirect("/login");
}
