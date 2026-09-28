import { Link, useRouterState } from "@tanstack/react-router";
import { FlaskConical, FolderKanban, LayoutDashboard, Settings, Sparkle } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/studio", label: "Studio", icon: FlaskConical },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  title,
  subtitle,
  actions,
  demoMode = true,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  demoMode?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col justify-between bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex">
        <div>
          <Link to="/" className="flex items-center gap-2.5 px-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Sparkle className="size-4.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight">180 LIFT</span>
              <span className="block text-[11px] text-sidebar-foreground/60">AI Content Studio</span>
            </span>
          </Link>

          <nav className="mt-7 space-y-1">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-xl bg-sidebar-accent/70 p-3 text-[11px] leading-relaxed text-sidebar-foreground/70">
          <p className="font-medium text-sidebar-foreground">Nothing publishes from here.</p>
          <p className="mt-1">
            Scheduling and posting stay disabled until a real LinkedIn integration is configured.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/85 px-5 py-3.5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
                {demoMode ? <DemoModeBadge /> : null}
              </div>
              {subtitle ? <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
          <nav className="mt-3 flex gap-1 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function DemoModeBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-signal/50 bg-signal/15 text-[11px] font-semibold text-signal-foreground", className)}
    >
      DEMO MODE
    </Badge>
  );
}
