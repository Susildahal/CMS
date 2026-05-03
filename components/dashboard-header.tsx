"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
} from "lucide-react";

interface DashboardHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export default function DashboardHeader({
  sidebarOpen,
  onToggleSidebar,
  title = "Dashboard",
  subtitle,
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "AD";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        id="sidebar-toggle-btn"
      >
        {sidebarOpen ? (
          <PanelLeftClose className="h-5 w-5" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" />
        )}
      </Button>

      {/* Logo / Brand */}
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <span className="hidden text-sm font-bold md:inline" style={{ color: "#006caf" }}>
          CMS Admin
        </span>
      </Link>

      {/* Page title */}
      <div className="flex flex-col ml-2 hidden md:flex">
        <span className="text-sm font-semibold leading-none">{title}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground mt-0.5">{subtitle}</span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          id="notifications-btn"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#f9bb19]" />
        </Button>

        {/* Role badge */}
        <Badge
          variant="outline"
          className="hidden sm:flex capitalize border-[#006caf] text-[#006caf]"
        >
          {user?.role}
        </Badge>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-accent cursor-pointer transition-colors" id="user-menu-trigger">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #006caf, #004d8c)" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline">
                {user?.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-0.5">
                <span className="font-semibold">{user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem >
              <Link href="/dashboard/profile" className="cursor-pointer" id="profile-link">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem >
              <Link href="/dashboard/settings" className="cursor-pointer" id="settings-link">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={logout}
              id="logout-btn"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
