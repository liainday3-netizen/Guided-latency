import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Box, Code2, Database, Network, ShieldAlert, Zap } from "lucide-react";

export default function Architecture() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-8 pb-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Core Architecture Components</h1>
        <p className="text-lg text-muted-foreground">
          A high-performance crypto exchange is typically composed of tightly coupled but independently scalable microservices.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="glass-panel p-6 rounded-xl border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold font-mono">1. The Matching Engine</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            The heart of the exchange. It maintains the Limit Order Book (LOB) and matches incoming buy and sell orders.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" /> <strong>In-Memory:</strong> Operates entirely in RAM to avoid disk I/O.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" /> <strong>Single-Threaded:</strong> Often single-threaded per trading pair to avoid locking overhead.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" /> <strong>Deterministic:</strong> Produces exactly the same output given the same input sequence.</li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Network className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold font-mono">2. API Gateways & Connectivity</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Handles incoming client connections, rate limiting, and protocol translation.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> <strong>FIX Protocol:</strong> Industry standard for institutional algorithmic trading.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> <strong>WebSockets:</strong> For real-time market data streaming to retail clients.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" /> <strong>REST:</strong> For account management and lower-frequency polling.</li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Database className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold font-mono">3. Market Data Distribution</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Broadcasts the state of the order book and recent trades to thousands of connected clients.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5" /> <strong>Multicast:</strong> UDP multicast within the datacenter for internal components.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5" /> <strong>Fan-out Architecture:</strong> Trees of distribution nodes to handle massive concurrency.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5" /> <strong>Snapshot + Delta:</strong> Clients receive an initial snapshot, then apply delta updates.</li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold font-mono">4. Risk Engine (Pre-Trade)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Validates every order before it hits the matching engine to prevent cascading failures or margin breaches.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" /> <strong>Balance Checks:</strong> Ensures sufficient funds exist.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" /> <strong>Margin Calculation:</strong> Real-time cross-margin calculations for derivatives.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" /> <strong>Fat-Finger Checks:</strong> Prevents orders too far from the mark price.</li>
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          Technical Deep Dives
        </h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-border">
            <AccordionTrigger className="hover:no-underline hover:text-primary">
              <span className="font-mono">Sequencer / Message Bus Architecture</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              <p className="mb-4">
                In modern trading systems, an event-sourced architecture is paramount. All incoming requests are funneled through a highly available sequencer (often based on Raft or Paxos consensus, or specialized buses like Aeron) which assigns a globally ordered sequence number.
              </p>
              <div className="bg-card p-4 rounded-md font-mono text-xs border border-border">
                [Client Order] -&gt; [Gateway] -&gt; [Sequencer: Seq# 1042] -&gt; [Risk Engine] -&gt; [Matching Engine] -&gt; [Market Data]
              </div>
              <p className="mt-4">
                This guarantees that if a component fails, it can rebuild its exact state by replaying the sequence from a known snapshot.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-border">
            <AccordionTrigger className="hover:no-underline hover:text-primary">
              <span className="font-mono">In-Memory Order Book Data Structures</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              The Limit Order Book is typically implemented using a combination of a Hash Map (for fast order cancellation by ID in O(1) time) and a Red-Black Tree or Skip List (to maintain price-time priority in O(log N) time). Extremely low-latency systems may use pre-allocated arrays where the index represents the price level to achieve O(1) matching for dense books.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-border">
            <AccordionTrigger className="hover:no-underline hover:text-primary">
              <span className="font-mono">Crypto-Specific: Hot Wallets & On-Chain Settlement</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              Unlike traditional equities, crypto exchanges must interact with decentralized networks. The architecture splits into off-chain (the matching engine, acting as an internal ledger) and on-chain (deposits/withdrawals). High-security setups use MPC (Multi-Party Computation) or threshold signatures for hot wallets, ensuring that no single node holds the complete private key required to authorize a blockchain transaction.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}