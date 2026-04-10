import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppShell } from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "IdeaBridge — Connect. Learn. Build.",
  description: "AI-first platform for student projects, mentor matching, and structured technical discourse.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>
          <AppShell>
            {children}
          </AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
