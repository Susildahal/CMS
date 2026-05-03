"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Pencil, Trash2, Loader2, Search, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { User, UserRole } from "@/lib/types";

const ROLES: UserRole[] = ["admin", "editor", "viewer"];
const STATUSES = ["active", "inactive", "suspended"] as const;

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["admin", "editor", "viewer"]),
  status: z.enum(["active", "inactive", "suspended"]),
});
type FormData = z.infer<typeof schema>;

const INITIAL: User[] = [
  { id: "1", name: "Admin User", email: "admin@company.com", role: "admin", createdAt: "2024-01-01", status: "active" },
  { id: "2", name: "Editor User", email: "editor@company.com", role: "editor", createdAt: "2024-03-15", status: "active" },
  { id: "3", name: "Content Writer", email: "writer@company.com", role: "editor", createdAt: "2024-06-20", status: "active" },
  { id: "4", name: "View Only", email: "viewer@company.com", role: "viewer", createdAt: "2024-09-01", status: "inactive" },
];

const roleColor: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#006caf18", color: "#006caf" },
  editor: { bg: "#f9bb1918", color: "#e0a810" },
  viewer: { bg: "#88888818", color: "#666" },
};
const statusColor: Record<string, { bg: string; color: string }> = {
  active: { bg: "#22c55e18", color: "#22c55e" },
  inactive: { bg: "#88888818", color: "#888" },
  suspended: { bg: "#ef444418", color: "#ef4444" },
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [roleVal, setRoleVal] = useState<UserRole>("editor");
  const [statusVal, setStatusVal] = useState<User["status"]>("active");

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openNew = () => {
    if (currentUser?.role !== "admin") { toast.error("Only admins can add users."); return; }
    setEditing(null); reset({ name: "", email: "", role: "editor", status: "active" });
    setRoleVal("editor"); setStatusVal("active"); setOpen(true);
  };
  const openEdit = (u: User) => {
    if (currentUser?.role !== "admin") { toast.error("Only admins can edit users."); return; }
    setEditing(u); reset({ name: u.name, email: u.email, role: u.role, status: u.status });
    setRoleVal(u.role); setStatusVal(u.status); setOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 600));
    if (editing) {
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...data } : u));
      toast.success("User updated!");
    } else {
      const newUser: User = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString().split("T")[0] };
      setUsers(prev => [...prev, newUser]);
      toast.success("User created!");
    }
    setOpen(false);
  };

  const deleteUser = (id: string) => {
    if (id === currentUser?.id) { toast.error("You cannot delete your own account."); return; }
    if (currentUser?.role !== "admin") { toast.error("Only admins can delete users."); return; }
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success("User removed.");
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" style={{ color: "#006caf" }} /> User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} total users · {users.filter(u => u.status === "active").length} active</p>
        </div>
        <Button onClick={openNew} className="text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="add-user-btn">
          <Plus className="h-4 w-4 mr-1" /> Add User
        </Button>
      </div>

      {currentUser?.role !== "admin" && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          You have view-only access. Only admins can create, edit, or delete users.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROLES.map(role => (
          <Card key={role} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: roleColor[role].bg }}>
                <Users className="h-4 w-4" style={{ color: roleColor[role].color }} />
              </div>
              <div>
                <p className="text-xl font-bold">{users.filter(u => u.role === role).length}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}s</p>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "#ef444418" }}>
              <Users className="h-4 w-4" style={{ color: "#ef4444" }} />
            </div>
            <div>
              <p className="text-xl font-bold">{users.filter(u => u.status !== "active").length}</p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="user-search"
          placeholder="Search by name or email..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => {
              const r = roleColor[u.role];
              const s = statusColor[u.status];
              const initials = u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
              return (
                <TableRow key={u.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{u.name} {u.id === currentUser?.id && <span className="text-[10px] text-muted-foreground">(you)</span>}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize" style={{ background: r.bg, color: r.color }}>{u.role}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize" style={{ background: s.bg, color: s.color }}>{u.status}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(u)} id={`edit-user-${u.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteUser(u.id)} id={`delete-user-${u.id}`} disabled={u.id === currentUser?.id}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit User" : "Add New User"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="user-form">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Full Name *</Label>
              <Input id="user-name" {...register("name")} placeholder="John Doe" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email *</Label>
              <Input id="user-email" type="email" {...register("email")} placeholder="john@company.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Role *</Label>
                <Select value={roleVal} onValueChange={(v) => { if (v) { setRoleVal(v as UserRole); setValue("role", v as UserRole); } }}>
                  <SelectTrigger id="user-role"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select value={statusVal} onValueChange={(v) => { if (v) { setStatusVal(v as User["status"]); setValue("status", v as User["status"]); } }}>
                  <SelectTrigger id="user-status"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" id="cancel-user-btn">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 text-white" style={{ background: "linear-gradient(135deg,#006caf,#005a94)" }} id="save-user-btn">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editing ? "Update User" : "Create User")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
