"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, MessageCircle, Pin, MoreHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CommentNode } from "../data/mockThread";
import { cn } from "../lib/utils";

interface ProjectThreadProps {
  comments: CommentNode[];
}

export default function ProjectThread({ comments }: ProjectThreadProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col pt-6">
      <h3 className="text-xl font-bold tracking-tight mb-8 px-2">Discussion Thread</h3>
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

  const roleColors: Record<string, string> = {
    "Student": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Mentor": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Post Owner": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
  };

  return (
    <div className="relative flex flex-col group">
      <div className="flex items-start gap-3">
        {/* Left Visual Column */}
        <div className="flex flex-col items-center">
          <img src={comment.avatarUrl} alt={comment.author} className="w-10 h-10 rounded-full border border-border object-cover z-10 bg-background" />
          
          {/* Thread Connecting Line */}
          {(!isLast || (comment.replies && comment.replies.length > 0)) && (
            <div className="w-[2px] bg-border my-1 flex-1 min-h-[40px] group-hover:bg-primary/30 transition-colors" />
          )}
        </div>

        {/* Right Content Column */}
        <div className="flex flex-col flex-1 pb-6 relative pt-1">
          {/* Header */}
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{comment.author}</span>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", roleColors[comment.role])}>
                {comment.role}
              </span>
              <span className="text-muted-foreground text-xs">{comment.timestamp}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {comment.isAcceptedAnswer && (
                 <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md text-xs font-semibold">
                   <Pin size={12} className="fill-current" />
                   Accepted
                 </div>
              )}
              <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none mb-3 break-words bg-muted/20 p-3 rounded-lg border border-transparent hover:border-border transition-colors">
            <ReactMarkdown>{comment.content}</ReactMarkdown>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 text-muted-foreground">
            <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors">
              <ThumbsUp size={14} />
              {comment.upvotes > 0 && comment.upvotes}
            </button>
            <button 
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageCircle size={14} />
              Reply
            </button>
          </div>
          
          {/* Experimental Inline Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="flex gap-2">
                  <input 
                    type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.author}...`}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">Post</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recursive Children Renderer */}
      {comment.replies && comment.replies.length > 0 && (
         <div className="flex flex-col ml-12">
            {comment.replies.map((child, idx) => (
              <CommentItem 
                key={child.id} 
                comment={child} 
                isLast={idx === comment.replies!.length - 1} 
                depth={depth + 1}
              />
            ))}
         </div>
      )}
    </div>
  );
}
