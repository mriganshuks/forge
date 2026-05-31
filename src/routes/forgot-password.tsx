import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/forge/AuthLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Forge" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a secure reset link.">
      {sent ? (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>If an account exists for <span className="text-foreground">{email}</span>, a reset link is on its way.</p>
          <Link to="/login" className="text-foreground hover:underline">Back to sign in</Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground">Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
