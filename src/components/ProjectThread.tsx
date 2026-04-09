"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, MessageCircle, Pin, MoreHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CommentNode } from "../data/mockThread";
import { cn } from "../lib/utils";

interface ProjectThreadProps {
  comments: CommentNode[];
}

export default function ProjectThread({ comments }: ProjectThreadProps) {
  return (
    <div className="w-full flex flex-col pt-2">
      <h3 className="text-xl font-bold tracking-tight mb-8 px-2 flex items-center gap-2">
        <MessageCircle size={20} className="text-primary" />
        Discussion Thread
      </h3>
      <div className="flex flex-col">
        {comments.map((comment, i) => (
          <CommentItem key={comment.id} comment={comment} isLast={i === comments.length - 1} depth={0} />
        ))}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: CommentNode;
  isLast: boolean;
  depth: number;
}

function CommentItem({ comment, isLast, depth }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [upvoted, setUpvoted] = useState(false);

  const roleColors: Record<string, string> = {
    "Student": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Mentor": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Post Owner": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const showLine = !isLast || hasReplies;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative flex flex-col group"
    >
      <div className="flex items-start gap-3">
        {/* Left Vertical Thread Column */}
        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
          <Image
            src={comment.avatarUrl}
            alt={comment.author}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border-2 border-border object-cover z-10 bg-muted"
          />
          {showLine && (
            <div className="w-[2px] bg-border flex-1 min-h-[24px] mt-1 group-hover:bg-primary/30 transition-colors" />
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
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {comment.isAcceptedAnswer && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md text-xs font-bold">
                  <Pin size={11} className="fill-current" />
                  Accepted
                </div>
              )}
              <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted">
                <MoreHorizontal size={15} />
              </button>
            </div>
          </div>

          {/* Comment Body */}
          <div className={cn(
            "text-sm prose prose-sm dark:prose-invert max-w-none mb-3 break-words rounded-xl p-3.5 transition-colors",
            comment.isAcceptedAnswer
              ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50"
              : "bg-muted/30 border border-transparent hover:border-border"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
          </div>

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
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.author}...`}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0">
                    Post
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recursive Children */}
      {hasReplies && (
        <div className="flex flex-col ml-12">
          {comment.replies!.map((child, idx) => (
            <CommentItem
              key={child.id}
              comment={child}
              isLast={idx === comment.replies!.length - 1}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
