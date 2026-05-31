import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/forge/AuthLayout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Forge" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
  }),
  component: LoginPage,
});

function GoogleIcon() {
  return (
    <svg className="size-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    navigate({ to: redirect || "/dashboard", replace: true });
  };

  const handleGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + (redirect || "/dashboard"),
    });
    if (res.error) toast.error(res.error.message ?? "Google sign-in failed");
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to keep forging.">
      <form className="space-y-4" onSubmit={handleEmail}>
        <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
          <GoogleIcon /> Continue with Google
        </Button>
        <div className="relative text-center text-xs text-muted-foreground">
          <div className="absolute inset-0 top-1/2 border-t border-border/60" />
          <span className="relative bg-background px-2">or with email</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="founder@startup.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-foreground hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
