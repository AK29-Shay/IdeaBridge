import { redirect } from "next/navigation";

// Keep /ideas as a short entry URL and route to the Ideas feature page.
export default function IdeasPage() {
  redirect("/ideas/explore");
}
