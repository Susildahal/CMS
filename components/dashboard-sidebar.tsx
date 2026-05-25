// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { useSidebar } from "@/components/ui/sidebar";
// import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
// import {
//   LayoutDashboard,
//   Building2,
//   Users,
//   Activity,
//   Briefcase,
//   FolderOpen,
//   UserPlus,
//   Phone,
//   Share2,
//   HelpCircle,
//   FileText,
//   ShieldCheck,
//   Star,
//   Award,
//   BookOpen,
//   Target,
//   Eye,
//   ChevronRight,
// } from "lucide-react";
// import type { ComponentType } from "react";
// import { ScrollArea } from "@/components/ui/scroll-area";

// interface NavItem {
//   href: string;
//   label: string;
//   icon: ComponentType<any>;
//   exact?: boolean;
//   target?: string;
// }

// interface NavGroup {
//   label: string;
//   items: NavItem[];
// }

// const navGroups: NavGroup[] = [
//   {
//     label: "Overview",
//     items: [
//       { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
//     ],
//   },
//   {
//     label: "About",
//     items: [
//       { href: "/dashboard/about/team", label: "Our Team", icon: Users },
//       { href: "/dashboard/about/activities", label: "Activities", icon: Activity },
//       { href: "/dashboard/about/mission", label: "Mission & Vision", icon: Target },
//     ],
//   },
//   {
//     label: "Website Pages",
//     items: [
//       { href: "/dashboard/services", label: "Services", icon: Briefcase },
//       { href: "/dashboard/services/service-types", label: "Service Types", icon: Briefcase },
//       { href: "/dashboard/our-work", label: "Our Work", icon: FolderOpen },
//       { href: "/dashboard/career", label: "Career", icon: UserPlus },
//       { href: "/dashboard/contact", label: "Contact", icon: Phone },
//     ],
//   },
//   {
//     label: "Content",
//     items: [
//       { href: "/dashboard/testimonials", label: "Testimonials", icon: Star },
//       { href: "/dashboard/endorsements", label: "Endorsements", icon: Award },
//       { href: "/dashboard/blog", label: "Blog", icon: BookOpen },
//       { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
//        { href: "/dashboard/technology", label: "Technology", icon: HelpCircle },
//     ],
//   },
//   {
//     label: "Settings",
//     items: [
//       { href: "/dashboard/social", label: "Social Media", icon: Share2 },
//       { href: "/dashboard/terms", label: "Terms & Conditions", icon: FileText },
//       { href: "/dashboard/privacy", label: "Privacy Policy", icon: ShieldCheck },
//     ],
//   },
//   {
//     label: "Admin",
//     items: [
//       { href: "/dashboard/users", label: "User Management", icon: Users },
//       { href: "/dashboard/users/roles", label: "Role Management", icon: ShieldCheck },
//     ],
//   },
//     {
//     label: "Photo",
//     items: [
//       { href: "/dashboard/photos", label: "Photo Management", icon: Users ,target: "_blank" },
//     ],
//   },
// ];

// export default function DashboardSidebar() {
//   const pathname = usePathname();
//   const { isMobile, setOpenMobile } = useSidebar();

//   const isActive = (href: string, exact?: boolean) => {
//     if (exact) return pathname === href;
//     return pathname.startsWith(href);
//   };

//   return (
//     <Sidebar collapsible="icon" className="border-r border-sidebar-border">
//       <SidebarHeader className="p-0">
//         {/* Logo */}
//         <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border shrink-0">
//           <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient shrink-0">
//             <Building2 className="h-5 w-5 text-white" />
//           </div>
//           <div className="flex flex-col group-data-[collapsible=icon]:hidden">
//             <span className="text-sm font-bold text-white leading-tight">IT Company</span>
//             <span className="text-[10px] text-sidebar-foreground/60 leading-tight">CMS Admin</span>
//           </div>
//         </div>
//       </SidebarHeader>

//       <SidebarContent className="p-0">
//         {/* Nav */}
//         <ScrollArea className="flex-1 py-3">
//           <nav className="flex flex-col gap-0.5 px-3">
//             {navGroups.map((group) => (
//               <div key={group.label} className="mb-3">
//                 <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 mb-1 group-data-[collapsible=icon]:sr-only">
//                   {group.label}
//                 </p>
//                 {group.items.map((item) => {
//                   const active = isActive(item.href, item.exact);
//                   return (
//                     <Link
//                       key={item.href}
//                       href={item.href}
//                       target={item.target}
//                       rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
//                       id={`nav-${item.href.replace(/\//g, "-").slice(1)}`}
//                       aria-label={item.label}
//                       title={item.label}
//                       onClick={() => {
//                         // Close the Sheet on mobile after navigation.
//                         if (isMobile) setOpenMobile(false);
//                       }}
//                       className={cn(
//                         "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
//                         "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
//                         active
//                           ? "text-white shadow-sm"
//                           : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
//                       )}
//                       style={
//                         active
//                           ? { background: "linear-gradient(90deg, #006caf, #005a94)" }
//                           : {}
//                       }
//                     >
//                       <item.icon className="h-4 w-4 shrink-0" />
//                       <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
//                       {active && (
//                         <ChevronRight className="ml-auto h-3 w-3 opacity-60 group-data-[collapsible=icon]:hidden" />
//                       )}
//                     </Link>
//                   );
//                 })}
//               </div>
//             ))}
//           </nav>
//         </ScrollArea>
//       </SidebarContent>
//     </Sidebar>
//   );
// }


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
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
  ChevronRight,
  Settings,
  LogOut,
  ChevronDown,
  Image,
  Globe,
} from "lucide-react";
import type { ComponentType } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<any>;
  exact?: boolean;
  target?: string;
  badge?: string | number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Navigation Data ─────────────────────────────────────

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/dashboard/about/team", label: "Our Team", icon: Users },
      { href: "/dashboard/about/activities", label: "Activities", icon: Activity },
      { href: "/dashboard/about/mission", label: "Mission & Vision", icon: Target },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/dashboard/services", label: "Services", icon: Briefcase },
      { href: "/dashboard/services/service-types", label: "Service Types", icon: Globe },
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
      { href: "/dashboard/technology", label: "Technology", icon: Settings },
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
    label: "Administration",
    items: [
      { href: "/dashboard/users", label: "Users", icon: Users },
      { href: "/dashboard/users/roles", label: "Roles", icon: ShieldCheck },
    ],
  },
  {
    label: "Media",
    items: [
      { href: "/dashboard/photos", label: "Photo Gallery", icon: Image, target: "_blank" },
    ],
  },
];

// ─── Components ──────────────────────────────────────────

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const Icon = item.icon;

  const linkContent = (
    <>
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
          active
            ? "bg-white/20 text-white shadow-sm"
            : "text-sidebar-foreground/50 group-hover/nav:text-sidebar-foreground group-hover/nav:bg-sidebar-accent"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {!collapsed && (
        <>
          <span className="flex-1 truncate text-[13px] font-medium">
            {item.label}
          </span>
          {item.badge && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
              {item.badge}
            </span>
          )}
          {active && (
            <ChevronRight className="h-3.5 w-3.5 text-white/70" />
          )}
        </>
      )}

      {/* Active indicator bar */}
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-white"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </>
  );

  if (collapsed) {
    return (
      <Tooltip >
        <TooltipTrigger >
          <Link
            href={item.href}
            target={item.target}
            rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
            onClick={() => isMobile && setOpenMobile(false)}
            className={cn(
              "group/nav relative flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-200",
              active
                ? "bg-gradient-to-r from-[#006caf] to-[#005a94] text-white shadow-lg shadow-[#006caf]/20"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            {linkContent}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-semibold text-primary">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.href}
      target={item.target}
      rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
      onClick={() => isMobile && setOpenMobile(false)}
      className={cn(
        "group/nav relative flex items-center gap-3 rounded-xl px-3 py-0.5 transition-all duration-200",
        active
          ? "bg-gradient-to-r from-[#006caf] to-[#005a94] text-white shadow-lg shadow-[#006caf]/20"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      {linkContent}
    </Link>
  );
}

function NavGroupSection({
  group,
  pathname,
  collapsed,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const hasActiveItem = group.items.some((item) => isActive(item.href, item.exact));

  return (
    <div className="mb-1">
      {!collapsed && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 transition-colors hover:text-sidebar-foreground/70"
        >
          <span className="flex-1 text-left">{group.label}</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </button>
      )}

      <AnimatePresence initial={false}>
        {(expanded || collapsed) && (
          <motion.div
            initial={collapsed ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={collapsed ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-0.5"
          >
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href, item.exact)}
                collapsed={collapsed}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {collapsed && hasActiveItem && (
        <div className="mx-auto mt-2 h-px w-8 bg-sidebar-border" />
      )}
    </div>
  );
}

// ─── Main Sidebar Component ──────────────────────────────

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <TooltipProvider >
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border/60 bg-sidebar"
      >
        {/* ── Header ───────────────────────────── */}
        <SidebarHeader className="p-0">
          <div
            className={cn(
              "flex h-[60px] items-center gap-3 border-b border-sidebar-border/60 px-4",
              collapsed && "justify-center px-2"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#006caf] to-[#005a94] shadow-lg shadow-[#006caf]/25 ring-2 ring-white/10">
              <Building2 className="h-[18px] w-[18px] text-white" />
            </div>

            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold leading-tight text-white">
                  IT Company
                </span>
                <span className="text-[11px] leading-tight text-sidebar-foreground/50">
                  CMS Admin
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        {/* ── Navigation ───────────────────────── */}
        <SidebarContent className="p-0">
          <ScrollArea className="flex-1 px-2 py-3">
            <nav className="flex flex-col">
              {navGroups.map((group) => (
                <NavGroupSection
                  key={group.label}
                  group={group}
                  pathname={pathname}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </ScrollArea>
        </SidebarContent>

    
      </Sidebar>
    </TooltipProvider>
  );
}