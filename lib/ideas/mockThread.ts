export interface CommentNode {
  id: string;
  author: string;
  avatarUrl: string;
  role: "Student" | "Mentor" | "Post Owner";
  content: string;
  upvotes: number;
  timestamp: string;
  isAcceptedAnswer?: boolean;
  attachments?: CommentAttachment[];
  replies?: CommentNode[];
}

export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  kind: "image" | "gif" | "video";
  path?: string;
}

export const mockThreadData: CommentNode[] = [
  {
    id: "1",
    author: "Alice Johnson",
    avatarUrl: "https://i.pravatar.cc/150?u=alice",
    role: "Mentor",
    content: "This is a fantastic foundational idea. I highly recommend wrapping your database logic in a customized hook.\n\n```ts\nfunction useDB() {\n  return db.select();\n}\n```",
    upvotes: 24,
    timestamp: "2 hours ago",
    isAcceptedAnswer: true,
    replies: [
      {
        id: "1a",
        author: "AK29-Shay",
        avatarUrl: "https://i.pravatar.cc/150?u=ak29",
        role: "Post Owner",
        content: "Thank you! Should I use SWR or React Query alongside that hook?",
        upvotes: 4,
        timestamp: "1 hour ago",
        replies: [
          {
            id: "1a1",
            author: "Alice Johnson",
            avatarUrl: "https://i.pravatar.cc/150?u=alice",
            role: "Mentor",
            content: "React Query is standard for App Router client mutations. SWR is fine if you want lightweight fetching.",
            upvotes: 8,
            timestamp: "45 mins ago",
          }
        ]
      }
    ]
  },
  {
    id: "2",
    author: "Bob Smith",
    avatarUrl: "https://i.pravatar.cc/150?u=bob",
    role: "Student",
    content: "Has anyone tried integrating this with Supabase Auth yet? I keep getting a session error.",
    upvotes: 2,
    timestamp: "3 hours ago",
    replies: [
      {
        id: "2a",
        author: "sneha-dhaya-IT",
        avatarUrl: "https://i.pravatar.cc/150?u=sneha",
        role: "Student",
        content: "Yes, I pushed a fix for this to `dev` yesterday. Make sure your environment variables track `--anon-key` properly.",
        upvotes: 12,
        timestamp: "2 hours ago",
      }
    ]
  }
];
