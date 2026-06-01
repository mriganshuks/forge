import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, AlertTriangle, Target, Rocket, Lightbulb, ShieldAlert } from "lucide-react";

type Dict = Record<string, unknown>;

function asArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function SectionHeader({ icon: Icon, eyebrow, title, description }: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center shrink-0">
        <Icon className="size-5 text-primary" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
        <h2 className="text-2xl font-semibold tracking-tight mt-0.5">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}

function Bullet({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "good" | "bad" }) {
  const cls = tone === "good" ? "text-success" : tone === "bad" ? "text-destructive" : "text-primary";
  return (
    <li className="flex gap-2.5 text-sm leading-relaxed">
      <CheckCircle2 className={`size-4 mt-0.5 shrink-0 ${cls}`} />
      <span>{children}</span>
    </li>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export function SummarySection({ content }: { content: Dict }) {
  const verdict = asStr(content.verdict);
  const verdictTone =
    verdict === "strong" ? "bg-success/15 text-success border-success/30"
    : verdict === "promising" ? "bg-primary/15 text-primary border-primary/30"
    : verdict === "challenging" ? "bg-warning/15 text-warning border-warning/30"
    : "bg-destructive/15 text-destructive border-destructive/30";
  return (
    <Card className="p-6 bg-gradient-card border-border/60">
      <SectionHeader icon={Lightbulb} eyebrow="Executive summary" title={asStr(content.headline) || "Overview"} />
      <Badge variant="outline" className={`capitalize ${verdictTone}`}>Verdict: {verdict || "—"}</Badge>
      <p className="mt-4 text-base leading-relaxed text-foreground/90">{asStr(content.thesis)}</p>
      {asArr(content.key_insights).length > 0 && (
        <>
          <div className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">Key insights</div>
          <ul className="mt-3 space-y-2">
            {asArr(content.key_insights).map((it, i) => <Bullet key={i}>{String(it)}</Bullet>)}
          </ul>
        </>
      )}
    </Card>
  );
}

export function MarketSection({ content }: { content: Dict }) {
  return (
    <Card className="p-6 bg-gradient-card border-border/60">
      <SectionHeader icon={TrendingUp} eyebrow="Market" title="Market Opportunity" />
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <StatCard label="Market size" value={asStr(content.market_size) || "—"} />
        <StatCard label="Industry" value={asStr(content.industry_overview).slice(0, 80) + (asStr(content.industry_overview).length > 80 ? "…" : "")} />
      </div>
      <div className="space-y-6">
        <Block title="Industry overview">{asStr(content.industry_overview)}</Block>
        <ListBlock title="Trends" items={asArr(content.trends)} />
        <ListBlock title="Opportunities" items={asArr(content.opportunities)} tone="good" />
        <ListBlock title="Challenges" items={asArr(content.challenges)} tone="bad" />
      </div>
    </Card>
  );
}

export function CompetitorsSection({ content }: { content: Dict }) {
  const comps = asArr(content.top_competitors) as Dict[];
  return (
    <Card className="p-6 bg-gradient-card border-border/60">
      <SectionHeader icon={Target} eyebrow="Landscape" title="Competitor Breakdown" />
      <div className="grid md:grid-cols-2 gap-4">
        {comps.map((c, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-card/40 p-5">
            <div className="font-medium">{asStr(c.name)}</div>
            <p className="text-sm text-muted-foreground mt-1">{asStr(c.description)}</p>
            <div className="mt-4 grid gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-success/80 mb-1.5">Strengths</div>
                <ul className="space-y-1.5">{asArr(c.strengths).map((s, j) => <Bullet key={j} tone="good">{String(s)}</Bullet>)}</ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-destructive/80 mb-1.5">Weaknesses</div>
                <ul className="space-y-1.5">{asArr(c.weaknesses).map((s, j) => <Bullet key={j} tone="bad">{String(s)}</Bullet>)}</ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <ListBlock title="Differentiation opportunities" items={asArr(content.differentiation)} tone="good" />
      </div>
    </Card>
  );
}

export function MvpSection({ content }: { content: Dict }) {
  return (
    <Card className="p-6 bg-gradient-card border-border/60">
      <SectionHeader icon={Rocket} eyebrow="Build" title="MVP Blueprint" />
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureColumn title="Core launch" tone="primary" items={asArr(content.core_features)} />
        <FeatureColumn title="Nice to have" tone="muted" items={asArr(content.nice_to_have)} />
        <FeatureColumn title="Future" tone="muted" items={asArr(content.future_features)} />
      </div>
      <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="text-xs uppercase tracking-wider text-primary mb-1">Recommended scope</div>
        <p className="text-sm leading-relaxed">{asStr(content.recommended_scope)}</p>
      </div>
    </Card>
  );
}

export function GtmSection({ content }: { content: Dict }) {
  const plan = asArr(content.thirty_day_plan) as Dict[];
  return (
    <Card className="p-6 bg-gradient-card border-border/60">
      <SectionHeader icon={Rocket} eyebrow="Launch" title="Go-To-Market Plan" />
      <div className="space-y-6">
        <Block title="Launch strategy">{asStr(content.launch_strategy)}</Block>
        <ListBlock title="Acquisition channels" items={asArr(content.acquisition_channels)} />
        <Block title="Content strategy">{asStr(content.content_strategy)}</Block>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">First 30 days</div>
          <div className="space-y-3">
            {plan.map((w, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-card/40 p-4">
                <div className="flex items-baseline gap-3">
                  <Badge variant="outline" className="font-normal">{asStr(w.week)}</Badge>
                  <span className="font-medium text-sm">{asStr(w.focus)}</span>
                </div>
                <ul className="mt-3 space-y-1.5">{asArr(w.actions).map((a, j) => <Bullet key={j}>{String(a)}</Bullet>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function RisksSection({ content }: { content: Dict }) {
  const risks = asArr(content.key_risks) as Dict[];
  return (
    <Card className="p-6 bg-gradient-card border-border/60">
      <SectionHeader icon={ShieldAlert} eyebrow="Risks" title="Risk Analysis" />
      <div className="space-y-3">
        {risks.map((r, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-card/40 p-5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-warning mt-0.5 shrink-0" />
              <div className="font-medium text-sm">{asStr(r.risk)}</div>
            </div>
            <div className="mt-3 grid sm:grid-cols-2 gap-3 pl-7">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Obstacle</div>
                <p className="text-sm text-muted-foreground">{asStr(r.obstacle)}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Mitigation</div>
                <p className="text-sm">{asStr(r.mitigation)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

function ListBlock({ title, items, tone }: { title: string; items: unknown[]; tone?: "good" | "bad" }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <ul className="space-y-1.5">{items.map((it, i) => <Bullet key={i} tone={tone}>{String(it)}</Bullet>)}</ul>
    </div>
  );
}

function FeatureColumn({ title, items, tone }: { title: string; items: unknown[]; tone: "primary" | "muted" }) {
  const borderCls = tone === "primary" ? "border-primary/30 bg-primary/5" : "border-border/60 bg-card/40";
  return (
    <div className={`rounded-lg border ${borderCls} p-4`}>
      <div className="text-xs uppercase tracking-wider mb-3">{title}</div>
      <ul className="space-y-1.5">{items.map((it, i) => <Bullet key={i}>{String(it)}</Bullet>)}</ul>
    </div>
  );
}
