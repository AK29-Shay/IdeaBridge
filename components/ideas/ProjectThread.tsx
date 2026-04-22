"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, MessageCircle, Pin, MoreHorizontal, Pencil, Trash2, Check, X, Paperclip, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { CommentNode, CommentAttachment } from "@/lib/ideas/mockThread";
import { cn } from "@/lib/utils";
import {
  THREAD_MEDIA_ACCEPT,
  SUPABASE_MAX_UPLOAD_BYTES,
  formatBytes,
  uploadThreadMediaFile,
  validateThreadMediaFile,
} from "@/lib/supabaseUploads";

type ReplyPayload = {
  content: string;
  attachments: CommentAttachment[];
};

interface ProjectThreadProps {
  comments: CommentNode[];
  postId?: string;
  actorEmail?: string;
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
}

function parseApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const error = "error" in payload ? String((payload as { error?: unknown }).error ?? "") : "";
  return error || fallback;
}

export default function ProjectThread({ comments, postId, actorEmail, isLoading = false, onRefresh }: ProjectThreadProps) {
  const [threadComments, setThreadComments] = useState<CommentNode[]>(comments);

  useEffect(() => {
    setThreadComments(comments);
  }, [comments]);

  const handleDelete = async (id: string) => {
    const previous = threadComments;
    const deleteNode = (nodes: CommentNode[]): CommentNode[] =>
      nodes
        .filter((n) => n.id !== id)
        .map((n) => ({ ...n, replies: deleteNode(n.replies ?? []) }));
    setThreadComments((prev) => deleteNode(prev));

    if (!postId || !actorEmail) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${id}?actorEmail=${encodeURIComponent(actorEmail)}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(parseApiError(payload, "Failed to delete reply."));
      }

      await onRefresh?.();
      toast.success("Reply deleted.");
    } catch (error) {
      setThreadComments(previous);
      toast.error(error instanceof Error ? error.message : "Failed to delete reply.");
    }
  };

  const handleEdit = async (id: string, newContent: string) => {
    const previous = threadComments;
    const editNode = (nodes: CommentNode[]): CommentNode[] =>
      nodes.map((n) =>
        n.id === id
          ? { ...n, content: newContent }
          : { ...n, replies: editNode(n.replies ?? []) }
      );
    setThreadComments((prev) => editNode(prev));

    if (!postId || !actorEmail) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          actorEmail,
          content: newContent,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(parseApiError(payload, "Failed to update reply."));
      }

      await onRefresh?.();
      toast.success("Reply updated.");
    } catch (error) {
      setThreadComments(previous);
      toast.error(error instanceof Error ? error.message : "Failed to update reply.");
    }
  };

  const handleReply = async (parentId: string, payload: ReplyPayload) => {
    const nextReply: CommentNode = {
      id: `reply_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      author: "You",
      avatarUrl: "https://i.pravatar.cc/150?u=current-user",
      role: "Student",
      content: payload.content.trim() || "Shared media",
      attachments: payload.attachments,
      upvotes: 0,
      timestamp: "Just now",
      replies: [],
    };

    const appendReply = (nodes: CommentNode[]): CommentNode[] =>
      nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            replies: [...(node.replies ?? []), nextReply],
          };
        }
        return {
          ...node,
          replies: appendReply(node.replies ?? []),
        };
      });

    if (!postId || !actorEmail) {
      setThreadComments((prev) => appendReply(prev));
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          actorEmail,
          content: payload.content,
          parent_comment_id: parentId,
          attachments: payload.attachments,
        }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(parseApiError(body, "Failed to post reply."));
      }

      await onRefresh?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post reply.");
    }
  };

  return (
    <div className="w-full flex flex-col pt-2">
      <h3 className="text-xl font-bold tracking-tight mb-8 px-2 flex items-center gap-2">
        <MessageCircle size={20} className="text-primary" />
        Discussion Thread
      </h3>
      {isLoading ? (
        <div className="mb-5 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">Loading thread...</div>
      ) : null}
      <div className="flex flex-col">
        {threadComments.map((comment, i) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isLast={i === threadComments.length - 1}
            depth={0}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReply={handleReply}
          />
        ))}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: CommentNode;
  isLast: boolean;
  depth: number;
  onDelete: (id: string) => Promise<void> | void;
  onEdit: (id: string, newContent: string) => Promise<void> | void;
  onReply: (parentId: string, payload: ReplyPayload) => Promise<void> | void;
}

function CommentItem({ comment, isLast, depth, onDelete, onEdit, onReply }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [uploadingReply, setUploadingReply] = useState(false);
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [upvoted, setUpvoted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Context menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const roleColors: Record<string, string> = {
    "Student": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Mentor": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Post Owner": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const showLine = !isLast || hasReplies;
  const handleEditSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== comment.content) {
      onEdit(comment.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditText(comment.content);
    setIsEditing(false);
  };

  const handleReplyFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selected = Array.from(files);
    const next: File[] = [];
    for (const file of selected) {
      const error = validateThreadMediaFile(file);
      if (error) {
        toast.error(error);
        continue;
      }
      next.push(file);
    }

    if (next.length > 0) {
      setReplyFiles((prev) => [...prev, ...next]);
    }
  };

  const handleRemoveReplyFile = (indexToRemove: number) => {
    setReplyFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePostReply = async () => {
    if (uploadingReply) return;

    const content = replyText.trim();
    if (!content && replyFiles.length === 0) return;

    setUploadingReply(true);
    try {
      const uploadedAttachments: CommentAttachment[] = [];
      for (const file of replyFiles) {
        const uploaded = await uploadThreadMediaFile(file);
        if (uploaded.kind === "file") continue;
        uploadedAttachments.push({
          id: uploaded.path,
          name: uploaded.name,
          url: uploaded.url,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
          kind: uploaded.kind,
          path: uploaded.path,
        });
      }

      await Promise.resolve(onReply(comment.id, {
        content,
        attachments: uploadedAttachments,
      }));

      setReplyText("");
      setReplyFiles([]);
      setShowReplyForm(false);
      toast.success("Reply posted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post reply.");
    } finally {
      setUploadingReply(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="relative flex flex-col group"
    >
      <div className="flex items-start gap-3">
        {/* Left Vertical Thread Column */}
        <div className="flex w-10 shrink-0 flex-col items-center">
          <Image
            src={comment.avatarUrl}
            alt={comment.author}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border-2 border-border object-cover z-10 bg-muted"
          />
          {showLine && (
            <div className="mt-1 min-h-6 w-0.5 flex-1 bg-border transition-colors group-hover:bg-primary/30" />
          )}
        </div>

        {/* Right Content Column */}
        <div className="flex flex-col flex-1 pb-4 pt-0.5 min-w-0">
          {/* Meta Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{comment.author}</span>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", roleColors[comment.role])}>
                {comment.role}
              </span>
              <span className="text-muted-foreground text-xs">{comment.timestamp}</span>
              {isEditing && (
                <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  editing
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {comment.isAcceptedAnswer && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md text-xs font-bold">
                  <Pin size={11} className="fill-current" />
                  Accepted
                </div>
              )}

              {/* ··· More Menu */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  type="button"
                  title="Open comment actions"
                  aria-label="Open comment actions"
                  onClick={() => setMenuOpen((v) => !v)}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition-all p-1 rounded-md hover:bg-muted",
                    menuOpen ? "opacity-100 bg-muted text-foreground" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <MoreHorizontal size={15} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      ref={menuRef}
                      initial={{ opacity: 0, scale: 0.92, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-8 z-50 min-w-32.5 overflow-hidden rounded-xl border border-border bg-popover shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setEditText(comment.content);
                          setMenuOpen(false);
                          setShowDeleteConfirm(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                      >
                        <Pencil size={13} className="text-muted-foreground" />
                        Edit
                      </button>
                      <div className="h-px bg-border" />
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setMenuOpen(false);
                          setIsEditing(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors text-left"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Banner */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="flex items-center justify-between gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    Delete this comment permanently?
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void onDelete(comment.id);
                      }}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <X size={12} />
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comment Body — view or edit */}
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit-form"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="mb-3"
              >
                <textarea
                  title="Edit comment text"
                  aria-label="Edit comment text"
                  placeholder="Edit your comment"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEditSave();
                    if (e.key === "Escape") handleEditCancel();
                  }}
                  autoFocus
                  rows={3}
                  className="w-full bg-background border border-primary/40 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={handleEditSave}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Check size={12} />
                    Save
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <X size={12} />
                    Cancel
                  </button>
                  <span className="text-[11px] text-muted-foreground ml-1">
                    ⌘↵ to save · Esc to cancel
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view-body"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "text-sm prose prose-sm dark:prose-invert max-w-none mb-3 wrap-break-word rounded-xl p-3.5 transition-colors",
                  comment.isAcceptedAnswer
                    ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50"
                    : "bg-muted/30 border border-transparent hover:border-border"
                )}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
              </motion.div>
            )}
          </AnimatePresence>

          {comment.attachments && comment.attachments.length > 0 ? (
            <div className="mb-3 grid grid-cols-1 gap-2">
              {comment.attachments.map((attachment) => (
                <div key={attachment.id} className="rounded-xl border border-border bg-background p-2">
                  {attachment.kind === "video" ? (
                    <video src={attachment.url} controls className="w-full rounded-md" />
                  ) : (
                    <img src={attachment.url} alt={attachment.name} className="w-full rounded-md object-cover" loading="lazy" />
                  )}
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-xs text-primary hover:underline"
                  >
                    {attachment.name} ({formatBytes(attachment.size)})
                  </a>
                </div>
              ))}
            </div>
          ) : null}

          {/* Action Row */}
          <div className="flex items-center gap-5 text-muted-foreground">
            <button
              className={cn("flex items-center gap-1.5 text-xs font-semibold transition-colors", upvoted ? "text-primary" : "hover:text-primary")}
              onClick={() => { setUpvotes(v => upvoted ? v - 1 : v + 1); setUpvoted(v => !v); }}
            >
              <ThumbsUp size={14} className={upvoted ? "fill-primary stroke-primary" : ""} />
              {upvotes}
            </button>
            <button
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageCircle size={14} />
              Reply
            </button>
          </div>

          {/* Inline Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.author}...`}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={THREAD_MEDIA_ACCEPT}
                    title="Attach media files"
                    className="hidden"
                    onChange={(e) => {
                      handleReplyFilesChosen(e.target.files);
                      e.currentTarget.value = "";
                    }}
                  />

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                    >
                      <Paperclip size={13} />
                      Attach media
                    </button>
                    <span className="text-[11px] text-muted-foreground">
                      Image/GIF/Video, max {formatBytes(SUPABASE_MAX_UPLOAD_BYTES)} each
                    </span>
                  </div>

                  {replyFiles.length > 0 ? (
                    <div className="space-y-1">
                      {replyFiles.map((file, idx) => (
                        <div key={`${file.name}_${idx}`} className="flex items-center justify-between rounded-md border border-border bg-background px-2 py-1.5 text-xs">
                          <span className="truncate max-w-[75%]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveReplyFile(idx)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handlePostReply()}
                      disabled={uploadingReply || (!replyText.trim() && replyFiles.length === 0)}
                      className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      {uploadingReply ? <Loader2 size={14} className="animate-spin" /> : null}
                      Post
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recursive Children */}
      <AnimatePresence>
        {hasReplies && (
          <div className="flex flex-col ml-12">
            {comment.replies!.map((child, idx) => (
              <CommentItem
                key={child.id}
                comment={child}
                isLast={idx === comment.replies!.length - 1}
                depth={depth + 1}
                onDelete={onDelete}
                onEdit={onEdit}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
