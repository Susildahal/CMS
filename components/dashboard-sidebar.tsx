"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  Briefcase,
  FolderOpen,
  UserPlus,
  Phone,
  Share2,
  HelpCircle,
  FileText,
  ShieldCheck,
  Star,
  Award,
  BookOpen,
  Target,
  Eye,
  ChevronRight,
} from "lucide-react";
import type { ComponentType } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  open: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<any>;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "About",
    items: [
      { href: "/dashboard/about/team", label: "Our Team", icon: Users },
      { href: "/dashboard/about/activities", label: "Activities", icon: Activity },
      { href: "/dashboard/about/mission", label: "Mission & Vision", icon: Target },
    ],
  },
  {
    label: "Website Pages",
    items: [
      { href: "/dashboard/services", label: "Services", icon: Briefcase },
      { href: "/dashboard/our-work", label: "Our Work", icon: FolderOpen },
      { href: "/dashboard/career", label: "Career", icon: UserPlus },
      { href: "/dashboard/contact", label: "Contact", icon: Phone },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/dashboard/testimonials", label: "Testimonials", icon: Star },
      { href: "/dashboard/endorsements", label: "Endorsements", icon: Award },
      { href: "/dashboard/blog", label: "Blog", icon: BookOpen },
      { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/dashboard/social", label: "Social Media", icon: Share2 },
      { href: "/dashboard/terms", label: "Terms & Conditions", icon: FileText },
      { href: "/dashboard/privacy", label: "Privacy Policy", icon: ShieldCheck },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/dashboard/users", label: "User Management", icon: Users },
    ],
  },
];

export default function DashboardSidebar({ open }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 ease-in-out",
        "border-r border-sidebar-border",
        open ? "w-64" : "w-0 overflow-hidden",
      )}
      style={{ background: "var(--sidebar)" }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient shrink-0">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white leading-tight">IT Company</span>
          <span className="text-[10px] text-sidebar-foreground/60 leading-tight">CMS Admin</span>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3 h-[calc(100%-64px)] overflow-y-auto">
        <nav className="flex flex-col gap-0.5 px-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-3 ">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase   tracking-widest text-sidebar-foreground/40 mb-1">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    id={`nav-${item.href.replace(/\//g, "-").slice(1)}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      active
                        ? "text-white shadow-sm"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                    style={
                      active
                        ? { background: "linear-gradient(90deg, #006caf, #005a94)" }
                        : {}
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {active && <ChevronRight className="ml-auto h-3 w-3 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom version */}
      <div className="px-5 py-3 border-t border-sidebar-border shrink-0">
        <p className="text-[10px] text-sidebar-foreground/40">CMS v1.0.0 · Admin Portal</p>
      </div>
    </aside>
  );
}
