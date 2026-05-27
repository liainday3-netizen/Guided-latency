import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Box, Code2, Database, Network, ShieldAlert, Zap, KeyRound, Search, FileSignature } from "lucide-react";

export default function Architecture() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-8 pb-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Core Architecture Components</h1>
        <p className="text-lg text-muted-foreground">
          A high-performance crypto exchange is typically composed of tightly coupled but independently scalable microservices, designed with extreme trust and verification in mind.
        </p>
      </header>

      {/* Trust & Transparency Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
         <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400 shrink-0 relative z-10">
            <ShieldAlert className="h-6 w-6" />
         </div>
         <div className="relative z-10">
           <h3 className="text-lg font-bold text-emerald-400 font-mono mb-1">Architecture for Trust</h3>
           <p className="text-sm text-muted-foreground">
             Modern exchanges must prove solvency cryptographically. This architecture integrates <strong>Proof of Reserves (PoR)</strong> mechanisms natively, ensuring every user balance corresponds 1:1 with an on-chain asset verifiable by the public.
           </p>
         </div>
      </div>

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

        <div className="glass-panel p-6 rounded-xl border border-border/50 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold font-mono">3. Auditing & Ledger</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 relative z-10">
            The source of truth for user balances, designed immutably so that no trade can alter balances without a cryptographically signed instruction.
          </p>
          <ul className="space-y-2 text-sm relative z-10">
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" /> <strong>Merkle Trees:</strong> User balances are structured in Merkle trees to allow users to verify their inclusion in the global state independently.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" /> <strong>Append-Only:</strong> State transitions are strictly append-only, preventing retroactive alteration of trade history.</li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-border/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold font-mono">4. Risk Engine (Pre-Trade)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 relative z-10">
            Validates every order before it hits the matching engine to prevent cascading failures or margin breaches.
          </p>
          <ul className="space-y-2 text-sm relative z-10">
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" /> <strong>Balance Checks:</strong> Ensures sufficient funds exist.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" /> <strong>Margin Calculation:</strong> Real-time cross-margin calculations for derivatives.</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" /> <strong>Fat-Finger Checks:</strong> Prevents orders too far from the mark price.</li>
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileSignature className="h-5 w-5 text-primary" />
          Verifiable Trust Deep Dives
        </h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-border">
            <AccordionTrigger className="hover:no-underline hover:text-primary">
              <span className="font-mono">ZK-Proofs for Privacy-Preserving Solvency</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              <p className="mb-4">
                Instead of publishing a list of all user balances (which compromises privacy), the architecture uses Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs).
              </p>
              <div className="bg-card p-4 rounded-md font-mono text-xs border border-border">
                [Total Liabilities] == [Total Assets On-Chain]
              </div>
              <p className="mt-4">
                The exchange generates a cryptographic proof that the sum of all liabilities in the database matches the assets held in the cold/hot wallets, without revealing any individual user's balance.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-border">
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
          <AccordionItem value="item-3" className="border-border">
            <AccordionTrigger className="hover:no-underline hover:text-primary">
              <span className="font-mono">In-Memory Order Book Data Structures</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              The Limit Order Book is typically implemented using a combination of a Hash Map (for fast order cancellation by ID in O(1) time) and a Red-Black Tree or Skip List (to maintain price-time priority in O(log N) time). Extremely low-latency systems may use pre-allocated arrays where the index represents the price level to achieve O(1) matching for dense books.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}