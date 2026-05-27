import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, Layers, Coins, Lock, Network, CornerRightUp } from "lucide-react";
import { motion } from "framer-motion";

export default function OnChainImplementation() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-8 pb-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Capital Allocation & On-Chain Execution</h1>
        <p className="text-lg text-muted-foreground">
          Understanding where to park capital and how the technological stack implements securing, moving, and trading assets natively on the blockchain.
        </p>
      </header>

      {/* Capital Flow Diagram */}
      <div className="glass-panel p-6 rounded-xl border border-border/50 relative overflow-hidden mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 opacity-50" />
        <h2 className="text-xl font-bold font-mono mb-6 relative z-10 flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          The Flow of Capital
        </h2>
        
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 relative z-10">
          {/* Step 1 */}
          <div className="flex-1 glass-panel p-4 rounded-lg border border-primary/20 bg-card">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-sm mb-1">1. User Deposit (L1/L2)</h3>
            <p className="text-xs text-muted-foreground">User sends funds to an exchange-controlled deposit address natively on-chain.</p>
          </div>
          
          <div className="hidden md:flex items-center justify-center text-muted-foreground">
            <CornerRightUp className="h-6 w-6 opacity-50" />
          </div>

          {/* Step 2 */}
          <div className="flex-1 glass-panel p-4 rounded-lg border border-purple-500/20 bg-card">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
              <Network className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-bold text-sm mb-1">2. Sweeping & Hot Wallet</h3>
            <p className="text-xs text-muted-foreground">Funds are swept into an MPC (Multi-Party Computation) hot wallet for active trading liquidity.</p>
          </div>

          <div className="hidden md:flex items-center justify-center text-muted-foreground">
            <CornerRightUp className="h-6 w-6 opacity-50" />
          </div>

          {/* Step 3 */}
          <div className="flex-1 glass-panel p-4 rounded-lg border border-emerald-500/20 bg-card">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
              <Lock className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm mb-1">3. Cold Storage</h3>
            <p className="text-xs text-muted-foreground">95%+ of funds are moved to offline, multi-sig smart contracts for ultimate security.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {/* The Stack & Implementation */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-mono flex items-center gap-2 border-b border-border pb-3">
            <Layers className="h-6 w-6 text-blue-400" />
            On-Chain Tech Stack
          </h2>

          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                Layer 1 (Settlement)
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Ethereum / Bitcoin</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                The ultimate source of truth. It handles the final settlement of funds. Due to block times (12s for Ethereum) and high gas fees, HFT cannot happen natively here.
              </p>
              <div className="text-xs font-mono bg-background/50 p-2 rounded border border-border">
                <span className="text-emerald-400">Implementation:</span> Smart Contracts (Solidity/Vyper) acting as vaults (e.g., Gnosis Safe).
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                Layer 2 (Execution)
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">Rollups / Validiums</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Networks like Arbitrum or custom ZK-Rollups (e.g., StarkEx) process trades off-mainnet and submit cryptographic proofs to L1. This massively reduces latency and fees.
              </p>
              <div className="text-xs font-mono bg-background/50 p-2 rounded border border-border">
                <span className="text-emerald-400">Implementation:</span> Custom Sequencers matching trades in milliseconds before batching.
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                Wallet Infra (Security)
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">MPC / TSS</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Private keys are never held in one piece. Multi-Party Computation (MPC) divides keys into shares distributed across servers to eliminate single points of failure.
              </p>
              <div className="text-xs font-mono bg-background/50 p-2 rounded border border-border">
                <span className="text-emerald-400">Implementation:</span> ECDSA/EdDSA Threshold Signature Schemes.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Strategies */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-mono flex items-center gap-2 border-b border-border pb-3">
            <Shield className="h-6 w-6 text-emerald-400" />
            Where to Allocate Capital
          </h2>

          <Card className="glass-panel border-border/50 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">1. Cold Storage Vaults (Long-Term)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                For capital not actively traded. Managed via multi-signature smart contracts requiring m-of-n hardware wallet approvals (e.g., 3-of-5 geographically distributed executives).
              </p>
              <div className="flex gap-2">
                <Badge className="bg-card text-xs text-muted-foreground border-border">High Security</Badge>
                <Badge className="bg-card text-xs text-muted-foreground border-border">Low Velocity</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">2. MPC Hot Wallets (Active Trading)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Holds the liquidity required for day-to-day user withdrawals and active market making. Kept to a minimum threshold (e.g., 5% of AUM) and replenished dynamically.
              </p>
              <div className="flex gap-2">
                <Badge className="bg-card text-xs text-muted-foreground border-border">API Automated</Badge>
                <Badge className="bg-card text-xs text-muted-foreground border-border">High Velocity</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">3. DeFi Yield Strategies (Working Capital)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Idle assets can be deployed into battle-tested DeFi protocols (like Aave or Compound) via smart contract integrations to generate baseline yield while waiting to be deployed.
              </p>
              <div className="flex gap-2">
                <Badge className="bg-card text-xs text-muted-foreground border-border">Smart Contract Risk</Badge>
                <Badge className="bg-card text-xs text-muted-foreground border-border">Yield Generating</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}