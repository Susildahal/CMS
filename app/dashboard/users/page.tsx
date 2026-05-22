"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";


import {
  Users, Plus, Loader2, Trash2, Pencil, MoreHorizontal,
  Search, ShieldAlert, Check, X, Shield, Mail, UserCircle
} from "lucide-react";
import { StrapiDataTable } from "@/components/datatable";

// --- Types & Schemas (Aligned with Strapi Admin Users) ---
interface AdminRole {
  id: number;
  name: string;
  description?: string;
  code?: string;
}

interface AdminUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  roles?: AdminRole[];
  username?: string;
}

const schema = z.object({
  // Strapi admin validation expects trimmed strings.
  firstname: z.string().trim().min(2, "First name is required"),
  lastname: z.string().trim().min(2, "Last name is required"),
  email: z.string().trim().email("Valid email required"),
  // Strapi Admin API invite flow (POST /admin/users) does NOT accept password/isActive.
  // We still keep these in the form schema because edit (PUT /admin/users/:id) supports them.
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  roles: z.array(z.number()).min(1, "At least one role is required"),
});

type FormData = z.infer<typeof schema>;

export default function UsersPage() {
  // ==========================================
  // STATE
  // ==========================================
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, roles: [] }
  });

  const isActiveValue = watch("isActive") ?? true;

  // ==========================================
  // API FETCHING
  // ==========================================
  const fetchUsersAndRoles = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch Admin Users & Admin Roles simultaneously
      const [usersRes, rolesRes] = await Promise.all([
        apiClient.get("/admin/users"),
        apiClient.get("/admin/roles")
      ]);

      // Safely extract arrays from Strapi's admin responses
      const rawUsers = usersRes.data?.data?.results || usersRes.data?.data || usersRes.data || [];
      const rawRoles = rolesRes.data?.data?.results || rolesRes.data?.data || rolesRes.data || [];

      setUsers(Array.isArray(rawUsers) ? rawUsers : []);
      setAvailableRoles(Array.isArray(rawRoles) ? rawRoles : []);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to load admin users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const openNew = () => {
    setEditingUser(null);
    reset({ firstname: "", lastname: "", email: "", password: "", isActive: true, roles: [] });
    setOpenDialog(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    const currentRoleIds = u.roles ? u.roles.map((r) => r.id) : [];
    reset({
      firstname: u.firstname,
      lastname: u.lastname,
      email: u.email,
      password: "", // Hide existing password
      isActive: u.isActive,
      roles: currentRoleIds,
    });
    setOpenDialog(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Strapi v5 Admin API:
      // - POST /admin/users is an invite endpoint: accepts firstname, lastname, email, roles.
      //   Sending password/isActive causes: "this field has unspecified keys".
      // - PUT /admin/users/:id can accept isActive and password.
      const payload: any = {
        // Extra safety: trim again before sending (covers any future schema changes).
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        email: data.email.trim().toLowerCase(),
        roles: data.roles,
      };

      if (editingUser) {
        if (typeof data.isActive === "boolean") {
          payload.isActive = data.isActive;
        }
        if (data.password) {
          payload.password = data.password;
        }
        await apiClient.put(`/admin/users/${editingUser.id}`, payload);
        toast.success("User updated successfully!");
      } else {
        await apiClient.post("/admin/users", payload);
        toast.success("Invite sent! The user will receive an email to finish registration.");
      }
      setOpenDialog(false);
      fetchUsersAndRoles();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to save user");
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];

  const activeCount = safeUsers.filter(u => u.isActive).length;
  const inactiveCount = safeUsers.filter(u => !u.isActive).length;

  // ==========================================
  // TABLE COLUMNS
  // ==========================================
  const columns = [
    {
      key: "userDetails",
      label: "User Details",
      render: (val: any, u: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#006caf10] flex items-center justify-center shrink-0">
            <UserCircle className="h-5 w-5 text-[#006caf]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{u.firstname} {u.lastname}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> {u.email}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "roles",
      label: "Roles",
      render: (val: any, u: any) => (
        <div className="flex flex-wrap gap-1">
          {u.roles && u.roles.length > 0 ? (
            u.roles.map((r: any) => (
              <Badge key={r.id} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-[#006caf15] text-[#006caf] border-none font-medium gap-1">
                <Shield className="h-3 w-3" /> {r.name}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      )
    },
    {
      key: "isActive",
      label: "Status",
      render: (val: any, u: any) => (
        u.isActive ? (
          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200 shadow-none">Active</Badge>
        ) : (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 shadow-none">Inactive</Badge>
        )
      )
    },
    {
    key:"createdAt",
    label:"Created At",
    hidden: true,
     hideable: true 
    },


  ];

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-[#006caf]" />
            Administrator Users
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage admin panel users and assign roles.
          </p>
        </div>
        <Button onClick={openNew} className="text-white bg-gradient-to-br from-[#006caf] to-[#005a94]">
          <Plus className="h-4 w-4 mr-1" /> Add User
        </Button>
      </div>

      {/* Stats Cards - Matching Roles Page Style */}
      <div className="grid grid-cols-3 gap-3 max-w-2xl">
        <div className="p-4 rounded-xl border bg-card space-y-1">
          <p className="text-xs text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold text-[#006caf]">{users.length}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card space-y-1">
          <p className="text-xs text-muted-foreground">Active Users</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card space-y-1">
          <p className="text-xs text-muted-foreground">Inactive / Suspended</p>
          <p className="text-2xl font-bold text-red-500">{inactiveCount}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="  overflow-hidden  ">
        <StrapiDataTable 
          key={refreshKey}
          endpoint="/admin/users"
          columns={columns}
          sortField="id:desc"
          populate={false}
          onEdit={openEdit}
        />
      </div>


      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-[#006caf]" />
              {editingUser ? "Edit Admin User" : "Invite Admin User"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstname">First Name *</Label>
                <Input id="firstname" {...register("firstname")} placeholder="John" />
                {errors.firstname && <p className="text-xs text-destructive">{errors.firstname.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastname">Last Name *</Label>
                <Input id="lastname" {...register("lastname")} placeholder="Doe" />
                {errors.lastname && <p className="text-xs text-destructive">{errors.lastname.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {editingUser && (
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  Password <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>
                </Label>
                <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            )}

            {/* Roles Selection */}
            {availableRoles.length > 0 && (
              <div className="space-y-2">
                <Label>Assign Roles *</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-card">
                  {availableRoles.map((role) => {
                    const selectedRoles = watch("roles") || [];
                    const isSelected = selectedRoles.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setValue("roles", selectedRoles.filter((id) => id !== role.id));
                          } else {
                            setValue("roles", [...selectedRoles, role.id]);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isSelected
                          ? "bg-[#006caf] border-[#006caf] text-white"
                          : "bg-background border-border hover:border-[#006caf]/50 text-foreground"
                          }`}
                      >
                        {role.name}
                      </button>
                    );
                  })}
                </div>
                {errors.roles && <p className="text-xs text-destructive">{errors.roles.message}</p>}
              </div>
            )}

            {editingUser && (
              <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                <div className="flex flex-col gap-0.5">
                  <Label className="text-sm cursor-pointer" onClick={() => setValue("isActive", !isActiveValue)}>Active Status</Label>
                  <span className="text-xs text-muted-foreground">Allow user to log in to the admin panel.</span>
                </div>
                <Switch
                  checked={isActiveValue}
                  onCheckedChange={(val) => setValue("isActive", val)}
                  className="data-[state=checked]:bg-[#006caf]"
                />
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="text-white bg-[#006caf] hover:bg-[#005a94]">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingUser ? "Update User" : "Invite User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
 
    </div>
  );
}