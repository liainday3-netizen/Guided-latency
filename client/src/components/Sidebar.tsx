import { Link, useLocation } from "wouter";
import {
  Activity, Cpu, Layers, Server, ShieldCheck, Zap, Wallet,
  Sparkles, BarChart2, User, LogIn, ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useChannel } from "@/hooks/useExchangeWS";
import type { TickerData } from "@shared/schema";

const GUIDE_NAV = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/ai-architect", label: "AI Builder", icon: Sparkles },
  { href: "/architecture", label: "Architecture", icon: Server },
  { href: "/technologies", label: "Technologies", icon: Cpu },
  { href: "/on-chain", label: "On-Chain & Capital", icon: Wallet },
  { href: "/best-practices", label: "Best Practices", icon: ShieldCheck },
];

const EXCHANGE_NAV = [
  { href: "/trade", label: "Trade", icon: BarChart2 },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/portfolio", label: "Portfolio", icon: User },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Live BTC ticker for status widget
  const btcTicker = useChannel<TickerData>("ticker:BTC/USD");
  const isUp = btcTicker ? btcTicker.changePercent24h >= 0 : true;

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-border bg-card/40 backdrop-blur-sm h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/30">
            <Zap className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">NexTrade</p>
            <p className="text-[10px] text-muted-foreground">Exchange</p>
          </div>
        </div>
      </div>

      {/* Exchange section */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 mb-1.5">Exchange</p>
        <nav className="space-y-0.5">
          {EXCHANGE_NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <div className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors",
                location === href
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5",
              )}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </div>
            </Link>
          ))}
          {!user && (
            <Link href="/auth">
              <div className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors",
                location === "/auth"
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5",
              )}>
                <LogIn className="h-4 w-4 shrink-0" />
                Sign In
              </div>
            </Link>
          )}
        </nav>
      </div>

      {/* Divider */}
      <div className="px-3 py-2">
        <div className="h-px bg-border" />
      </div>

      {/* Guide section */}
      <div className="px-3 pb-2">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 mb-1.5">Architecture Guide</p>
        <nav className="space-y-0.5">
          {GUIDE_NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <div className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors",
                location === href
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5",
              )}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Live ticker widget */}
      <div className="mt-auto p-3 border-t border-border">
        {btcTicker ? (
          <div className="glass-panel rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono text-muted-foreground">BTC/USD</p>
              <span className={`text-[10px] font-mono ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? "▲" : "▼"} {Math.abs(btcTicker.changePercent24h).toFixed(2)}%
              </span>
            </div>
            <p className={`text-sm font-mono font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              ${btcTicker.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        ) : (
          <div className="glass-panel rounded-lg p-3">
            <p className="text-[10px] font-mono text-muted-foreground">System Status</p>
            <p className="text-sm font-semibold text-emerald-400">Connecting…</p>
          </div>
        )}
      </div>
    </aside>
  );
}
