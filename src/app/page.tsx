import DynamicPostForm from "@/components/DynamicPostForm";
import ProjectThread from "@/components/ProjectThread";
import { mockThreadData } from "@/data/mockThread";

export default function Home() {
  return (
    <main className="min-h-screen bg-muted/10 p-4 md:p-8 space-y-16 pb-32">
      {/* Header section */}
      <header className="max-w-4xl mx-auto mb-8 text-center pt-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
          Idea & Guidance Module
        </h1>
        <p className="text-lg text-muted-foreground w-3/4 mx-auto">
          Share your concepts, find teammates, or request guidance from experienced mentors.
        </p>
      </header>

      {/* Primary Functionality: Dynamic Form */}
      <section>
        <DynamicPostForm />
      </section>

      <div className="max-w-4xl mx-auto border-t border-border/60 my-8 shadow-sm"></div>

      {/* Primary Functionality: Recursive Threads */}
      <section className="bg-background max-w-4xl mx-auto rounded-xl border border-border shadow-md p-6">
        <ProjectThread comments={mockThreadData} />
      </section>
    </main>
  );
}
