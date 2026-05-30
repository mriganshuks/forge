import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/forge/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CheckCircle2, CreditCard, Download } from "lucide-react";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing — Forge" }] }),
  component: BillingPage,
});

const plans = [
  { name: "Starter", price: 0, features: ["3 reports / mo", "Standard depth", "PDF export"] },
  { name: "Pro", price: 49, current: true, features: ["50 reports / mo", "Deep mode", "Investor briefs", "Priority support"] },
  { name: "Studio", price: 199, features: ["Unlimited reports", "Team workspaces", "API access", "Dedicated CSM"] },
];

const invoices = [
  { id: "INV-2026-005", date: "May 01, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-004", date: "Apr 01, 2026", amount: "$49.00", status: "Paid" },
  { id: "INV-2026-003", date: "Mar 01, 2026", amount: "$49.00", status: "Paid" },
];

function BillingPage() {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
          <p className="mt-1 text-muted-foreground">Manage your plan, payment method, and invoices.</p>
        </div>

        <Card className="p-6 bg-gradient-card border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Current plan</div>
              <div className="mt-1 text-2xl font-semibold flex items-center gap-2">
                Pro <Badge className="bg-gradient-primary text-primary-foreground border-0">Active</Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">$49 / month · Renews June 28, 2026</div>
            </div>
            <Button variant="outline">Manage subscription</Button>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm">
              <span>Reports used this month</span>
              <span className="text-muted-foreground">12 / 50</span>
            </div>
            <Progress value={24} className="mt-2 h-2" />
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold">Change plan</h2>
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <Card key={p.name} className={`p-6 border-border/60 ${p.current ? "bg-gradient-card border-primary/40 shadow-glow" : ""}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{p.name}</h3>
                  {p.current && <Badge variant="secondary">Current</Badge>}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight">${p.price}</span>
                  <span className="text-sm text-muted-foreground">/ mo</span>
                </div>
                <Button
                  className={`mt-5 w-full ${p.current ? "" : "bg-gradient-primary text-primary-foreground hover:opacity-90"}`}
                  variant={p.current ? "outline" : "default"}
                  disabled={p.current}
                >
                  {p.current ? "Current plan" : p.price > 49 ? "Upgrade" : "Downgrade"}
                </Button>
                <ul className="mt-5 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 bg-gradient-card border-border/60">
          <h2 className="font-medium">Payment method</h2>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border/60 p-4 bg-background/40">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-accent grid place-items-center">
                <CreditCard className="size-4" />
              </div>
              <div>
                <div className="text-sm font-medium">Visa •••• 4242</div>
                <div className="text-xs text-muted-foreground">Expires 09 / 2028</div>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </Card>

        <Card className="bg-gradient-card border-border/60 overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="font-medium">Invoices</h2>
          </div>
          <Table className="mt-4">
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((i) => (
                <TableRow key={i.id} className="border-border/60">
                  <TableCell className="font-medium">{i.id}</TableCell>
                  <TableCell className="text-muted-foreground">{i.date}</TableCell>
                  <TableCell>{i.amount}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      <span className="size-1.5 rounded-full bg-success mr-1.5" /> {i.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm"><Download className="size-3.5 mr-1" /> PDF</Button>
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
