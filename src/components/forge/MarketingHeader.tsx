import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-foreground transition-colors">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
