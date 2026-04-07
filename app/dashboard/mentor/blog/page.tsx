"use client"

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type BlogItem = { id: string; title: string; content: string; date: string };

export default function BlogPage() {
  const [blogs, setBlogs] = React.useState<BlogItem[]>([]);
  const [blogOpen, setBlogOpen] = React.useState(false);
  const blogForm = useForm<{ title: string; content: string; imageUrl?: string }>({ defaultValues: { title: "", content: "", imageUrl: "" } });

  function addBlog(values: { title: string; content: string }) {
    const next: BlogItem = { id: `b-${Date.now()}`, title: values.title, content: values.content, date: new Date().toISOString() };
    setBlogs((s) => [next, ...s]);
    setBlogOpen(false);
    blogForm.reset();
    toast.success("Blog created.");
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>Manage articles for mentees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-3">
            <Button onClick={() => setBlogOpen(true)}>Create Post</Button>
          </div>

          <div className="space-y-3">
            {blogs.length === 0 ? <div className="text-sm text-muted-foreground">No posts yet.</div> : null}
            <div className="grid gap-3">
              {blogs.map((b) => (
                <div key={b.id} className="border p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{b.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(b.date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => setBlogs((s) => s.filter((x) => x.id !== b.id))}>Delete</Button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{b.content}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={blogOpen} onOpenChange={setBlogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Blog Post</DialogTitle>
            <DialogDescription>Write a short post to share mentoring tips or updates.</DialogDescription>
          </DialogHeader>

          <form onSubmit={blogForm.handleSubmit((v) => addBlog({ title: v.title, content: v.content }))} className="space-y-3 mt-4">
            <Input placeholder="Title" {...blogForm.register("title")} />
            <Textarea placeholder="Content" {...blogForm.register("content")} />
            <Input placeholder="Image URL (optional)" {...blogForm.register("imageUrl")} />

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBlogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#0F0F0F] text-[#FFCBA4] hover:brightness-125">Publish</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
