"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Send, FileCode2, Sparkles, GraduationCap, Link2, Upload, MessageSquarePlus, RefreshCw, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  DYNAMIC_FORM_ACCEPT,
  SUPABASE_MAX_UPLOAD_BYTES,
  formatBytes,
  uploadDynamicFormFile,
  validateDynamicFormFile,
} from "@/lib/supabaseUploads";
import type { UploadedSupabaseFile } from "@/lib/supabaseUploads";

type FormMode = "Request" | "Post";
type PostVariant = "Full Project Details" | "Project Idea" | "Fully AI-Driven Project" | "Campus Requirement";

type DynamicPostFormProps = {
  onPostCreated?: (post: unknown) => void;
};

function parseApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const error = "error" in payload ? String((payload as { error?: unknown }).error ?? "") : "";
  return error || fallback;
}

export default function DynamicPostForm({ onPostCreated }: DynamicPostFormProps) {
  const { user } = useAuth();

  const [mode, setMode] = useState<FormMode>("Post");
  const [variant, setVariant] = useState<PostVariant>("Full Project Details");
  const [isVariantOpen, setIsVariantOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedSupabaseFile[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const variants: PostVariant[] = [
    "Full Project Details",
    "Project Idea",
    "Fully AI-Driven Project",
    "Campus Requirement"
  ];

  const handleFillDummyData = () => {
    setTitle("IdeaBridge: AI-Powered Collaboration Platform");
    setDescription("IdeaBridge is a Next.js App Router application leveraging **Supabase** for Auth and Postgres. The UI relies on **TailwindCSS** and **Framer Motion** for a dynamic user experience.\n\n### Key Features\n- Realtime Threads\n- Markdown Previews");
    setTags("Next.js, Tailwind, Supabase, TypeScript");
    setExtras({
      github: "https://github.com/AK29-Shay/IdeaBridge",
      live: "https://ideabridge-demo.vercel.app",
      aiAgent: "Gemini 1.5 Pro",
      aiCredits: "420",
      campusComponent: "User Profile Module",
      campusCrud: "Create, Read, Update, Delete for User Profiles"
    });
  };

  const handleFilesChosen = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selected = Array.from(files);
    const errors = selected
      .map((file) => validateDynamicFormFile(file))
      .filter((msg): msg is string => !!msg);

    if (errors.length > 0) {
      errors.forEach((msg) => toast.error(msg));
      return;
    }

    setIsUploadingFiles(true);
    try {
      const nextUploads: UploadedSupabaseFile[] = [];
      for (const file of selected) {
        const uploaded = await uploadDynamicFormFile(file);
        nextUploads.push(uploaded);
      }

      setUploadedFiles((prev) => [...prev, ...nextUploads]);
      toast.success(`${nextUploads.length} file(s) uploaded.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload files.");
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const removeUploadedFile = (indexToRemove: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const formVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.2 } }
  };

  const postTypeByVariant: Record<PostVariant, "full_project" | "idea" | "ai_driven" | "campus_req"> = {
    "Full Project Details": "full_project",
    "Project Idea": "idea",
    "Fully AI-Driven Project": "ai_driven",
    "Campus Requirement": "campus_req",
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const actorEmail = (user?.email ?? "").trim().toLowerCase();

    if (!actorEmail) {
      toast.error("Sign in to submit posts and requests.");
      return;
    }

    if (!trimmedTitle) {
      toast.error("Title is required.");
      return;
    }

    if (!trimmedDescription) {
      toast.error("Description is required.");
      return;
    }

    const techStack = tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const normalizedMode = mode === "Request" ? "request" : "post";
    const postType = mode === "Request" ? "idea" : postTypeByVariant[variant];

    const dynamicContent = {
      module: "idea_guidance",
      variant: mode === "Request" ? "Guidance Request" : variant,
      extras,
      attachments: uploadedFiles.map((file) => ({
        name: file.name,
        url: file.url,
        mimeType: file.mimeType,
        size: file.size,
        kind: file.kind,
      })),
    };

    setIsSubmittingPost(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          actorEmail,
          actorName: user?.fullName,
          actorRole: user?.role,
          post_mode: normalizedMode,
          post_type: postType,
          title: trimmedTitle,
          description: trimmedDescription,
          tech_stack: techStack,
          dynamic_content: dynamicContent,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          parseApiError(payload, mode === "Request" ? "Failed to submit request." : "Failed to publish post.")
        );
      }

      toast.success(mode === "Request" ? "Request submitted." : "Post published.");

      setTitle("");
      setDescription("");
      setTags("");
      setExtras({});
      setUploadedFiles([]);

      onPostCreated?.(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  return (
    <div className="bg-background border border-border rounded-xl shadow-lg w-full max-w-4xl mx-auto overflow-hidden flex flex-col">
      {/* Header Tabs */}
      <div className="flex border-b border-border bg-muted/30">
        {(["Request", "Post"] as FormMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors relative ${mode === m ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setMode(m)}
          >
            {m === "Request" ? "Request Idea / Guidance" : "Post Idea / Guidance"}
            {mode === m && (
              <motion.div layoutId="form-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8 flex-col flex space-y-6">
        
        {/* Presentation Toolkit */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            {mode === "Request" ? "What are you looking for?" : "Share your knowledge."}
          </h2>
          <button 
            type="button"
            onClick={handleFillDummyData}
            className="flex items-center gap-2 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded-full transition"
          >
            <RefreshCw size={14} />
            Fill Dummy Data
          </button>
        </div>

        {/* Post Type Selector */}
        {mode === "Post" && (
          <div className="relative z-10 w-full sm:w-72">
            <label className="text-sm font-medium text-foreground mb-1 block">Post Category</label>
            <div 
              className="relative p-3 border border-border rounded-lg bg-background text-foreground cursor-pointer flex justify-between items-center shadow-sm hover:border-primary transition"
              onClick={() => setIsVariantOpen(!isVariantOpen)}
            >
              <span className="text-sm font-medium flex items-center gap-2">
                {variant === "Full Project Details" && <FileCode2 size={16} className="text-indigo-500" />}
                {variant === "Project Idea" && <MessageSquarePlus size={16} className="text-green-500" />}
                {variant === "Fully AI-Driven Project" && <Sparkles size={16} className="text-purple-500" />}
                {variant === "Campus Requirement" && <GraduationCap size={16} className="text-orange-500" />}
                {variant}
              </span>
              <ChevronDown size={16} className={`transition-transform ${isVariantOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
              {isVariantOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl overflow-hidden py-1"
                >
                  {variants.map(v => (
                    <div 
                      key={v}
                      className="px-4 py-2 text-sm hover:bg-muted cursor-pointer font-medium"
                      onClick={() => { setVariant(v); setIsVariantOpen(false); }}
                    >
                      {v}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Dynamic Form Sections */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${mode}-${variant}`}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col space-y-5"
          >
            {/* Standard Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
              <input 
                type="text" 
                value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next.js App Router Monorepo"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* General Request Mode */}
            {mode === "Request" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">What exactly are you stuck on? (Markdown)</label>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  title="Request description"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm min-h-30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono"
                  placeholder="Explain your issue or what you need guidance on..."
                />
              </div>
            )}

            {/* Post Modes */}
            {mode === "Post" && (
              <>
                {/* Markdown Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Description (Markdown)</label>
                    <textarea 
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm h-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono"
                      placeholder="# My Awesome Project&#10;Explain what it does..."
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-foreground mb-1 block">Live Preview</label>
                    <div className="flex-1 bg-muted/50 border border-border rounded-lg p-4 overflow-y-auto prose prose-sm dark:prose-invert max-w-none text-sm wrap-break-word">
                      {description ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                      ) : (
                        <span className="text-muted-foreground italic">Markdown preview will appear here...</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Tech Stack</label>
                  <input 
                    type="text" 
                    value={tags} onChange={(e) => setTags(e.target.value)}
                    placeholder="Comma separated (e.g. React, Node, PostgreSQL)"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* --- VARIANT SPECIFIC FIELDS --- */}

                {/* 1. Full Project */}
                {variant === "Full Project Details" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-1"><Link2 size={14}/> GitHub Repo</label>
                      <input type="text" value={extras.github || ""} onChange={e => setExtras({...extras, github: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="https://github.com/..." />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-1"><Link2 size={14}/> Live URL</label>
                      <input type="text" value={extras.live || ""} onChange={e => setExtras({...extras, live: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                    </div>
                    <div className="md:col-span-2 mt-2">
                       <label className="text-sm font-medium text-foreground mb-1 block">File / Zip Upload</label>
                       <input
                         ref={fileInputRef}
                         type="file"
                         multiple
                         accept={DYNAMIC_FORM_ACCEPT}
                         title="Upload project files"
                         className="hidden"
                         onChange={(e) => {
                           void handleFilesChosen(e.target.files);
                           e.currentTarget.value = "";
                         }}
                       />
                       <button
                         type="button"
                         onClick={() => fileInputRef.current?.click()}
                         className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted hover:border-primary transition"
                       >
                         {isUploadingFiles ? <Loader2 size={24} className="mb-2 animate-spin" /> : <Upload size={24} className="mb-2" />}
                         <span className="text-sm font-medium">Click to upload files (all types, including zip)</span>
                         <span className="text-xs mt-1">Max {formatBytes(SUPABASE_MAX_UPLOAD_BYTES)} per file (Supabase bucket limit)</span>
                       </button>

                       {uploadedFiles.length > 0 ? (
                         <div className="mt-3 space-y-2">
                           {uploadedFiles.map((file, idx) => (
                             <div key={`${file.path}_${idx}`} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                               <a href={file.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate max-w-[80%]">
                                 {file.name}
                               </a>
                               <button
                                 type="button"
                                 className="text-muted-foreground hover:text-foreground"
                                 onClick={() => removeUploadedFile(idx)}
                                 aria-label={`Remove ${file.name}`}
                               >
                                 <X size={14} />
                               </button>
                             </div>
                           ))}
                         </div>
                       ) : null}
                    </div>
                  </div>
                )}

                {/* 2. Fully AI-Driven */}
                {variant === "Fully AI-Driven Project" && (
                  <div className="space-y-4 bg-purple-500/5 p-4 rounded-xl border border-purple-500/20">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1"><Sparkles size={14}/> AI Agent Used</label>
                        <input type="text" value={extras.aiAgent || ""} onChange={e => setExtras({...extras, aiAgent: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Gemini 1.5 Pro, Claude 3.5" />
                      </div>
                      <div className="w-32">
                        <label className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1 block">Credits Burned</label>
                        <input type="number" value={extras.aiCredits || ""} onChange={e => setExtras({...extras, aiCredits: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="0" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Campus Requirement */}
                {variant === "Campus Requirement" && (
                  <div className="space-y-4 bg-orange-500/5 p-4 rounded-xl border border-orange-500/20">
                    <div>
                      <label className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1 flex items-center gap-1"><GraduationCap size={14}/> Component Name</label>
                      <input type="text" value={extras.campusComponent || ""} onChange={e => setExtras({...extras, campusComponent: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" placeholder="e.g. User Authentication Module" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1 block">CRUD Targets</label>
                      <textarea value={extras.campusCrud || ""} onChange={e => setExtras({...extras, campusCrud: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm h-20" placeholder="List the CRUD capabilities required by the rubric..." />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Output Submit */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmittingPost}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send size={16} />
                {isSubmittingPost ? "Submitting..." : mode === "Request" ? "Submit Request" : "Publish Post"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
