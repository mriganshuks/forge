import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FilePlus2, FileText, Settings, CreditCard, LogOut } from "lucide-react";
import { type ReactNode } from "react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports/new", label: "New Report", icon: FilePlus2 },
  { to: "/reports/r-001", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/billing", label: "Billing", icon: CreditCard },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const nameSource = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "U";
  const initials = nameSource
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Account";
  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar p-4">
        <div className="px-2 py-2"><Logo /></div>
        <nav className="mt-6 space-y-1">
          {items.map((i) => {
            const active = path === i.to || (i.to !== "/dashboard" && path.startsWith(i.to.split("/").slice(0, 2).join("/")));
            return (
              <Link
                key={i.to}
                to={i.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <i.icon className="size-4" />
                {i.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate({ to: "/login", replace: true });
            }}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="size-4" /> Sign out
          </button>
          <div className="mt-3 flex items-center gap-3 px-2">
            <div className="size-8 rounded-full bg-gradient-primary grid place-items-center text-xs font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="text-sm min-w-0">
              <div className="font-medium leading-tight truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground">Pro plan</div>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
