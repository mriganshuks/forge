import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppShell } from "@/components/forge/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Download, Share2, Trash2, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateBlueprint } from "@/lib/blueprint.functions";
import {
  SummarySection, MarketSection, CompetitorsSection, MvpSection, GtmSection, RisksSection,
} from "@/components/forge/BlueprintSections";

export const Route = createFileRoute("/_authenticated/reports/$reportId")({
  head: () => ({ meta: [{ title: "Report — Forge" }] }),
  component: ReportPage,
});

type Report = {
  id: string;
  title: string;
  idea: string;
  target_market: string | null;
  status: "draft" | "generating" | "completed" | "failed";
  created_at: string;
};

type Section = {
  id: string;
  section_type: "market" | "competitors" | "risks" | "gtm" | "summary" | "mvp";
  title: string | null;
  content: Record<string, unknown>;
};

function ReportPage() {
  const { reportId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const generate = useServerFn(generateBlueprint);

  const reportQuery = useQuery({
    queryKey: ["report", reportId],
    queryFn: async (): Promise<Report | null> => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, title, idea, target_market, status, created_at")
        .eq("id", reportId)
        .maybeSingle();
      if (error) throw error;
      return data as Report | null;
    },
    refetchInterval: (q) => (q.state.data?.status === "generating" ? 2500 : false),
  });

  const isGenerating = reportQuery.data?.status === "generating";

  const sectionsQuery = useQuery({
    queryKey: ["report-sections", reportId],
    queryFn: async (): Promise<Section[]> => {
      const { data, error } = await supabase
        .from("report_sections")
        .select("id, section_type, title, content")
        .eq("report_id", reportId)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Section[];
    },
    // Poll while generating so freshly-inserted sections show up immediately.
    refetchInterval: isGenerating ? 2500 : false,
  });

  // When status flips out of "generating", force a one-shot sections refetch so
  // a cached empty list during generation doesn't strand the user on a loader.
  useEffect(() => {
    if (reportQuery.data?.status === "completed" || reportQuery.data?.status === "failed") {
      queryClient.invalidateQueries({ queryKey: ["report-sections", reportId] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    }
  }, [reportQuery.data?.status, queryClient, reportId]);

  // Safety net: if the report has been "generating" for more than 3 minutes,
  // mark it failed locally so the UI doesn't loop forever on an abandoned job.
  useEffect(() => {
    if (!isGenerating || !reportQuery.data) return;
    const startedAt = new Date(reportQuery.data.created_at).getTime();
    const elapsed = Date.now() - startedAt;
    const remaining = 3 * 60_000 - elapsed;
    if (remaining <= 0) {
      supabase.from("reports").update({ status: "failed" }).eq("id", reportId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      });
      return;
    }
    const t = setTimeout(() => {
      supabase.from("reports").update({ status: "failed" }).eq("id", reportId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      });
    }, remaining);
    return () => clearTimeout(t);
  }, [isGenerating, reportQuery.data, reportId, queryClient]);


  const regenerate = useMutation({
    mutationFn: async () => {
      await supabase.from("reports").update({ status: "generating" }).eq("id", reportId);
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      await generate({ data: { reportId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["report-sections", reportId] });
      toast.success("Blueprint regenerated");
    },
    onError: (e: Error) => toast.error(e.message ?? "Generation failed"),
  });

  const deleteReport = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reports").delete().eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report deleted");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      navigate({ to: "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (reportQuery.isLoading) {
    return (
      <AppShell>
        <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto text-muted-foreground">Loading report…</div>
      </AppShell>
    );
  }

  const report = reportQuery.data;
  if (!report) {
    return (
      <AppShell>
        <div className="px-6 md:px-10 py-16 max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-semibold">Report not found</h1>
          <p className="mt-2 text-muted-foreground">It may have been deleted, or you don't have access.</p>
          <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
        </div>
      </AppShell>
    );
  }

  const sections = sectionsQuery.data ?? [];
  const sectionOf = (t: Section["section_type"]) => sections.find((s) => s.section_type === t);

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-6xl mx-auto">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link to="/dashboard"><ArrowLeft className="size-4 mr-1" /> Back to dashboard</Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Badge variant={report.status === "completed" ? "secondary" : "outline"} className="font-normal capitalize">
              {report.status === "completed" && <span className="size-1.5 rounded-full bg-success mr-1.5" />}
              {report.status}
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight max-w-2xl">{report.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Created {new Date(report.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              {report.target_market ? ` · ${report.target_market}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => regenerate.mutate()} disabled={isGenerating || regenerate.isPending}>
              <RefreshCw className={`size-4 mr-1.5 ${isGenerating ? "animate-spin" : ""}`} /> Regenerate
            </Button>
            <Button variant="outline" size="sm"><Share2 className="size-4 mr-1.5" /> Share</Button>
            <Button size="sm" variant="outline"><Download className="size-4 mr-1.5" /> Export PDF</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4 mr-1.5" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{report.title}" will be permanently removed. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteReport.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card className="mt-8 p-6 bg-gradient-card border-border/60">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Idea</div>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{report.idea}</p>
        </Card>

        {isGenerating ? (
          <Card className="mt-10 p-10 bg-gradient-card border-border/60 text-center">
            <div className="mx-auto size-12 rounded-full bg-primary/10 border border-primary/20 grid place-items-center">
              <Loader2 className="size-5 text-primary animate-spin" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">Forging your blueprint…</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Our AI is analyzing the market, mapping competitors, scoping the MVP, and drafting your go-to-market plan. This usually takes 30–60 seconds.
            </p>
          </Card>
        ) : report.status === "failed" ? (
          <Card className="mt-10 p-10 bg-gradient-card border-border/60 text-center">
            <h3 className="text-lg font-semibold">Generation failed</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Something went wrong while generating your blueprint. Give it another shot.
            </p>
            <Button onClick={() => regenerate.mutate()} className="mt-5 bg-gradient-primary text-primary-foreground hover:opacity-90">
              <RefreshCw className="size-4 mr-1.5" /> Try again
            </Button>
          </Card>
        ) : sections.length === 0 ? (
          <Card className="mt-10 p-10 bg-gradient-card border-border/60 text-center">
            <div className="mx-auto size-10 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <h3 className="mt-4 font-medium">No analysis yet</h3>
            <Button onClick={() => regenerate.mutate()} className="mt-4 bg-gradient-primary text-primary-foreground hover:opacity-90">
              Generate blueprint
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="mt-10">
            <TabsList className="bg-card border border-border/60 flex-wrap h-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="mvp">MVP</TabsTrigger>
              <TabsTrigger value="gtm">GTM Plan</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {sectionOf("summary") ? <SummarySection content={sectionOf("summary")!.content} /> : null}
            </TabsContent>
            <TabsContent value="market" className="mt-6">
              {sectionOf("market") ? <MarketSection content={sectionOf("market")!.content} /> : null}
            </TabsContent>
            <TabsContent value="competitors" className="mt-6">
              {sectionOf("competitors") ? <CompetitorsSection content={sectionOf("competitors")!.content} /> : null}
            </TabsContent>
            <TabsContent value="mvp" className="mt-6">
              {sectionOf("mvp") ? <MvpSection content={sectionOf("mvp")!.content} /> : null}
            </TabsContent>
            <TabsContent value="gtm" className="mt-6">
              {sectionOf("gtm") ? <GtmSection content={sectionOf("gtm")!.content} /> : null}
            </TabsContent>
            <TabsContent value="risks" className="mt-6">
              {sectionOf("risks") ? <RisksSection content={sectionOf("risks")!.content} /> : null}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppShell>
  );
}
