import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/forge/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateBlueprint } from "@/lib/blueprint.functions";

export const Route = createFileRoute("/_authenticated/reports/new")({
  head: () => ({ meta: [{ title: "New report — Forge" }] }),
  component: NewReportPage,
});

function NewReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [market, setMarket] = useState("");
  const [industry, setIndustry] = useState("");
  const [depth, setDepth] = useState("deep");
  const generate = useServerFn(generateBlueprint);

  const createReport = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          title,
          idea,
          target_market: market || null,
          status: "generating",
        })
        .select("id")
        .single();
      if (error) throw error;
      const reportId = data.id as string;
      // Navigate immediately so user sees the loading state on the detail page
      navigate({ to: "/reports/$reportId", params: { reportId } });
      // Fire generation; report detail page polls status
      generate({ data: { reportId, industry: industry || undefined, audience: market || undefined } })
        .catch((e: Error) => toast.error(e.message ?? "Generation failed"));
      return reportId;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createReport.mutate();
  };

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto">
        <div>
          <Badge variant="outline" className="mb-3"><Sparkles className="size-3 mr-1 text-primary" /> New validation</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Forge a new report</h1>
          <p className="mt-2 text-muted-foreground">
            Give us the gist. Forge will take care of the heavy lifting — about 3–5 minutes.
          </p>
        </div>

        <Card className="mt-8 p-6 bg-gradient-card border-border/60">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Idea title</Label>
              <Input id="title" placeholder="e.g. AI fitness coach for busy professionals" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Describe the idea</Label>
              <Textarea
                id="desc"
                rows={6}
                placeholder="What is it? Who is it for? What's the wedge? Anything we should know..."
                required
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Tip: the more specific, the sharper the report.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="market">Target market (optional)</Label>
              <Input id="market" placeholder="e.g. US knowledge workers, 25–40" value={market} onChange={(e) => setMarket(e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label>Analysis depth</Label>
              <RadioGroup value={depth} onValueChange={setDepth} className="grid sm:grid-cols-2 gap-3">
                {[
                  { v: "standard", t: "Standard", d: "~3 min · 1 credit" },
                  { v: "deep", t: "Deep", d: "~5 min · 2 credits", badge: "Recommended" },
                ].map((o) => (
                  <Label
                    key={o.v}
                    htmlFor={o.v}
                    className="flex items-start gap-3 rounded-lg border border-border/60 p-4 cursor-pointer hover:border-primary/40 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem id={o.v} value={o.v} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{o.t}</span>
                        {o.badge && <Badge variant="secondary" className="text-xs">{o.badge}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{o.d}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Zap className="size-3.5 text-primary" /> AI generation coming soon
              </div>
              <Button
                type="submit"
                disabled={createReport.isPending}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                {createReport.isPending ? "Creating…" : <>Create report <ArrowRight className="size-4 ml-1" /></>}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
