import { Link, useLocation } from "wouter";
import { Activity, Cpu, Layers, Server, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/architecture", label: "Architecture Components", icon: Layers },
  { href: "/technologies", label: "Key Technologies", icon: Cpu },
  { href: "/best-practices", label: "Best Practices", icon: ShieldCheck },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-mono font-bold text-lg tracking-tight">HFT_ARCH</span>
          </div>
        </Link>
        <p className="text-xs text-muted-foreground mt-2 font-mono">Crypto Exchange Infra</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="glass-panel p-4 rounded-lg flex items-center gap-3">
          <Server className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs font-mono text-muted-foreground">System Status</p>
            <p className="text-sm font-semibold text-emerald-400">Optimal (1.2ms)</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
