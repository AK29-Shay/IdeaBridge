"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Send, FileCode2, Sparkles, GraduationCap, Link2, Upload, MessageSquarePlus, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

type FormMode = "Request" | "Post";
type PostVariant = "Full Project Details" | "Project Idea" | "Fully AI-Driven Project" | "Campus Requirement";

export default function DynamicPostForm() {
  const [mode, setMode] = useState<FormMode>("Post");
  const [variant, setVariant] = useState<PostVariant>("Full Project Details");
  const [isVariantOpen, setIsVariantOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});

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

  const formVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.2 } }
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
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono"
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
                    <div className="flex-1 bg-muted/50 border border-border rounded-lg p-4 overflow-y-auto prose prose-sm dark:prose-invert max-w-none text-sm break-words">
                      {description ? (
                        <ReactMarkdown>{description}</ReactMarkdown>
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
                       <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted hover:border-primary transition cursor-pointer">
                         <Upload size={24} className="mb-2" />
                         <span className="text-sm font-medium">Click to upload or drag & drop</span>
                       </div>
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
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-md">
                <Send size={16} />
                {mode === "Request" ? "Submit Request" : "Publish Post"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
