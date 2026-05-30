import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-primary blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="relative size-8 rounded-lg bg-gradient-primary grid place-items-center">
          <Flame className="size-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
      </div>
      <span className="font-semibold tracking-tight text-lg">Forge</span>
    </Link>
  );
}
