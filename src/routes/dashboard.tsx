import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/forge/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, FileText, Zap, Crown, Clock, ArrowUpRight, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Forge" }] }),
  component: DashboardPage,
});

const reports = [
  { id: "r-001", name: "AI Fitness Coach for busy professionals", date: "May 28, 2026", status: "Completed", score: 82 },
  { id: "r-002", name: "B2B Carbon accounting for SMBs", date: "May 24, 2026", status: "Completed", score: 71 },
  { id: "r-003", name: "Marketplace for indie game composers", date: "May 19, 2026", status: "Completed", score: 64 },
  { id: "r-004", name: "AI legal assistant for solo lawyers", date: "May 12, 2026", status: "Completed", score: 88 },
  { id: "r-005", name: "Async standups for remote teams", date: "May 06, 2026", status: "Draft", score: null },
];

function DashboardPage() {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Welcome back, Alex</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Let's forge something new.</h1>
          </div>
          <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            <Link to="/reports/new"><Plus className="size-4 mr-1" /> Create new report</Link>
          </Button>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Reports created" value="12" hint="All time" />
          <StatCard icon={Zap} label="Reports remaining" value="38" hint="Resets June 1" valueClass="text-primary" />
          <StatCard icon={Crown} label="Current plan" value="Pro" hint="$49 / month" actionLabel="Manage" to="/billing" />
          <StatCard icon={Clock} label="Last generated" value="2h ago" hint="AI Fitness Coach" />
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent reports</h2>
          <Button variant="ghost" size="sm">View all <ArrowUpRight className="size-3.5 ml-1" /></Button>
        </div>
        <Card className="mt-4 bg-gradient-card border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Report</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id} className="border-border/60">
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "Completed" ? "secondary" : "outline"} className="font-normal">
                      {r.status === "Completed" && <span className="size-1.5 rounded-full bg-success mr-1.5" />}
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.score !== null ? (
                      <span className={r.score >= 80 ? "text-success" : r.score >= 65 ? "text-warning" : "text-muted-foreground"}>
                        {r.score}/100
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/reports/$reportId" params={{ reportId: r.id }}>Open</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon, label, value, hint, valueClass, actionLabel, to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; hint: string;
  valueClass?: string; actionLabel?: string; to?: string;
}) {
  return (
    <Card className="p-5 bg-gradient-card border-border/60">
      <div className="flex items-start justify-between">
        <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
          <Icon className="size-4 text-primary" />
        </div>
        {actionLabel && to && (
          <Button variant="ghost" size="sm" asChild className="h-auto px-2 py-1 text-xs">
            <Link to={to}>{actionLabel}</Link>
          </Button>
        )}
      </div>
      <div className="mt-4 text-sm text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tracking-tight ${valueClass ?? ""}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
        <TrendingUp className="size-3" /> {hint}
      </div>
    </Card>
  );
}
