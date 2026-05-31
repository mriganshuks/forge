import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/forge/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, FileText, Zap, Crown, Clock, ArrowUpRight, TrendingUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Forge" }] }),
  component: DashboardPage,
});

type ReportRow = {
  id: string;
  title: string;
  status: "draft" | "generating" | "completed" | "failed";
  created_at: string;
};

type SubscriptionRow = {
  plan: string;
  reports_limit: number;
  reports_used: number;
  current_period_end: string;
};

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ["reports", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ReportRow[]> => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReportRow[];
    },
  });

  const subQuery = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SubscriptionRow | null> => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan, reports_limit, reports_used, current_period_end")
        .maybeSingle();
      if (error) throw error;
      return data as SubscriptionRow | null;
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report deleted");
      queryClient.invalidateQueries({ queryKey: ["reports", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reports = reportsQuery.data ?? [];
  const sub = subQuery.data;
  const remaining = sub ? Math.max(0, sub.reports_limit - sub.reports_used) : 0;
  const planLabel = sub?.plan ? sub.plan[0]!.toUpperCase() + sub.plan.slice(1) : "Free";
  const lastGen = reports[0];
  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  const resetLabel = sub?.current_period_end
    ? `Resets ${new Date(sub.current_period_end).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
    : "—";

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Welcome back, {firstName}</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Let's forge something new.</h1>
          </div>
          <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            <Link to="/reports/new"><Plus className="size-4 mr-1" /> Create new report</Link>
          </Button>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Reports created" value={String(reports.length)} hint="All time" />
          <StatCard
            icon={Zap}
            label="Reports remaining"
            value={sub ? String(remaining) : "—"}
            hint={resetLabel}
            valueClass="text-primary"
          />
          <StatCard
            icon={Crown}
            label="Current plan"
            value={planLabel}
            hint={sub ? `${sub.reports_limit} reports / month` : "—"}
            actionLabel="Manage"
            to="/billing"
          />
          <StatCard
            icon={Clock}
            label="Last generated"
            value={lastGen ? formatDistanceToNow(new Date(lastGen.created_at), { addSuffix: true }) : "—"}
            hint={lastGen?.title ?? "No reports yet"}
          />
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent reports</h2>
          <Button variant="ghost" size="sm">View all <ArrowUpRight className="size-3.5 ml-1" /></Button>
        </div>
        <Card className="mt-4 bg-gradient-card border-border/60 overflow-hidden">
          {reportsQuery.isLoading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading reports…</div>
          ) : reports.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-sm text-muted-foreground">No reports yet.</div>
              <Button
                onClick={() => navigate({ to: "/reports/new" })}
                className="mt-4 bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                <Plus className="size-4 mr-1" /> Create your first report
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Report</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id} className="border-border/60">
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === "completed" ? "secondary" : "outline"} className="font-normal capitalize">
                        {r.status === "completed" && <span className="size-1.5 rounded-full bg-success mr-1.5" />}
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/reports/$reportId" params={{ reportId: r.id }}>Open</Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{r.title}" will be permanently removed. This can't be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReport.mutate(r.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
