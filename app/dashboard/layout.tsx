import Header from "@/components/site/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IdeaBridge Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-full bg-[#f8f1eb] text-black">
        <div className="min-h-full flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </>
  );
}
