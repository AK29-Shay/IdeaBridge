// The mentor dashboard page manages its own layout (sidebar, navigation, auth).
// This layout is a passthrough to avoid double-wrapping.
export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
