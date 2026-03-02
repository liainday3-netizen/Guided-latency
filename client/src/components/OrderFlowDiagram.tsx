import { motion } from "framer-motion";
import { ArrowRight, Database, Server, Smartphone, Zap } from "lucide-react";

export function OrderFlowDiagram() {
  return (
    <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10 opacity-50" />
      
      <h3 className="text-lg font-mono font-bold mb-8 flex items-center gap-2 relative z-10">
        <Zap className="h-5 w-5 text-primary" />
        Order Execution Flow
      </h3>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Client */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full border border-border bg-card flex items-center justify-center relative shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Smartphone className="h-6 w-6 text-foreground" />
            <motion.div
              className="absolute inset-0 border border-primary rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-xs font-mono font-medium">Client API</span>
        </div>

        {/* Network Hop */}
        <div className="flex-1 w-full md:w-auto h-px md:h-0 border-t border-dashed border-primary/50 relative flex items-center justify-center">
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <span className="absolute -top-6 text-[10px] text-muted-foreground font-mono bg-background px-2">WebSockets/FIX</span>
        </div>

        {/* Gateway */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-lg border border-border bg-card flex items-center justify-center relative">
            <Server className="h-6 w-6 text-blue-400" />
          </div>
          <span className="text-xs font-mono font-medium text-center">API Gateway<br/><span className="text-[10px] text-muted-foreground">Rate Limiting</span></span>
        </div>

        {/* Network Hop */}
        <div className="flex-1 w-full md:w-auto h-px md:h-0 border-t border-dashed border-blue-500/50 relative flex items-center justify-center">
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear", delay: 0.5 }}
          />
        </div>

        {/* Matching Engine */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-lg border-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Cpu className="h-8 w-8 text-emerald-400" />
            <motion.div
              className="absolute inset-0 border border-emerald-400 rounded-lg"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          <span className="text-xs font-mono font-medium text-center text-emerald-400">Matching Engine<br/><span className="text-[10px]">&lt; 50µs Latency</span></span>
        </div>

        {/* Network Hop */}
        <div className="flex-1 w-full md:w-auto h-px md:h-0 border-t border-dashed border-purple-500/50 relative flex items-center justify-center">
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 1 }}
          />
          <span className="absolute -top-6 text-[10px] text-muted-foreground font-mono bg-background px-2">Kafka/Redis</span>
        </div>

        {/* Database */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-lg border border-border bg-card flex items-center justify-center relative">
            <Database className="h-6 w-6 text-purple-400" />
          </div>
          <span className="text-xs font-mono font-medium text-center">Post Trade<br/><span className="text-[10px] text-muted-foreground">Persistence</span></span>
        </div>
      </div>
    </div>
  );
}

// Importing Cpu here to fix the missing import
import { Cpu } from "lucide-react";