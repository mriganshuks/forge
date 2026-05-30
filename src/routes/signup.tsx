import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github } from "lucide-react";
import { AuthLayout } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your Forge account" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  return (
    <AuthLayout title="Create your account" subtitle="3 free reports. No card required.">
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
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Alex Stone" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="founder@startup.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
          Create account
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          By signing up you agree to our Terms & Privacy.
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-foreground hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
