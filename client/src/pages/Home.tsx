import { OrderFlowDiagram } from "@/components/OrderFlowDiagram";
import { LatencyChart } from "@/components/LatencyChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight, BarChart3, Clock, Globe, Shield } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto space-y-8 pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary font-mono mb-2">
          <Activity className="mr-1 h-3 w-3" />
          Live Architecture Overview
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          Designing High-Performance <br/>
          <span className="text-gradient">Crypto Exchange Infrastructure</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
          A definitive guide to building institutional-grade, low-latency trading systems. 
          Explore the architecture, hardware, and software stacks required to process millions of transactions per second with microsecond precision.
        </p>
      </header>

      <section>
        <OrderFlowDiagram />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel border-border/50">
          <CardHeader className="pb-2">
            <Clock className="h-5 w-5 text-emerald-400 mb-2" />
            <CardTitle className="text-lg">Ultra-Low Latency</CardTitle>
            <CardDescription>Microsecond execution times</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Utilizing ring buffers, lock-free data structures, and kernel bypass to achieve deterministic end-to-end latency under 50µs.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="pb-2">
            <Globe className="h-5 w-5 text-blue-400 mb-2" />
            <CardTitle className="text-lg">High Throughput</CardTitle>
            <CardDescription>Millions of TPS</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Horizontally scalable architectures using partitioned order books and robust message buses like Kafka and Aeron.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border/50">
          <CardHeader className="pb-2">
            <Shield className="h-5 w-5 text-purple-400 mb-2" />
            <CardTitle className="text-lg">Fault Tolerance</CardTitle>
            <CardDescription>Zero downtime deployments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Active-active clustering, event sourcing, and rapid state reconstruction for institutional reliability.
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6 mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Latency Benchmarks During Volatility
          </h2>
        </div>
        
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-muted-foreground font-normal">End-to-End Trade Execution Latency (99th Percentile)</CardTitle>
          </CardHeader>
          <CardContent>
            <LatencyChart />
            <div className="mt-4 flex gap-4 text-xs font-mono text-muted-foreground justify-center">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Legacy (Standard Web Stack)</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Optimized (C++/Rust, Kernel Bypass)</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Hardware (FPGA/ASIC)</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap gap-4 pt-4">
        <Link href="/architecture">
          <div className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            Explore Architecture Components
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
        <Link href="/technologies">
          <div className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer border border-border">
            View Technology Stack
          </div>
        </Link>
      </div>
    </div>
  );
}