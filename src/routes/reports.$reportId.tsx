import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/forge/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Download, Share2, CheckCircle2, AlertTriangle, Target, Users, LineChart, Layers,
} from "lucide-react";

export const Route = createFileRoute("/reports/$reportId")({
  head: () => ({ meta: [{ title: "Report — Forge" }] }),
  component: ReportPage,
});

function ReportPage() {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-6xl mx-auto">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link to="/dashboard"><ArrowLeft className="size-4 mr-1" /> Back to dashboard</Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="font-normal">
              <span className="size-1.5 rounded-full bg-success mr-1.5" /> Completed
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight max-w-2xl">
              AI Fitness Coach for busy professionals
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Generated May 28, 2026 · Deep analysis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Share2 className="size-4 mr-1.5" /> Share</Button>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Download className="size-4 mr-1.5" /> Export PDF
            </Button>
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric icon={Target} label="Overall score" value="82" suffix="/100" tone="success" />
          <Metric icon={LineChart} label="TAM" value="$48B" tone="primary" />
          <Metric icon={Users} label="Competition" value="Medium" tone="warning" />
          <Metric icon={Layers} label="Time to MVP" value="6 wks" tone="default" />
        </div>

        <Tabs defaultValue="overview" className="mt-10">
          <TabsList className="bg-card border border-border/60">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="gtm">GTM Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-4">
            <Section title="Executive summary">
              A premium AI fitness coach targeting time-poor knowledge workers shows strong demand signals
              and a defensible wedge through corporate wellness partnerships. Incumbents focus on consumer
              B2C — leaving the B2B2C corridor open. Recommend a 90-day pilot with 3 mid-market HR teams.
            </Section>
            <div className="grid md:grid-cols-2 gap-4">
              <Section title="What's working" icon={CheckCircle2} tone="success">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 14k+ Reddit threads in last 90 days signal pent-up demand</li>
                  <li>• Average willingness-to-pay benchmark: $24–38 / month</li>
                  <li>• Clear wedge in B2B corporate wellness</li>
                </ul>
              </Section>
              <Section title="What's risky" icon={AlertTriangle} tone="warning">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• High CAC in consumer fitness category ($38 LTV/CAC ceiling)</li>
                  <li>• Retention drop-off historically severe past day 30</li>
                  <li>• Regulatory edge: health claims need careful copy review</li>
                </ul>
              </Section>
            </div>
          </TabsContent>

          <TabsContent value="market" className="mt-6">
            <Section title="Market sizing">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { l: "TAM", v: "$48B", d: "Global digital fitness, 2026" },
                  { l: "SAM", v: "$9.2B", d: "US + EU knowledge workers" },
                  { l: "SOM (Y1)", v: "$24M", d: "Realistic capture, B2B2C" },
                ].map((m) => (
                  <div key={m.l} className="rounded-lg border border-border/60 p-4 bg-background/40">
                    <div className="text-xs text-muted-foreground">{m.l}</div>
                    <div className="text-2xl font-semibold mt-1">{m.v}</div>
                    <div className="text-xs text-muted-foreground mt-1">{m.d}</div>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="competitors" className="mt-6">
            <Section title="Competitor landscape">
              <div className="space-y-2">
                {[
                  { n: "Future", f: "$75M raised", pos: "Premium 1:1 coaching", t: "B2C" },
                  { n: "Freeletics", f: "$45M raised", pos: "AI workouts", t: "B2C" },
                  { n: "Fitbod", f: "Bootstrapped", pos: "Strength training", t: "B2C" },
                ].map((c) => (
                  <div key={c.n} className="flex items-center justify-between rounded-lg border border-border/60 p-4 bg-background/40">
                    <div>
                      <div className="font-medium">{c.n}</div>
                      <div className="text-xs text-muted-foreground">{c.pos}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div>{c.f}</div>
                      <Badge variant="outline" className="mt-1 text-xs">{c.t}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="risks" className="mt-6">
            <Section title="Top risks" icon={AlertTriangle} tone="warning">
              <ul className="space-y-3">
                {[
                  { t: "Retention cliff", s: "High", d: "Fitness apps see 70% drop by day 30." },
                  { t: "CAC inflation", s: "Medium", d: "Consumer paid channels are saturated." },
                  { t: "Health claims compliance", s: "Medium", d: "Marketing copy needs legal review." },
                ].map((r) => (
                  <li key={r.t} className="flex gap-3 text-sm">
                    <Badge variant="outline" className="shrink-0">{r.s}</Badge>
                    <div>
                      <div className="font-medium">{r.t}</div>
                      <div className="text-muted-foreground">{r.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          </TabsContent>

          <TabsContent value="gtm" className="mt-6">
            <Section title="90-day go-to-market">
              <ol className="space-y-3">
                {[
                  "Weeks 1–2: Land 3 mid-market HR pilots via warm intros.",
                  "Weeks 3–6: Ship corporate dashboard MVP + 10 founder-led check-ins.",
                  "Weeks 7–10: Launch case study + LinkedIn-led content engine.",
                  "Weeks 11–13: Move pilots to paid, target $8k MRR by day 90.",
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="font-mono text-primary shrink-0">0{i + 1}</span>
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ol>
            </Section>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function Metric({
  icon: Icon, label, value, suffix, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; suffix?: string;
  tone: "success" | "warning" | "primary" | "default";
}) {
  const toneMap = {
    success: "text-success", warning: "text-warning",
    primary: "text-primary", default: "text-foreground",
  };
  return (
    <Card className="p-5 bg-gradient-card border-border/60">
      <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="mt-4 text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-2xl font-semibold tracking-tight ${toneMap[tone]}`}>{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </Card>
  );
}

function Section({
  title, children, icon: Icon, tone,
}: {
  title: string; children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "success" | "warning";
}) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <Card className="p-6 bg-gradient-card border-border/60">
      <h3 className="flex items-center gap-2 font-medium">
        {Icon && <Icon className={`size-4 ${toneCls}`} />} {title}
      </h3>
      <div className="mt-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </Card>
  );
}
