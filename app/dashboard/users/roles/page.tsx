"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Icons ---
import {
  Shield, Plus, Loader2, Trash2, Pencil, MoreHorizontal, 
  Eye, AlertTriangle, Users, Lock, Settings, Check, X,
  ChevronDown, ChevronRight, ArrowLeft
} from "lucide-react";

// --- Types & Schemas ---
const schema = z.object({
  name: z.string().min(2, "Role name is required"),
  description: z.string().min(5, "Description is required"),
});

type FormData = z.infer<typeof schema>;

interface StrapiRole {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Strapi Admin API uses `usersCount` (admin::role)
  usersCount?: number;
  // Legacy field used by some custom endpoints
  nb_users?: number;
}

interface PermissionGroup {
  [subject: string]: {
    [action: string]: {
      enabled: boolean;
      permissionId?: number;
    };
  };
}

export default function CombinedRolesPage() {
  // ==========================================
  // STATE: ROLES MANAGEMENT
  // ==========================================
  const [roles, setRoles] = useState<StrapiRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Dialog States
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "view">("add");
  const [selectedRole, setSelectedRole] = useState<StrapiRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StrapiRole | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // ==========================================
  // STATE: PERMISSIONS MANAGEMENT
  // ==========================================
  const [activeRoleForPerms, setActiveRoleForPerms] = useState<StrapiRole | null>(null);
  const [permissions, setPermissions] = useState<PermissionGroup>({});
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [permsError, setPermsError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // ==========================================
  // EFFECTS & DATA FETCHING
  // ==========================================

  // 1. Fetch Roles List
  const fetchRoles = useCallback(async () => {
    try {
      setLoadingRoles(true);
      const res = await apiClient.get("/admin/roles");
      const payload = res.data?.data;
      // Strapi returns { data: Role[] }
      setRoles(Array.isArray(payload) ? payload : (payload?.results ?? []));
    } catch (error) {
      toast.error("Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  // 2. Fetch Permissions when a role is selected for permission editing
  useEffect(() => {
    if (!activeRoleForPerms) return;

    const fetchRoleAndPermissions = async () => {
      try {
        setLoadingPerms(true);
        setPermsError(null);

        const [rolePermsRes, allPermsRes] = await Promise.all([
          apiClient.get(`/admin/roles/${activeRoleForPerms.id}/permissions`),
          apiClient.get("/admin/permissions"),
        ]);

        const rolePerms: any[] = rolePermsRes.data?.data ?? [];

        // Strapi Admin permissions are returned as nested sections.
        // We normalize them into a flat list of (action, subject) pairs.
        const rawAllPerms = allPermsRes.data?.data;
        const sections = rawAllPerms?.sections;

        type PermPair = { action: string; subject: string | null };
        const pairs: PermPair[] = [];

        const pushPair = (action: unknown, subject: unknown) => {
          if (typeof action !== "string" || !action) return;
          pairs.push({ action, subject: typeof subject === "string" ? subject : null });
        };

        if (sections && typeof sections === "object") {
          Object.values(sections as Record<string, any>).forEach((section: any) => {
            // plugins/settings sections: Action list, with `action` property (actionId)
            if (Array.isArray(section)) {
              section.forEach((item) => pushPair(item?.action, null));
              return;
            }

            // collectionTypes/singleTypes: { actions: Action[], subjects: Subject[] }
            if (section && typeof section === "object" && Array.isArray(section.actions)) {
              section.actions.forEach((a: any) => {
                const actionId = a?.actionId ?? a?.action;
                if (Array.isArray(a?.subjects) && a.subjects.length > 0) {
                  a.subjects.forEach((uid: any) => pushPair(actionId, uid));
                } else {
                  // Some actions may not require a subject
                  pushPair(actionId, null);
                }
              });
            }
          });
        }

        const grouped: PermissionGroup = {};

        // Populate all as disabled
        pairs.forEach(({ subject, action }) => {
          if (!subject) return; // Skip global
          const subjectKey = subject;
          if (!grouped[subjectKey]) grouped[subjectKey] = {};
          grouped[subjectKey][action] = { enabled: false };
        });

        // Override with enabled
        rolePerms.forEach((perm) => {
          if (!perm.subject) return; // Skip global
          const subjectKey = perm.subject;
          const action = perm.action;
          if (!grouped[subjectKey]) grouped[subjectKey] = {};
          grouped[subjectKey][action] = { enabled: true, permissionId: perm.id };
        });

        setPermissions(grouped);
        const firstKey = Object.keys(grouped)[0];
        if (firstKey) setOpenSections(new Set([firstKey]));

      } catch (error: any) {
        setPermsError("Failed to load permissions from the server.");
        toast.error("Failed to load permissions");
      } finally {
        setLoadingPerms(false);
      }
    };

    fetchRoleAndPermissions();
  }, [activeRoleForPerms]);

  // ==========================================
  // HANDLERS: ROLES
  // ==========================================
  const openAddRole = () => {
    setMode("add");
    setSelectedRole(null);
    reset({ name: "", description: "" });
    setOpenDialog(true);
  };

  const openEditRole = (role: StrapiRole) => {
    setMode("edit");
    setSelectedRole(role);
    reset({ name: role.name, description: role.description });
    setOpenDialog(true);
  };

  const openViewRole = (role: StrapiRole) => {
    setMode("view");
    setSelectedRole(role);
    reset({ name: role.name, description: role.description });
    setOpenDialog(true);
  };

  const onRoleSubmit = async (values: FormData) => {
    try {
      if (mode === "edit" && selectedRole) {
        await apiClient.put(`/admin/roles/${selectedRole.id}`, values);
        toast.success("Role updated successfully!");
      } else {
        await apiClient.post("/admin/roles", values);
        toast.success("Role created successfully!");
      }
      setOpenDialog(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to save role");
    }
  };

  const handleRoleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await apiClient.delete(`/admin/roles/${deleteTarget.id}`);
      toast.success("Role deleted successfully.");
      setDeleteTarget(null);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to delete role");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==========================================
  // HANDLERS: PERMISSIONS
  // ==========================================
  const toggleSection = (subject: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(subject) ? next.delete(subject) : next.add(subject);
      return next;
    });
  };

  const togglePermission = (subject: string, action: string) => {
    setPermissions((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [action]: { ...prev[subject][action], enabled: !prev[subject][action].enabled },
      },
    }));
  };

  const toggleAllInSubject = (subject: string, enable: boolean) => {
    setPermissions((prev) => {
      const updated = { ...prev[subject] };
      Object.keys(updated).forEach((action) => {
        updated[action] = { ...updated[action], enabled: enable };
      });
      return { ...prev, [subject]: updated };
    });
  };

  const savePermissions = async () => {
    if (!activeRoleForPerms) return;
    try {
      setSavingPerms(true);
      const enabledPermissions: any[] = [];

      Object.entries(permissions).forEach(([subject, actions]) => {
        Object.entries(actions).forEach(([action, data]) => {
          if (data.enabled) {
            enabledPermissions.push({
              action,
              subject: subject === "global" ? null : subject,
              properties: {},
              conditions: [],
            });
          }
        });
      });

      await apiClient.put(`/admin/roles/${activeRoleForPerms.id}/permissions`, {
        permissions: enabledPermissions,
      });

      toast.success("Permissions saved successfully!");
      setActiveRoleForPerms(null); // Return to roles list
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to save permissions");
    } finally {
      setSavingPerms(false);
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const formatAction = (action: string) => {
    // Examples:
    // - plugin::content-manager.explorer.read -> read
    // - admin::roles.read -> read
    const afterNamespace = action.split("::").pop() ?? action;
    const last = afterNamespace.split(".").pop() ?? afterNamespace;
    return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatSubject = (subject: string) => {
    if (subject === "global") return "Global";
    return subject
      .replace(/plugin::|api::|admin::/g, "")
      .replace(/\./g, " › ")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const enabledCount = (subject: string) => Object.values(permissions[subject] ?? {}).filter((p) => p.enabled).length;
  const totalCount = (subject: string) => Object.keys(permissions[subject] ?? {}).length;
  const totalUsers = roles.reduce((sum, r) => sum + (r.usersCount ?? r.nb_users ?? 0), 0);

  // ==========================================
  // RENDER: PERMISSIONS VIEW
  // ==========================================
  if (activeRoleForPerms) {
    if (permsError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-destructive font-semibold text-lg">{permsError}</p>
          <Button variant="outline" onClick={() => setActiveRoleForPerms(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Return to Roles
          </Button>
        </div>
      );
    }

    if (loadingPerms) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#006caf]" />
          <p className="text-muted-foreground">Fetching permission tree for {activeRoleForPerms.name}...</p>
        </div>
      );
    }

    const activeSubject = Array.from(openSections)[0] || Object.keys(permissions)[0];
    const activeActions = activeSubject ? permissions[activeSubject] : null;

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6 flex flex-col h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setActiveRoleForPerms(null)} className="mb-2 -ml-3 text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Roles
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6 text-[#006caf]" />
              Manage Permissions
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Configuring access for <span className="font-semibold text-[#006caf]">{activeRoleForPerms.name}</span>
            </p>
          </div>
          <Button onClick={savePermissions} disabled={savingPerms} className="bg-gradient-to-br from-[#006caf] to-[#005a94] text-white hover:opacity-90 shadow-md px-6">
            {savingPerms ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {Object.keys(permissions).length === 0 ? (
          <div className="flex-1 flex items-center justify-center border rounded-xl bg-muted/10 text-muted-foreground text-sm">
            No permissions found or unable to parse permission tree.
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden border rounded-xl bg-card shadow-sm">
            {/* Sidebar (Subjects) */}
            <div className="w-1/3 min-w-[250px] max-w-[350px] border-r bg-muted/10 flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-muted/20 font-semibold text-sm text-muted-foreground flex justify-between items-center shrink-0">
                <span>Categories</span>
                <Badge variant="secondary" className="text-xs">{Object.keys(permissions).length}</Badge>
              </div>
              <div className="flex-1 overflow-y-auto">
                {Object.entries(permissions).map(([subject, actions]) => {
                  const isActive = subject === activeSubject;
                  const activeCount = enabledCount(subject);
                  const total = totalCount(subject);
                  const isAllEnabled = activeCount === total;
                  const isSomeEnabled = activeCount > 0 && activeCount < total;
                  
                  return (
                    <button
                      key={subject}
                      onClick={() => setOpenSections(new Set([subject]))}
                      className={`w-full text-left p-4 border-b flex items-center justify-between transition-colors border-l-4 ${
                        isActive 
                          ? "bg-card border-l-[#006caf] shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]" 
                          : "hover:bg-muted/40 border-l-transparent"
                      }`}
                    >
                      <div className="flex flex-col gap-1 pr-2 overflow-hidden">
                        <span className={`text-sm font-semibold truncate ${isActive ? "text-[#006caf]" : ""}`}>
                          {formatSubject(subject)}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isAllEnabled ? "bg-green-500" : isSomeEnabled ? "bg-[#006caf]" : "bg-transparent"}`}
                              style={{ width: `${total > 0 ? (activeCount / total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {activeCount}/{total}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? "text-[#006caf] translate-x-0.5" : "text-muted-foreground opacity-50"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content (Actions) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-card">
              {activeSubject && activeActions && (
                <>
                  <div className="p-6 border-b flex items-center justify-between shrink-0 bg-card">
                    <div>
                      <h2 className="text-lg font-bold">{formatSubject(activeSubject)} Permissions</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select which actions the <span className="font-semibold">{activeRoleForPerms.name}</span> role can perform.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-xs text-green-600 border-green-200 hover:border-green-300 hover:text-green-700 hover:bg-green-50" onClick={() => toggleAllInSubject(activeSubject, true)}>
                        <Check className="h-3 w-3 mr-1" /> Enable All
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-red-500 border-red-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50" onClick={() => toggleAllInSubject(activeSubject, false)}>
                        <X className="h-3 w-3 mr-1" /> Disable All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {Object.entries(activeActions).map(([action, data]) => (
                        <div 
                          key={action} 
                          className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
                            data.enabled 
                              ? "bg-[#006caf]/5 border-[#006caf]/30 shadow-sm" 
                              : "bg-card border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${data.enabled ? "bg-[#006caf]/20 text-[#006caf]" : "bg-muted text-muted-foreground"}`}>
                              {data.enabled ? <Check className="h-3.5 w-3.5" /> : <X className="h-3 w-3" />}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label 
                                htmlFor={`perm-${activeSubject}-${action}`} 
                                className={`text-sm font-semibold cursor-pointer ${data.enabled ? "text-[#006caf]" : ""}`}
                              >
                                {formatAction(action)}
                              </Label>
                              <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded w-max max-w-full truncate">
                                {action}
                              </span>
                            </div>
                          </div>
                          <Switch 
                            id={`perm-${activeSubject}-${action}`}
                            checked={data.enabled} 
                            onCheckedChange={() => togglePermission(activeSubject, action)} 
                            className="data-[state=checked]:bg-[#006caf] shrink-0 ml-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: ROLES LIST (DEFAULT)
  // ==========================================
  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#006caf]" />
            Roles Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage roles and their access levels.
          </p>
        </div>
        <Button onClick={openAddRole} className="text-white bg-gradient-to-br from-[#006caf] to-[#005a94]">
          <Plus className="h-4 w-4 mr-1" /> Add Role
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="p-4 rounded-xl border bg-card space-y-1">
          <p className="text-xs text-muted-foreground">Total Roles</p>
          <p className="text-2xl font-bold text-[#006caf]">{roles.length}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card space-y-1">
          <p className="text-xs text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-semibold w-10">#</TableHead>
              <TableHead className="text-xs font-semibold">Role Name</TableHead>
              <TableHead className="text-xs font-semibold">Description</TableHead>
              <TableHead className="text-xs font-semibold">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> Users
                </span>
              </TableHead>
              <TableHead className="text-xs font-semibold text-right w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingRoles ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#006caf]" />
                    <span className="text-sm text-muted-foreground">Loading roles...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground text-sm">
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role, index) => (
                <TableRow key={role.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-[#006caf10] flex items-center justify-center shrink-0">
                        <Lock className="h-3.5 w-3.5 text-[#006caf]" />
                      </div>
                      <p className="text-sm font-semibold">{role.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    <span className="line-clamp-2">{role.description || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Users className="h-3 w-3" />
                      {role.usersCount ?? role.nb_users ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger >
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openViewRole(role)}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> View Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditRole(role)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        {/* Switch to permissions view instead of routing */}
                        <DropdownMenuItem onClick={() => setActiveRoleForPerms(role)}>
                          <Settings className="h-3.5 w-3.5 mr-2" /> Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(role)} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Role Add/Edit/View Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#006caf]" />
              {mode === "add" ? "Create Role" : mode === "edit" ? "Edit Role" : "View Role"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onRoleSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Role Name *</Label>
              <Input id="name" {...register("name")} disabled={mode === "view"} placeholder="e.g. Content Manager" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" {...register("description")} disabled={mode === "view"} placeholder="Describe what this role can do..." rows={3} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                {mode === "view" ? "Close" : "Cancel"}
              </Button>
              {mode !== "view" && (
                <Button type="submit" disabled={isSubmitting} className="text-white bg-[#006caf] hover:bg-[#005a94]">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {mode === "edit" ? "Update" : "Create"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span>? This cannot be undone.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleRoleDelete} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}