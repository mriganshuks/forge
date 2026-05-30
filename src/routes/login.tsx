import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/forge/Logo";
import { Github } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Forge" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to keep forging.">
      <form
        className="space-y-4"
        onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }}
      >
        <Button type="button" variant="outline" className="w-full">
          <Github className="size-4 mr-2" /> Continue with GitHub
        </Button>
        <div className="relative text-center text-xs text-muted-foreground">
          <div className="absolute inset-0 top-1/2 border-t border-border/60" />
          <span className="relative bg-background px-2">or with email</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="founder@startup.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</a>
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-foreground hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-card border-r border-border/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
        <div className="relative"><Logo /></div>
        <div className="relative space-y-6">
          <blockquote className="text-2xl font-medium leading-snug">
            "Forge is the cofounder-grade research tool I always wanted on day one."
          </blockquote>
          <div className="text-sm text-muted-foreground">— Maya Chen, Founder of Loomly</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center"><Logo /></div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
