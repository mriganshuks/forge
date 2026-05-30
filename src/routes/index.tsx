import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { MarketingHeader } from "@/components/forge/MarketingHeader";
import { MarketingFooter } from "@/components/forge/MarketingFooter";
import {
  ArrowRight, Sparkles, Target, LineChart, Users, Zap, Shield, CheckCircle2,
  TrendingUp, Layers, Globe, Star,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forge — Validate startup ideas with AI in minutes" },
      { name: "description", content: "Forge generates investor-grade validation reports for your startup idea: market sizing, competitors, risks, and go-to-market — in minutes." },
      { property: "og:title", content: "Forge — Validate startup ideas with AI" },
      { property: "og:description", content: "Investor-grade validation reports in minutes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      <Hero />
      <Demo />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <MarketingFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 text-center">
        <Badge variant="outline" className="mb-6 border-border/60 bg-card/60 backdrop-blur animate-fade-in">
          <Sparkles className="size-3 mr-1.5 text-primary" />
          Now with GPT-class market analysis
        </Badge>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] animate-fade-up">
          Validate your startup<br />
          <span className="text-gradient">before you build it.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up [animation-delay:100ms]">
          Forge turns a one-line idea into an investor-grade validation report —
          market sizing, competitors, risks, and a 90-day GTM plan. In minutes.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up [animation-delay:200ms]">
          <Button size="lg" asChild className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow">
            <Link to="/signup">Start free <ArrowRight className="size-4 ml-1" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#demo">Watch demo</a>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground animate-fade-up [animation-delay:300ms]">
          No credit card required · 3 free reports
        </p>
      </div>
    </section>
  );
}

function Demo() {
  return (
    <section id="demo" className="mx-auto max-w-6xl px-6 -mt-16 relative">
      <div className="relative rounded-2xl border border-border/60 bg-gradient-card shadow-card overflow-hidden animate-fade-up">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-background/40">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-destructive/70" />
            <div className="size-3 rounded-full bg-warning/70" />
            <div className="size-3 rounded-full bg-success/70" />
          </div>
          <div className="ml-4 text-xs text-muted-foreground">forge.app / report / ai-fitness-coach</div>
        </div>
        <div className="grid md:grid-cols-[200px_1fr] min-h-[420px]">
          <div className="border-r border-border/60 p-4 space-y-2 bg-sidebar/40">
            {["Overview", "Market Size", "Competitors", "Risks", "GTM Plan", "Verdict"].map((s, i) => (
              <div key={s} className={`text-sm px-3 py-2 rounded-md ${i === 0 ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
                {s}
              </div>
            ))}
          </div>
          <div className="p-8">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Validation report</div>
            <h3 className="text-2xl font-semibold mt-2">AI Fitness Coach for busy professionals</h3>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { l: "TAM", v: "$48B", c: "text-primary" },
                { l: "Confidence", v: "82%", c: "text-success" },
                { l: "Competition", v: "Medium", c: "text-warning" },
              ].map((m) => (
                <div key={m.l} className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <div className="text-xs text-muted-foreground">{m.l}</div>
                  <div className={`text-2xl font-semibold mt-1 ${m.c}`}>{m.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              {[
                "Strong demand signal across 14k+ Reddit threads in last 90 days",
                "3 well-funded incumbents, but no clear leader in B2B segment",
                "Recommended wedge: corporate wellness via HR partnerships",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Target, title: "Market sizing", desc: "Bottom-up TAM, SAM, SOM with cited assumptions and sources." },
  { icon: Users, title: "Competitor landscape", desc: "Auto-mapped competitors with positioning and funding signals." },
  { icon: LineChart, title: "Demand signals", desc: "Search trends, social mentions, and waitlist proxies aggregated." },
  { icon: Shield, title: "Risk analysis", desc: "Regulatory, technical, and execution risks ranked by severity." },
  { icon: Layers, title: "GTM playbook", desc: "Channel-by-channel 90-day plan with budgets and KPIs." },
  { icon: Zap, title: "Investor brief", desc: "Export a one-pager VCs actually want to read." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-32">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-4">Features</Badge>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Everything you need to <span className="text-gradient">de-risk an idea</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Built by founders who got tired of 80-tab research spirals.
        </p>
      </div>
      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <Card key={f.title} className="p-6 bg-gradient-card border-border/60 hover:border-primary/40 transition-colors group">
            <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center group-hover:bg-primary/20 transition-colors">
              <f.icon className="size-5 text-primary" />
            </div>
            <h3 className="mt-4 font-medium">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Describe your idea", d: "One sentence is enough. Add context if you want sharper results." },
    { n: "02", t: "Forge runs the analysis", d: "Our agents synthesize market data, competitors, and signals in minutes." },
    { n: "03", t: "Decide with confidence", d: "Export, share with co-founders or investors, iterate the wedge." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-32 border-t border-border/60">
      <div className="grid md:grid-cols-2 gap-16 items-start">
        <div>
          <Badge variant="outline" className="mb-4">How it works</Badge>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            From idea to validation in <span className="text-gradient">three steps</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            No frameworks to learn. No spreadsheets to wrangle. Just answers.
          </p>
        </div>
        <div className="space-y-2">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-border/60 bg-gradient-card p-6 flex gap-5">
              <div className="text-sm font-mono text-primary">{s.n}</div>
              <div>
                <h3 className="font-medium">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Starter", price: "$0", desc: "Try Forge with no commitment.",
    features: ["3 reports / month", "Standard depth", "PDF export", "Community support"],
    cta: "Start free",
  },
  {
    name: "Pro", price: "$49", desc: "For active founders shipping fast.", popular: true,
    features: ["50 reports / month", "Deep analysis mode", "Competitor monitoring", "Investor one-pagers", "Priority support"],
    cta: "Start Pro trial",
  },
  {
    name: "Studio", price: "$199", desc: "For venture studios & accelerators.",
    features: ["Unlimited reports", "Team workspaces", "API access", "Custom branding", "Dedicated CSM"],
    cta: "Talk to sales",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-32 border-t border-border/60">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-4">Pricing</Badge>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Simple, founder-friendly pricing</h2>
        <p className="mt-4 text-muted-foreground text-lg">Start free. Upgrade when you need depth.</p>
      </div>
      <div className="mt-16 grid md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card key={p.name} className={`p-8 border-border/60 relative ${p.popular ? "bg-gradient-card border-primary/40 shadow-glow" : ""}`}>
            {p.popular && (
              <Badge className="absolute -top-2 right-6 bg-gradient-primary text-primary-foreground border-0">Most popular</Badge>
            )}
            <h3 className="font-medium">{p.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
              <span className="text-sm text-muted-foreground">/ mo</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <Button asChild className={`mt-6 w-full ${p.popular ? "bg-gradient-primary text-primary-foreground hover:opacity-90" : ""}`} variant={p.popular ? "default" : "outline"}>
              <Link to="/signup">{p.cta}</Link>
            </Button>
            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}

const testimonials = [
  { quote: "Forge saved me two months of research and probably one bad pivot. The competitor map alone was worth it.", name: "Maya Chen", role: "Founder, Loomly" },
  { quote: "I run a small studio. Forge is now step zero for every idea we evaluate. It's like having a research analyst on tap.", name: "Daniel Ortiz", role: "Partner, Northbound" },
  { quote: "The investor brief got us our first meeting. Clean, credible, and grounded in real signals.", name: "Priya Raman", role: "CEO, FieldKit" },
];

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-32 border-t border-border/60">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-4">Loved by founders</Badge>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Built for the <span className="text-gradient">0-to-1 moment</span>
        </h2>
      </div>
      <div className="mt-16 grid md:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <Card key={t.name} className="p-6 bg-gradient-card border-border/60">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-warning text-warning" />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-primary grid place-items-center text-xs font-semibold text-primary-foreground">
                {t.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="text-sm">
                <div className="font-medium">{t.name}</div>
                <div className="text-muted-foreground text-xs">{t.role}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

const faqs = [
  { q: "How accurate are Forge reports?", a: "Forge cites every claim and assumption. Think of it as a fast first draft, not a final answer — pair it with founder judgment." },
  { q: "Where does the data come from?", a: "We aggregate public sources: search trends, social discussions, funding databases, and product directories. Sources are linked in every report." },
  { q: "Can I share reports with co-founders or investors?", a: "Yes. Every report has a shareable link, PDF export, and a one-page investor brief." },
  { q: "What happens after I use my free reports?", a: "You can keep your account on the free plan and upgrade only when you need more reports or deep mode." },
  { q: "Do you offer refunds?", a: "30-day, no-questions-asked refunds on Pro and Studio plans." },
];

function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-32 border-t border-border/60">
      <div className="text-center">
        <Badge variant="outline" className="mb-4">FAQ</Badge>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Questions, answered</h2>
      </div>
      <Accordion type="single" collapsible className="mt-12">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`i-${i}`} className="border-border/60">
            <AccordionTrigger className="text-left hover:no-underline">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-32">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card p-16 text-center">
        <div className="absolute inset-0 bg-gradient-hero opacity-60" />
        <div className="relative">
          <TrendingUp className="size-10 text-primary mx-auto" />
          <h2 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight">
            Stop guessing.<br /><span className="text-gradient">Start forging.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Your next idea deserves a real first look. Run your first validation report in under 5 minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow">
              <Link to="/signup">Start free <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#pricing">See pricing</a>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Globe className="size-3.5" /> Used in 40+ countries</span>
            <span className="flex items-center gap-1.5"><Shield className="size-3.5" /> SOC 2 ready</span>
          </div>
        </div>
      </div>
    </section>
  );
}
