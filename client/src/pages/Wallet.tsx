import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, ArrowUpFromLine, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { api } from "@/lib/api";
import type { Balances, Transaction } from "@shared/schema";
import { motion } from "framer-motion";

const ASSETS = ["USD", "BTC", "ETH", "SOL"] as const;
type Asset = (typeof ASSETS)[number];

const ASSET_STYLES: Record<Asset, { color: string; bg: string; border: string }> = {
  USD: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  BTC: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  ETH: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  SOL: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
};

export default function Wallet() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [asset, setAsset] = useState<Asset>("USD");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: balances, refetch: refetchBalances } = useQuery<Balances>({
    queryKey: ["/api/wallet/balances"],
    queryFn: () => fetch("/api/wallet/balances", { credentials: "include" }).then((r) => r.json()),
    enabled: !!user,
  });

  const { data: txs } = useQuery<Transaction[]>({
    queryKey: ["/api/wallet/transactions"],
    queryFn: () => fetch("/api/wallet/transactions", { credentials: "include" }).then((r) => r.json()),
    enabled: !!user,
  });

  async function handleAction(type: "deposit" | "withdraw") {
    const num = parseFloat(amount);
    if (!num || num <= 0) return setStatus({ type: "err", msg: "Enter a valid positive amount" });
    setLoading(true);
    setStatus(null);
    try {
      await api.post(`/api/wallet/${type}`, { asset, amount: num });
      setStatus({ type: "ok", msg: `${type === "deposit" ? "Deposited" : "Withdrew"} ${num} ${asset} successfully` });
      setAmount("");
      refetchBalances();
      qc.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    } catch (err: any) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Sign in to manage your wallet</p>
        <Link href="/auth"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-muted-foreground text-sm">Deposit and withdraw assets from your trading account</p>
      </div>

      {/* Balances grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ASSETS.map((a) => {
          const s = ASSET_STYLES[a];
          const bal = balances?.[a] ?? 0;
          return (
            <motion.div key={a} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`glass-panel ${s.border} border`}>
                <CardContent className="p-4">
                  <div className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${s.bg} ${s.color} mb-2`}>{a}</div>
                  <p className={`text-xl font-mono font-bold ${s.color}`}>
                    {a === "USD" ? bal.toFixed(2) : bal.toFixed(6)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Deposit / Withdraw */}
      <Card className="glass-panel border-border max-w-md">
        <CardHeader>
          <CardTitle className="text-base text-white">Manage Funds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Asset</Label>
            <Select value={asset} onValueChange={(v) => setAsset(v as Asset)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSETS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {asset !== "USD" && balances && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => setAmount(String(balances[asset as keyof Balances]))}
                >
                  Max
                </Button>
              )}
            </div>
          </div>

          {status && (
            <div className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 ${
              status.type === "ok"
                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                : "text-red-400 bg-red-500/10 border border-red-500/20"
            }`}>
              {status.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {status.msg}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => handleAction("deposit")}
              disabled={loading}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Deposit
            </Button>
            <Button
              className="flex-1 gap-2"
              variant="outline"
              onClick={() => handleAction("withdraw")}
              disabled={loading}
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Withdraw
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            This is a demo exchange. Deposits and withdrawals are simulated — no real funds are involved.
          </p>
        </CardContent>
      </Card>

      {/* Transaction history */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Transaction History</h2>
        {!txs || txs.length === 0 ? (
          <Card className="glass-panel border-border">
            <CardContent className="p-6 text-center text-muted-foreground text-sm">No transactions yet</CardContent>
          </Card>
        ) : (
          <Card className="glass-panel border-border">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-normal">Type</th>
                    <th className="text-left p-3 text-muted-foreground font-normal">Asset</th>
                    <th className="text-right p-3 text-muted-foreground font-normal">Amount</th>
                    <th className="text-right p-3 text-muted-foreground font-normal">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={tx.type === "deposit"
                            ? "text-emerald-400 border-emerald-400/30"
                            : "text-red-400 border-red-400/30"}
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-xs text-white">{tx.asset}</td>
                      <td className="p-3 text-right font-mono text-xs">
                        {tx.type === "deposit" ? "+" : "-"}
                        {tx.asset === "USD" ? tx.amount.toFixed(2) : tx.amount.toFixed(6)}
                      </td>
                      <td className="p-3 text-right text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
