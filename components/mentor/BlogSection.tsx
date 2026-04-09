"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, FileText, Image, Link2, Save, BookOpen } from "lucide-react";

/* ───── Schema ───── */
const blogSchema = z.object({
  title:    z.string().min(3, "Title must be at least 3 characters."),
  content:  z.string().min(20, "Content must be at least 20 characters."),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  videoUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
});
type BlogInput = z.infer<typeof blogSchema>;

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "b1",
    title: "Effective Code Review Strategies",
    content: "Code reviews are one of the most powerful practices in software teams. Here's how to make them more effective for your mentees — focus on logic and readability, not just style. Establish a checklist and always provide constructive, specific feedback rather than vague criticism.",
    imageUrl: "",
    videoUrl: "",
    createdAt: "2026-03-26",
  },
  {
    id: "b2",
    title: "How to Guide Students Through a Final Year Project",
    content: "Final year projects require structured mentorship. Break the project into three phases: discovery, execution, and delivery. Ensure weekly check-ins with documented milestones, and teach students to use Git effectively from day one.",
    imageUrl: "",
    videoUrl: "",
    createdAt: "2026-03-20",
  },
];

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export function BlogSection() {
  const [blogs, setBlogs] = React.useState<BlogPost[]>(INITIAL_BLOGS);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const IMAGE_MAX = 2 * 1024 * 1024; // 2MB
  const VIDEO_MAX = 50 * 1024 * 1024; // 50MB
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
  const ALLOWED_VIDEO_EXT = [".mp4", ".webm", ".ogg"];
  const [imageFileError, setImageFileError] = React.useState<string | null>(null);
  const [videoFileError, setVideoFileError] = React.useState<string | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);
  const imageRef = React.useRef<File | null>(null);
  const videoRef = React.useRef<File | null>(null);

  function hasAllowedExtension(url: string, allowed: string[]) {
    try {
      const pathname = new URL(url).pathname;
      const idx = pathname.lastIndexOf(".");
      if (idx === -1) return false;
      const ext = pathname.slice(idx).toLowerCase();
      return allowed.includes(ext);
    } catch {
      return false;
    }
  }

  function validateImageUrlValue(url: string) {
    if (!url) {
      setImageFileError(null);
      setImagePreview(null);
      return;
    }
    if (!hasAllowedExtension(url, ALLOWED_IMAGE_EXT)) {
      setImageFileError("Image URL must end with .jpg, .jpeg, .png, .webp, or .gif");
      setImagePreview(null);
      return;
    }
    setImageFileError(null);
    setImagePreview(url);
  }

  function validateVideoUrlValue(url: string) {
    if (!url) {
      setVideoFileError(null);
      setVideoPreview(null);
      return;
    }
    if (!hasAllowedExtension(url, ALLOWED_VIDEO_EXT)) {
      setVideoFileError("Video URL must end with .mp4, .webm, or .ogg");
      setVideoPreview(null);
      return;
    }
    setVideoFileError(null);
    setVideoPreview(url);
  }

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<BlogInput>({
    resolver: zodResolver(blogSchema),
    mode: "onChange",
    defaultValues: { title: "", content: "", imageUrl: "", videoUrl: "" },
  });

  function openNew() {
    reset({ title: "", content: "", imageUrl: "", videoUrl: "" });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(blog: BlogPost) {
    setValue("title", blog.title);
    setValue("content", blog.content);
    setValue("imageUrl", blog.imageUrl ?? "");
    setValue("videoUrl", blog.videoUrl ?? "");
    // set previews when editing existing blog
    if (blog.imageUrl) setImagePreview(blog.imageUrl);
    else setImagePreview(null);
    if (blog.videoUrl) setVideoPreview(blog.videoUrl);
    else setVideoPreview(null);
    setEditingId(blog.id);
    setShowForm(true);
  }

  function deleteBlog(id: string) {
    setBlogs(prev => prev.filter(b => b.id !== id));
    toast.success("Blog deleted.");
  }

  function onSubmit(data: BlogInput) {
    if (editingId) {
      setBlogs(prev => prev.map(b => b.id === editingId
        ? { ...b, title: data.title, content: data.content, imageUrl: data.imageUrl, videoUrl: data.videoUrl }
        : b
      ));
      toast.success("Blog updated! ✨");
    } else {
      const newBlog: BlogPost = {
        id: `b_${Date.now()}`,
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setBlogs(prev => [newBlog, ...prev]);
      toast.success("Blog published! 🎉");
    }
    reset({ title: "", content: "", imageUrl: "", videoUrl: "" });
    // revoke any previews and clear refs
    if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    if (videoPreview && videoPreview.startsWith("blob:")) URL.revokeObjectURL(videoPreview);
    imageRef.current = null;
    videoRef.current = null;
    setImagePreview(null);
    setVideoPreview(null);
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Blog</h2>
          <p className="text-sm text-slate-500 mt-0.5">Share insights and guides with your mentees</p>
        </div>
        {!showForm && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0F0F0F] to-[#1A1A2E] px-5 py-2.5 text-sm font-semibold text-[#FFFFFF] shadow-sm hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Create Blog
          </button>
        )}
      </div>

      {/* Blog Form */}
      {showForm && (
        <div className="rounded-2xl border border-[#FFCBA4]/30 bg-white shadow-md overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-white to-white px-6 py-4 border-b border-[#FFCBA4]/30">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0F0F0F]" />
              {editingId ? "Edit Blog Post" : "New Blog Post"}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                placeholder="e.g., How to Conduct Effective 1-on-1 Meetings"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
              />
              <FieldError msg={errors.title?.message} />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("content")}
                rows={6}
                placeholder="Write your blog content here. Minimum 20 characters..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all resize-none"
              />
              <FieldError msg={errors.content?.message} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Image className="h-3.5 w-3.5 text-slate-400" />
                  Image URL <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  {...register("imageUrl")}
                  type="url"
                  placeholder="https://example.com/image.png"
                  onBlur={(e) => validateImageUrlValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
                />
                  <FieldError msg={errors.imageUrl?.message} />
                  <label className="text-sm text-slate-500">Or upload an image (max 2MB)</label>
                  <input
                    accept="image/*"
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (!f) return;
                      const lcType = f.type.toLowerCase();
                      const nameLower = f.name.toLowerCase();
                      const ext = nameLower.includes('.') ? nameLower.slice(nameLower.lastIndexOf('.')) : '';
                      if (!ALLOWED_IMAGE_TYPES.includes(lcType) || !ALLOWED_IMAGE_EXT.includes(ext)) {
                        setImageFileError("Unsupported image format. Allowed: jpg, jpeg, png, webp, gif.");
                        return;
                      }
                      if (f.size > IMAGE_MAX) {
                        setImageFileError("Image is too large. Max 2MB.");
                        return;
                      }
                      setImageFileError(null);
                      // revoke previous preview if blob
                      if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
                      const url = URL.createObjectURL(f);
                      imageRef.current = f;
                      setImagePreview(url);
                      setValue("imageUrl", url);
                    }}
                    className="mt-2"
                  />
                  {imageFileError ? <p className="text-xs text-red-500">{imageFileError}</p> : null}
                  {imagePreview ? (
                    <div className="mt-2 h-40 w-full overflow-hidden rounded-md">
                      <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                    </div>
                  ) : null}
              </div>

              {/* Video URL */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 text-slate-400" />
                  Video URL <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  {...register("videoUrl")}
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  onBlur={(e) => validateVideoUrlValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFCBA4] transition-all"
                />
                <FieldError msg={errors.videoUrl?.message} />
                <label className="text-sm text-slate-500">Or upload a video (max 50MB)</label>
                <input
                  accept="video/*"
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (!f) return;
                      const lcType = f.type.toLowerCase();
                      const nameLower = f.name.toLowerCase();
                      const ext = nameLower.includes('.') ? nameLower.slice(nameLower.lastIndexOf('.')) : '';
                      if (!ALLOWED_VIDEO_TYPES.includes(lcType) || !ALLOWED_VIDEO_EXT.includes(ext)) {
                        setVideoFileError("Unsupported video format. Allowed: mp4, webm, ogg.");
                        return;
                      }
                      if (f.size > VIDEO_MAX) {
                        setVideoFileError("Video is too large. Max 50MB.");
                        return;
                      }
                    setVideoFileError(null);
                    if (videoPreview && videoPreview.startsWith("blob:")) URL.revokeObjectURL(videoPreview);
                    const url = URL.createObjectURL(f);
                    videoRef.current = f;
                    setVideoPreview(url);
                    setValue("videoUrl", url);
                  }}
                  className="mt-2"
                />
                {videoFileError ? <p className="text-xs text-red-500">{videoFileError}</p> : null}
                {videoPreview ? (
                  <div className="mt-2">
                    <video src={videoPreview} controls className="w-full rounded-md max-h-48" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); reset(); }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0F0F0F] to-[#1A1A2E] px-6 py-2.5 text-sm font-semibold text-[#FFFFFF] shadow-sm hover:brightness-110 disabled:opacity-60 transition-all duration-200"
              >
                <Save className="h-4 w-4" />
                {editingId ? "Save Changes" : "Publish Blog"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blog Grid */}
      {blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#FFCBA4]/30 bg-[#FFCBA4]/5 py-16 text-center">
          <BookOpen className="h-10 w-10 text-[#F5A97F] mb-3" />
          <p className="text-slate-600 font-medium">No blogs yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "Create Blog" to write your first post.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {blogs.map(blog => (
            <div key={blog.id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              {/* Image preview */}
              {blog.imageUrl && (
                <div className="h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              {!blog.imageUrl && (
                <div className="h-2 w-full bg-gradient-to-r from-[#0F0F0F] via-[#1c0f00] to-[#FFCBA4]" />
              )}

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-slate-800 text-base leading-snug">{blog.title}</h4>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => openEdit(blog)}
                      className="rounded-lg p-2 text-slate-400 hover:text-[#0F0F0F] hover:bg-[#FFCBA4]/10 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteBlog(blog.id)}
                      className="rounded-lg p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{blog.content}</p>
                {blog.videoUrl && (
                  <a
                    href={blog.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F0F0F] hover:underline"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Watch Video
                  </a>
                )}
                <div className="text-xs text-slate-400 pt-1 border-t border-slate-50">{blog.createdAt}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
