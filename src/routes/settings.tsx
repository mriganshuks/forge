import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/forge/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Forge" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your account, preferences, and security.</p>
        </div>

        <Card className="p-6 bg-gradient-card border-border/60">
          <h2 className="font-medium">Profile</h2>
          <div className="mt-6 flex items-center gap-4">
            <div className="size-16 rounded-full bg-gradient-primary grid place-items-center text-lg font-semibold text-primary-foreground">AS</div>
            <Button variant="outline" size="sm">Upload photo</Button>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Field label="Full name" defaultValue="Alex Stone" />
            <Field label="Email" defaultValue="alex@founder.com" />
            <Field label="Company" defaultValue="Stonework Labs" />
            <Field label="Role" defaultValue="Founder" />
          </div>
          <div className="mt-6 flex justify-end">
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">Save changes</Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border/60">
          <h2 className="font-medium">Preferences</h2>
          <div className="mt-6 space-y-5">
            {[
              { l: "Email me when a report is ready", on: true },
              { l: "Weekly insights digest", on: true },
              { l: "Product updates & launches", on: false },
              { l: "Marketing emails", on: false },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="text-sm">{p.l}</div>
                <Switch defaultChecked={p.on} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border/60">
          <h2 className="font-medium">Security</h2>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Field label="Current password" type="password" placeholder="••••••••" />
            <Field label="New password" type="password" placeholder="••••••••" />
          </div>
          <Separator className="my-6" />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Two-factor authentication</div>
              <div className="text-xs text-muted-foreground">Add an extra layer of security.</div>
            </div>
            <Button variant="outline" size="sm">Enable 2FA</Button>
          </div>
        </Card>

        <Card className="p-6 border-destructive/40 bg-destructive/5">
          <h2 className="font-medium text-destructive">Danger zone</h2>
          <p className="mt-1 text-sm text-muted-foreground">Permanently delete your account and all reports.</p>
          <Button variant="destructive" size="sm" className="mt-4">Delete account</Button>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input {...props} />
    </div>
  );
}
