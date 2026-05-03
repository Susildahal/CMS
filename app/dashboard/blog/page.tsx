"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Pencil, Trash2, Loader2, Calendar, User } from "lucide-react";
import type { BlogPost } from "@/lib/types";

const STATUS_OPTIONS = ["draft", "published", "archived"] as const;

const schema = z.object({
  title: z.string().min(5, "Title required"),
  slug: z.string().min(3, "Slug required").regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, hyphens only"),
  excerpt: z.string().min(20, "Excerpt required"),
  content: z.string().min(50, "Content required"),
  author: z.string().min(2, "Author required"),
  imageUrl: z.string().url("Must be valid URL").or(z.literal("")),
  tags: z.string(),
  status: z.enum(STATUS_OPTIONS),
});
type FormData = z.infer<typeof schema>;

const INITIAL: BlogPost[] = [
  { id: "1", title: "Top 10 IT Trends to Watch in 2025", slug: "it-trends-2025", excerpt: "Artificial intelligence, quantum computing, and edge computing are reshaping the IT landscape.", content: "Full article content here...", author: "James Carter", imageUrl: "", tags: ["AI", "Trends", "Technology"], publishedAt: "2024-11-15", status: "published" },
  { id: "2", title: "How Cloud Migration Saves Businesses 40%", slug: "cloud-migration-savings", excerpt: "A practical guide to reducing infrastructure costs through strategic cloud adoption.", content: "Full article content here...", author: "Sarah Johnson", imageUrl: "", tags: ["Cloud", "Cost", "Business"], publishedAt: "2024-11-10", status: "published" },
  { id: "3", title: "The Future of Cybersecurity: Zero Trust Model", slug: "zero-trust-security", excerpt: "Why traditional perimeter security is obsolete and how zero trust protects modern enterprises.", content: "Draft content...", author: "Mike Chen", imageUrl: "", tags: ["Security", "Enterprise"], publishedAt: "2024-11-01", status: "draft" },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  published: { bg: "#22c55e18", color: "#22c55e" },
  draft: { bg: "#f9bb1918", color: "#e0a810" },
  archived: { bg: "#88888818", color: "#888" },
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [statusVal, setStatusVal] = useState<BlogPost["status"]>("draft");

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openNew = () => {
    setEditing(null);
    reset({ title: "", slug: "", excerpt: "", content: "", author: "", imageUrl: "", tags: "", status: "draft" });
    setStatusVal("draft"); setOpen(true);
  };
  const openEdit = (p: BlogPost) => {
    setEditing(p);
    reset({ ...p, tags: p.tags.join(", ") });
    setStatusVal(p.status); setOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    const newPost = { ...data, tags: data.tags.split(",").map(t => t.trim()).filter(Boolean), publishedAt: new Date().toISOString().split("T")[0] };
    if (editing) {
      setPosts(prev => prev.map(p => p.id === editing.id ? { ...p, ...newPost } : p));
      toast.success("Post updated!");
    } else {
      setPosts(prev => [...prev, { id: Date.now().toString(), ...newPost }]);
      toast.success("Post created!");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" style={{ color: "#006caf" }} /> Blog
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {posts.filter(p => p.status === "published").length} published · {posts.filter(p => p.status === "draft").length} drafts
          </p>
        </div>
        <Button onClick={openNew} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="add-post-btn">
          <Plus className="h-4 w-4 mr-1" /> New Post
        </Button>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => {
          const s = statusStyle[post.status];
          return (
            <Card key={post.id} className="border-border hover:shadow-md transition-all group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "#006caf18" }}>📝</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{post.title}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0" style={{ background: s.bg, color: s.color }}>
                            {post.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.publishedAt}</span>
                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">/{post.slug}</code>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(post)} id={`edit-post-${post.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setPosts(prev => prev.filter(p => p.id !== post.id)); toast.success("Deleted."); }} id={`delete-post-${post.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-1">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px]" style={{ borderColor: "#006caf40", color: "#006caf" }}>{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Post" : "New Blog Post"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="blog-form">
            <div className="space-y-1.5">
              <Label htmlFor="blog-title">Title *</Label>
              <Input id="blog-title" {...register("title")} placeholder="Top 10 IT Trends..." />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="blog-slug">Slug *</Label>
                <Input id="blog-slug" {...register("slug")} placeholder="it-trends-2025" />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="blog-author">Author *</Label>
                <Input id="blog-author" {...register("author")} placeholder="James Carter" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blog-excerpt">Excerpt *</Label>
              <Textarea id="blog-excerpt" {...register("excerpt")} rows={2} placeholder="Short summary..." />
              {errors.excerpt && <p className="text-xs text-destructive">{errors.excerpt.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blog-content">Content *</Label>
              <Textarea id="blog-content" {...register("content")} rows={5} placeholder="Full article content..." />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="blog-tags">Tags (comma-separated)</Label>
                <Input id="blog-tags" {...register("tags")} placeholder="AI, Cloud, Tech" />
              </div>
              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select value={statusVal} onValueChange={(value: BlogPost["status"] | null) => {
                  const v = value ?? "draft";
                  setStatusVal(v);
                  setValue("status", v);
                }}>
                  <SelectTrigger id="blog-status"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="blog-img">Cover Image URL</Label>
              <Input id="blog-img" {...register("imageUrl")} placeholder="https://..." />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-post-btn">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="save-post-btn">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Update Post" : "Create Post")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
