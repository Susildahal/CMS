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
import { UserPlus, Plus, Pencil, Trash2, Loader2, MapPin, Clock } from "lucide-react";
import type { Job } from "@/lib/types";
import Editor from "@/components/editor";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote"] as const;

const schema = z.object({
  title: z.string().min(2, "Title required"),
  department: z.string().min(2, "Department required"),
  location: z.string().min(2, "Location required"),
  type: z.enum(JOB_TYPES),
  description: z.string().min(20, "Description required"),
  requirements: z.string().min(10, "At least one requirement"),
  status: z.enum(["open", "closed"]),
});
type FormData = z.infer<typeof schema>;

const INITIAL: Job[] = [
  { id: "1", title: "Senior React Developer", department: "Engineering", location: "Remote", type: "Full-time", description: "Build and maintain modern web applications.", requirements: ["5+ years React", "TypeScript proficiency", "REST/GraphQL"], postedDate: "2024-11-01", status: "open" },
  { id: "2", title: "UI/UX Designer", department: "Design", location: "New York", type: "Full-time", description: "Create beautiful user experiences.", requirements: ["Figma expert", "3+ years experience", "Design systems"], postedDate: "2024-11-10", status: "open" },
  { id: "3", title: "DevOps Engineer", department: "Infrastructure", location: "Remote", type: "Contract", description: "Manage CI/CD pipelines and cloud infrastructure.", requirements: ["AWS/GCP", "Kubernetes", "Docker"], postedDate: "2024-10-15", status: "closed" },
];

export default function CareerPage() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [typeVal, setTypeVal] = useState<Job["type"]>("Full-time");
  const [statusVal, setStatusVal] = useState<"open" | "closed">("open");
  const [content, setContent] = useState("");
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openNew = () => { setEditing(null); reset({ title: "", department: "", location: "", type: "Full-time", description: "", requirements: "", status: "open" }); setTypeVal("Full-time"); setStatusVal("open"); setOpen(true); };
  const openEdit = (j: Job) => {
    setEditing(j);
    reset({ ...j, requirements: j.requirements.join("\n") });
    setTypeVal(j.type); setStatusVal(j.status);
    setOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    const jobData = { ...data, requirements: data.requirements.split("\n").map(s => s.trim()).filter(Boolean), postedDate: new Date().toISOString().split("T")[0] };
    if (editing) {
      setJobs(prev => prev.map(j => j.id === editing.id ? { ...j, ...jobData } : j));
      toast.success("Job updated!");
    } else {
      setJobs(prev => [...prev, { id: Date.now().toString(), ...jobData }]);
      toast.success("Job posted!");
    }
    setOpen(false);
  };

  const statusColor = { open: "#22c55e", closed: "#ef4444" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" style={{ color: "#006caf" }} /> Career
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage job openings on your website.</p>
        </div>
        <Button onClick={openNew} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="add-job-btn">
          <Plus className="h-4 w-4 mr-1" /> Post Job
        </Button>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="border-border hover:shadow-md transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold">{job.title}</p>
                    <Badge className="text-[10px] text-white" style={{ background: job.status === "open" ? "#006caf" : "#888" }}>
                      {job.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{job.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                    <span>{job.department}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.postedDate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{job.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.requirements.map((r, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#006caf18", color: "#006caf" }}>{r}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(job)} id={`edit-job-${job.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setJobs(prev => prev.filter(j => j.id !== job.id)); toast.success("Job removed."); }} id={`delete-job-${job.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Job" : "Post New Job"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="job-form">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="job-title">Job Title *</Label>
                <Input id="job-title" {...register("title")} placeholder="Senior Developer" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="job-dept">Department *</Label>
                <Input id="job-dept" {...register("department")} placeholder="Engineering" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="job-loc">Location *</Label>
                <Input id="job-loc" {...register("location")} placeholder="Remote" />
              </div>
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={typeVal} onValueChange={(v: Job["type"]) => { setTypeVal(v); setValue("type", v); }}>
                  <SelectTrigger id="job-type"><SelectValue /></SelectTrigger>
                  <SelectContent>{JOB_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select value={statusVal} onValueChange={(v: "open" | "closed") => { setStatusVal(v); setValue("status", v); }}>
                  <SelectTrigger id="job-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job-desc">Description *</Label>
              <Editor value={content} onChange={setContent} placeholder=" enter a detailed job description..." />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job-reqs">Requirements * <span className="text-muted-foreground font-normal">(one per line)</span></Label>
              <Textarea id="job-reqs" {...register("requirements")} rows={3} placeholder={"5+ years React\nTypeScript\nREST API"} />
              {errors.requirements && <p className="text-xs text-destructive">{errors.requirements.message}</p>}
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-job-btn">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="save-job-btn">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Update" : "Post Job")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
