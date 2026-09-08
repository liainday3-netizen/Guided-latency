import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useChannel, subscribe } from "@/hooks/useExchangeWS";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, TrendingUp, TrendingDown, Zap, X } from "lucide-react";
import { Link, useSearch } from "wouter";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Balances, TickerData, OrderBookSnapshot, Trade, Order, TradingSymbol } from "@shared/schema";
import { SYMBOLS } from "@shared/schema";

// ─── Price Sparkline ─────────────────────────────────────────────────────────
function usePriceHistory(symbol: TradingSymbol) {
  const [history, setHistory] = useState<{ t: string; p: number }[]>([]);
  const ticker = useChannel<TickerData>(`ticker:${symbol}`);

  useEffect(() => {
    if (!ticker) return;
    setHistory((prev) => {
      const next = [...prev, { t: new Date().toLocaleTimeString(), p: ticker.price }];
      return next.slice(-60);
    });
  }, [ticker?.price]);

  return history;
}

// ─── Order Book ──────────────────────────────────────────────────────────────
function OrderBook({ symbol }: { symbol: TradingSymbol }) {
  const book = useChannel<OrderBookSnapshot>(`orderbook:${symbol}`);
  if (!book) return <div className="text-center text-muted-foreground text-sm py-8">Loading…</div>;

  const maxBidQty = Math.max(...(book.bids.map((b) => b.quantity) || [1]));
  const maxAskQty = Math.max(...(book.asks.map((a) => a.quantity) || [1]));

  return (
    <div className="space-y-0.5">
      {/* Asks (sell wall) — reversed so best ask is closest to spread */}
      <div className="space-y-0.5">
        {[...book.asks].reverse().map((level, i) => (
          <div key={`ask-${level.price}-${i}`} className="relative flex justify-between text-xs font-mono px-2 py-0.5 rounded-sm overflow-hidden">
            <div
              className="absolute inset-y-0 right-0 bg-red-500/10"
              style={{ width: `${(level.quantity / maxAskQty) * 100}%` }}
            />
            <span className="text-red-400 relative z-10">{level.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground relative z-10">{level.quantity.toFixed(4)}</span>
          </div>
        ))}
      </div>

      {/* Spread line */}
      {book.asks[0] && book.bids[0] && (
        <div className="flex items-center gap-2 py-1 px-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground font-mono">
            Spread: ${(book.asks[0].price - book.bids[0].price).toFixed(2)}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      {/* Bids (buy wall) */}
      <div className="space-y-0.5">
        {book.bids.map((level, i) => (
          <div key={`bid-${level.price}-${i}`} className="relative flex justify-between text-xs font-mono px-2 py-0.5 rounded-sm overflow-hidden">
            <div
              className="absolute inset-y-0 right-0 bg-emerald-500/10"
              style={{ width: `${(level.quantity / maxBidQty) * 100}%` }}
            />
            <span className="text-emerald-400 relative z-10">{level.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground relative z-10">{level.quantity.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recent Trades Feed ───────────────────────────────────────────────────────
function RecentTrades({ symbol }: { symbol: TradingSymbol }) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Initial fetch
    fetch(`/api/market/trades/${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((data) => setTrades(data.slice(0, 30)));
  }, [symbol]);

  useEffect(() => {
    return subscribe(`trades:${symbol}`, (trade) => {
      setTrades((prev) => [trade as Trade, ...prev].slice(0, 30));
    });
  }, [symbol]);

  return (
    <div className="space-y-0.5 overflow-hidden">
      <AnimatePresence initial={false}>
        {trades.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-between text-xs font-mono px-2 py-0.5"
          >
            <span className={t.buyUserId === "MARKET_MAKER" ? "text-red-400" : "text-emerald-400"}>
              ${t.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-muted-foreground">{t.quantity.toFixed(4)}</span>
            <span className="text-muted-foreground/60">{new Date(t.createdAt).toLocaleTimeString()}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Order Form ───────────────────────────────────────────────────────────────
function OrderForm({ symbol, balances }: { symbol: TradingSymbol; balances: Balances | null }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const ticker = useChannel<TickerData>(`ticker:${symbol}`);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [base, quote] = symbol.split("/") as [string, string];

  useEffect(() => {
    if (ticker && !price) setPrice(ticker.price.toFixed(2));
  }, [ticker?.price]);

  const total = parseFloat(price || "0") * parseFloat(qty || "0");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(""); setSuccess(""); setLoading(true);
    try {
      const body: any = { symbol, side, type, quantity: parseFloat(qty) };
      if (type === "limit") body.price = parseFloat(price);
      const res = await api.post<{ order: Order; balances: Balances }>("/api/orders", body);
      setSuccess(`Order placed — ${res.order.status}`);
      setQty("");
      qc.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
      qc.invalidateQueries({ queryKey: ["/api/orders"] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="p-4 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Sign in to trade</p>
        <Link href="/auth"><Button size="sm" className="w-full">Sign In</Button></Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="p-3 space-y-3">
      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2 gap-1.5">
        <button type="button" onClick={() => setSide("buy")}
          className={`py-1.5 rounded text-sm font-semibold transition-colors ${side === "buy" ? "bg-emerald-600 text-white" : "bg-card text-muted-foreground hover:text-white border border-border"}`}>
          Buy {base}
        </button>
        <button type="button" onClick={() => setSide("sell")}
          className={`py-1.5 rounded text-sm font-semibold transition-colors ${side === "sell" ? "bg-red-600 text-white" : "bg-card text-muted-foreground hover:text-white border border-border"}`}>
          Sell {base}
        </button>
      </div>

      {/* Order type */}
      <div className="flex gap-1">
        {(["limit", "market"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={`flex-1 py-1 text-xs rounded capitalize transition-colors ${type === t ? "bg-primary/20 text-primary border border-primary/40" : "text-muted-foreground hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {type === "limit" && (
        <div className="space-y-1">
          <Label className="text-xs">Price (USD)</Label>
          <Input
            type="number" min="0" step="any" value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={ticker ? ticker.price.toFixed(2) : "0.00"}
            className="h-8 text-sm font-mono"
            required
          />
        </div>
      )}

      <div className="space-y-1">
        <div className="flex justify-between">
          <Label className="text-xs">Amount ({base})</Label>
          {balances && (
            <span className="text-xs text-muted-foreground">
              Avail: {side === "buy"
                ? `$${(balances.USD ?? 0).toFixed(2)}`
                : `${(balances[base as keyof Balances] ?? 0).toFixed(6)} ${base}`}
            </span>
          )}
        </div>
        <Input
          type="number" min="0" step="any" value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0.0000"
          className="h-8 text-sm font-mono"
          required
        />
      </div>

      {type === "limit" && qty && price && (
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Total</span>
          <span className="font-mono text-white">${total.toFixed(2)}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
          <AlertCircle className="h-3 w-3 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1.5">
          ✓ {success}
        </div>
      )}

      <Button type="submit" className={`w-full ${side === "buy" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"} text-white`}
        disabled={loading}>
        {loading ? "Placing…" : `${side === "buy" ? "Buy" : "Sell"} ${base}`}
      </Button>
    </form>
  );
}

// ─── Open Orders Panel ────────────────────────────────────────────────────────
function OpenOrders({ symbol }: { symbol: TradingSymbol }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: orders, refetch } = useQuery<Order[]>({
    queryKey: ["/api/orders/open"],
    queryFn: () => fetch("/api/orders/open", { credentials: "include" }).then((r) => r.json()),
    enabled: !!user,
    refetchInterval: 3000,
  });

  async function cancel(id: string) {
    try {
      await api.delete(`/api/orders/${id}`);
      refetch();
      qc.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
    } catch {}
  }

  const filtered = orders?.filter((o) => o.symbol === symbol) ?? [];

  return (
    <div>
      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No open orders for {symbol}</p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-1.5 pl-2">Side</th>
              <th className="text-right py-1.5">Price</th>
              <th className="text-right py-1.5">Qty</th>
              <th className="text-right py-1.5 pr-2">Filled</th>
              <th className="py-1.5 pr-1" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-border/30 hover:bg-white/[0.02]">
                <td className="py-1.5 pl-2">
                  <span className={`font-semibold ${o.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>
                    {o.side.toUpperCase()}
                  </span>
                </td>
                <td className="py-1.5 text-right font-mono">
                  {o.type === "market" ? "MKT" : `$${o.price.toLocaleString()}`}
                </td>
                <td className="py-1.5 text-right font-mono">{o.quantity.toFixed(4)}</td>
                <td className="py-1.5 text-right font-mono pr-2">{o.filledQty.toFixed(4)}</td>
                <td className="py-1.5 pr-1 text-right">
                  <button onClick={() => cancel(o.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Main Trading Page ────────────────────────────────────────────────────────
export default function Trading() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialSymbol = (params.get("symbol") || "BTC/USD") as TradingSymbol;
  const [symbol, setSymbol] = useState<TradingSymbol>(
    SYMBOLS.includes(initialSymbol) ? initialSymbol : "BTC/USD"
  );
  const ticker = useChannel<TickerData>(`ticker:${symbol}`);
  const priceHistory = usePriceHistory(symbol);
  const { user } = useAuth();

  const { data: balances } = useQuery<Balances>({
    queryKey: ["/api/wallet/balances"],
    queryFn: () => fetch("/api/wallet/balances", { credentials: "include" }).then((r) => r.json()),
    enabled: !!user,
    refetchInterval: 5000,
  });

  const allTickers = useChannel<TickerData[]>("tickers");
  const qc = useQueryClient();

  // Authenticate WebSocket with userId
  useEffect(() => {
    if (user) {
      import("@/hooks/useExchangeWS").then(({ sendWS }) => {
        sendWS({ type: "auth", userId: user.id });
      });
    }
  }, [user?.id]);

  // Listen for balance updates over WS
  useEffect(() => {
    if (!user) return;
    return subscribe("balance_update", () => {
      qc.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
    });
  }, [user?.id]);

  const isUp = ticker ? ticker.changePercent24h >= 0 : true;

  return (
    <div className="animate-in fade-in flex flex-col gap-3 h-full">
      {/* Symbol selector + Ticker bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={symbol} onValueChange={(v) => setSymbol(v as TradingSymbol)}>
          <SelectTrigger className="w-36 font-mono font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SYMBOLS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        {ticker && (
          <div className="flex items-center gap-4 flex-wrap">
            <span className={`text-2xl font-mono font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              ${ticker.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-mono ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              {isUp ? "+" : ""}{ticker.changePercent24h.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground font-mono hidden md:block">
              H: ${ticker.high24h.toLocaleString()} · L: ${ticker.low24h.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground font-mono hidden md:block">
              Vol: {ticker.volume24h.toFixed(2)}
            </span>
          </div>
        )}

        {/* Other symbols quick ticker */}
        <div className="ml-auto flex gap-2">
          {allTickers?.filter((t) => t.symbol !== symbol).map((t) => (
            <button
              key={t.symbol}
              onClick={() => setSymbol(t.symbol)}
              className="hidden lg:flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border border-border hover:border-blue-500/40 transition-colors"
            >
              <span className="text-muted-foreground">{t.symbol.split("/")[0]}</span>
              <span className={t.changePercent24h >= 0 ? "text-emerald-400" : "text-red-400"}>
                ${t.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main trading layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-3">
        {/* Chart + Order form */}
        <div className="flex flex-col gap-3">
          {/* Price chart */}
          <Card className="glass-panel border-border">
            <CardContent className="p-3">
              <div className="h-48">
                {priceHistory.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="t" hide />
                      <YAxis
                        domain={["auto", "auto"]}
                        width={70}
                        tickFormatter={(v) => `$${v.toLocaleString()}`}
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "6px", fontSize: "12px" }}
                        formatter={(v: any) => [`$${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, "Price"]}
                      />
                      <Area
                        type="monotone" dataKey="p"
                        stroke={isUp ? "#10b981" : "#ef4444"}
                        strokeWidth={1.5}
                        fill="url(#priceGrad)"
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 animate-pulse" />
                      Collecting price data…
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Open orders + history */}
          <Card className="glass-panel border-border">
            <Tabs defaultValue="open">
              <div className="px-3 pt-3">
                <TabsList className="h-7 text-xs">
                  <TabsTrigger value="open" className="text-xs">Open Orders</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">Trade History</TabsTrigger>
                </TabsList>
              </div>
              <CardContent className="p-2 pt-2">
                <TabsContent value="open"><OpenOrders symbol={symbol} /></TabsContent>
                <TabsContent value="history">
                  {user ? (
                    <UserTradeHistory userId={user.id} symbol={symbol} />
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">Sign in to see your trades</p>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Order Book */}
        <Card className="glass-panel border-border overflow-hidden">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal uppercase tracking-wider">Order Book</CardTitle>
            <div className="flex justify-between text-xs text-muted-foreground px-2">
              <span>Price (USD)</span>
              <span>Qty ({symbol.split("/")[0]})</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[480px] overflow-y-auto">
            <OrderBook symbol={symbol} />
          </CardContent>
        </Card>

        {/* Order form + Recent trades */}
        <div className="flex flex-col gap-3">
          <Card className="glass-panel border-border">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-xs text-muted-foreground font-normal uppercase tracking-wider">Place Order</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <OrderForm symbol={symbol} balances={balances ?? null} />
            </CardContent>
          </Card>

          <Card className="glass-panel border-border overflow-hidden">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs text-muted-foreground font-normal uppercase tracking-wider">Recent Trades</CardTitle>
              <div className="flex justify-between text-xs text-muted-foreground px-2">
                <span>Price</span>
                <span>Qty</span>
                <span>Time</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[300px] overflow-y-auto">
              <RecentTrades symbol={symbol} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function UserTradeHistory({ userId, symbol }: { userId: string; symbol: TradingSymbol }) {
  const { data: trades } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
    queryFn: () => fetch("/api/trades", { credentials: "include" }).then((r) => r.json()),
    refetchInterval: 5000,
  });

  const filtered = trades?.filter((t) => t.symbol === symbol) ?? [];

  if (filtered.length === 0) return <p className="text-xs text-muted-foreground text-center py-4">No trades for {symbol}</p>;

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th className="text-left py-1.5 pl-2">Side</th>
          <th className="text-right py-1.5">Price</th>
          <th className="text-right py-1.5 pr-2">Qty</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((t) => {
          const isBuy = t.buyUserId === userId;
          return (
            <tr key={t.id} className="border-b border-border/30">
              <td className="py-1.5 pl-2">
                <span className={`font-semibold ${isBuy ? "text-emerald-400" : "text-red-400"}`}>
                  {isBuy ? "BUY" : "SELL"}
                </span>
              </td>
              <td className="py-1.5 text-right font-mono">${t.price.toLocaleString()}</td>
              <td className="py-1.5 text-right font-mono pr-2">{t.quantity.toFixed(4)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
