"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Briefcase, FolderOpen, BookOpen, HelpCircle,
  Star, UserPlus, Activity, TrendingUp, Eye, MessageSquare, Award
} from "lucide-react";

const stats = [
  { label: "Team Members", value: "12", icon: Users, trend: "+2 this month", color: "#006caf" },
  { label: "Services", value: "8", icon: Briefcase, trend: "Active", color: "#005a94" },
  { label: "Projects", value: "34", icon: FolderOpen, trend: "+5 this quarter", color: "#f9bb19" },
  { label: "Blog Posts", value: "47", icon: BookOpen, trend: "3 drafts", color: "#e0a810" },
  { label: "Open Positions", value: "5", icon: UserPlus, trend: "2 new", color: "#006caf" },
  { label: "Testimonials", value: "28", icon: Star, trend: "All approved", color: "#f9bb19" },
  { label: "FAQs", value: "23", icon: HelpCircle, trend: "Updated today", color: "#005a94" },
  { label: "Endorsements", value: "9", icon: Award, trend: "Active", color: "#e0a810" },
];

const recentActivity = [
  { action: "Blog post published", item: "Top 10 IT Trends 2025", time: "2 min ago", type: "publish" },
  { action: "Team member added", item: "Sarah Johnson – Designer", time: "1 hour ago", type: "add" },
  { action: "Service updated", item: "Cloud Solutions", time: "3 hours ago", type: "edit" },
  { action: "FAQ added", item: "What is DevOps?", time: "5 hours ago", type: "add" },
  { action: "Project published", item: "E-Commerce Platform Redesign", time: "1 day ago", type: "publish" },
  { action: "Job posted", item: "Senior React Developer", time: "2 days ago", type: "add" },
];

const typeColors: Record<string, string> = {
  publish: "#006caf",
  add: "#22c55e",
  edit: "#f9bb19",
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here's what's happening with your website content today.
          </p>
        </div>
        <Badge
          className="self-start sm:self-auto text-white px-4 py-1.5 text-sm capitalize"
          style={{ background: "linear-gradient(135deg, #006caf, #005a94)" }}
        >
          {user?.role} Access
        </Badge>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border hover:shadow-md transition-all duration-200 group cursor-default"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{stat.trend}</p>
                </div>
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: `${stat.color}18` }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: "#006caf" }} />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: typeColors[item.type] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.action}</p>
                    <p className="text-xs text-muted-foreground truncate">"{item.item}"</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Status */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: "#f9bb19" }} />
              Content Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Pages Complete", value: 90 },
              { label: "SEO Coverage", value: 75 },
              { label: "Media Optimized", value: 60 },
              { label: "Forms Active", value: 100 },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.value}%`,
                      background: item.value >= 80
                        ? "linear-gradient(90deg, #006caf, #005a94)"
                        : item.value >= 60
                        ? "linear-gradient(90deg, #f9bb19, #e0a810)"
                        : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3 text-center" style={{ background: "#006caf18" }}>
                  <Eye className="h-4 w-4 mx-auto mb-1" style={{ color: "#006caf" }} />
                  <p className="text-xs font-semibold" style={{ color: "#006caf" }}>Live</p>
                  <p className="text-[10px] text-muted-foreground">Website Active</p>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: "#f9bb1918" }}>
                  <MessageSquare className="h-4 w-4 mx-auto mb-1" style={{ color: "#e0a810" }} />
                  <p className="text-xs font-semibold" style={{ color: "#e0a810" }}>4</p>
                  <p className="text-[10px] text-muted-foreground">Unread msgs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
