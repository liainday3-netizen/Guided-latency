import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useChannel } from "@/hooks/useExchangeWS";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, Activity, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Balances, TickerData, Order, Trade } from "@shared/schema";
import { Link } from "wouter";

const ASSET_COLORS: Record<string, string> = {
  BTC: "text-orange-400",
  ETH: "text-purple-400",
  SOL: "text-green-400",
  USD: "text-blue-400",
};

export default function Portfolio() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const tickers = useChannel<TickerData[]>("tickers");

  const { data: balances } = useQuery<Balances>({
    queryKey: ["/api/wallet/balances"],
    queryFn: () => fetch("/api/wallet/balances", { credentials: "include" }).then((r) => r.json()),
    refetchInterval: 5000,
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: () => fetch("/api/orders", { credentials: "include" }).then((r) => r.json()),
  });

  const { data: trades } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
    queryFn: () => fetch("/api/trades", { credentials: "include" }).then((r) => r.json()),
  });

  const getPrice = (asset: string) => {
    if (asset === "USD") return 1;
    const sym = `${asset}/USD`;
    return tickers?.find((t) => t.symbol === sym)?.price ?? 0;
  };

  const totalUSD = balances
    ? Object.entries(balances).reduce((sum, [asset, amount]) => sum + amount * getPrice(asset), 0)
    : 0;

  const openOrders = orders?.filter((o) => o.status === "open" || o.status === "partial") ?? [];
  const recentTrades = trades?.slice(0, 10) ?? [];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Sign in to view your portfolio</p>
        <Link href="/auth"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-muted-foreground text-sm">Welcome back, <span className="text-blue-400">{user.username}</span></p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => { await logout(); setLocation("/auth"); }}>
          Sign Out
        </Button>
      </div>

      {/* Total Value */}
      <Card className="glass-panel border-blue-500/20">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
          <p className="text-4xl font-bold text-white font-mono">
            ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Estimated USD equivalent</p>
        </CardContent>
      </Card>

      {/* Asset Balances */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Holdings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {balances && Object.entries(balances).map(([asset, amount]) => {
            const price = getPrice(asset);
            const usdVal = amount * price;
            const ticker = tickers?.find((t) => t.symbol === `${asset}/USD`);
            return (
              <motion.div key={asset} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-panel border-border hover:border-blue-500/30 transition-colors cursor-pointer"
                  onClick={() => asset !== "USD" && setLocation(`/trade?symbol=${asset}%2FUSD`)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold text-sm ${ASSET_COLORS[asset] ?? "text-white"}`}>{asset}</span>
                      {ticker && (
                        <span className={`text-xs ${ticker.changePercent24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {ticker.changePercent24h >= 0 ? "+" : ""}{ticker.changePercent24h.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-mono font-semibold text-white">
                      {asset === "USD"
                        ? amount.toFixed(2)
                        : amount.toFixed(6)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ≈ ${usdVal.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Open Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Open Orders ({openOrders.length})</h2>
          <Link href="/trade"><Button variant="ghost" size="sm" className="text-xs gap-1">Trade <ArrowRight className="h-3 w-3" /></Button></Link>
        </div>
        {openOrders.length === 0 ? (
          <Card className="glass-panel border-border">
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              No open orders
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-panel border-border">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-normal">Symbol</th>
                    <th className="text-left p-3 text-muted-foreground font-normal">Side</th>
                    <th className="text-right p-3 text-muted-foreground font-normal">Price</th>
                    <th className="text-right p-3 text-muted-foreground font-normal">Qty</th>
                    <th className="text-right p-3 text-muted-foreground font-normal">Filled</th>
                    <th className="text-right p-3 text-muted-foreground font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {openOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                      <td className="p-3 font-mono text-xs text-white">{o.symbol}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={o.side === "buy" ? "text-emerald-400 border-emerald-400/30" : "text-red-400 border-red-400/30"}>
                          {o.side.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-mono text-xs">{o.type === "market" ? "MKT" : `$${o.price.toLocaleString()}`}</td>
                      <td className="p-3 text-right font-mono text-xs">{o.quantity.toFixed(6)}</td>
                      <td className="p-3 text-right font-mono text-xs">{o.filledQty.toFixed(6)}</td>
                      <td className="p-3 text-right">
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 text-xs">{o.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Trade History */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Trades</h2>
        {recentTrades.length === 0 ? (
          <Card className="glass-panel border-border">
            <CardContent className="p-6 text-center text-muted-foreground text-sm">No trades yet</CardContent>
          </Card>
        ) : (
          <Card className="glass-panel border-border">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-normal">Symbol</th>
                    <th className="text-left p-3 text-muted-foreground font-normal">Side</th>
                    <th className="text-right p-3 text-muted-foreground font-normal">Price</th>
                    <th className="text-right p-3 text-muted-foreground font-normal">Qty</th>
                    <th className="text-right p-3 text-muted-foreground font-normal">Value</th>
                    <th className="text-right p-3 text-muted-foreground font-normal">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((t) => {
                    const isBuy = t.buyUserId === user.id;
                    return (
                      <tr key={t.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                        <td className="p-3 font-mono text-xs text-white">{t.symbol}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={isBuy ? "text-emerald-400 border-emerald-400/30" : "text-red-400 border-red-400/30"}>
                            {isBuy ? "BUY" : "SELL"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-mono text-xs">${t.price.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-xs">{t.quantity.toFixed(6)}</td>
                        <td className="p-3 text-right font-mono text-xs">${(t.price * t.quantity).toFixed(2)}</td>
                        <td className="p-3 text-right text-xs text-muted-foreground">
                          {new Date(t.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
