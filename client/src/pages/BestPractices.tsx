import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

export default function BestPractices() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-8 pb-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Challenges & Best Practices</h1>
        <p className="text-lg text-muted-foreground">
          Building low-latency infrastructure is as much about what not to do as it is about what to do. Every nanosecond counts.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-mono border-b border-border pb-2 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            Best Practices
          </h2>
          
          <div className="space-y-4">
            <Card className="glass-panel border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-emerald-400 font-mono">Zero Allocation in Hot Path</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Once the system is initialized, avoid allocating new memory dynamically (no `new` or `malloc`). Pre-allocate object pools and reuse them. Memory allocation requires kernel intervention and causes unpredictable latency spikes.
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-emerald-400 font-mono">Thread Pinning & Isolation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Pin critical threads to specific CPU cores and isolate those cores from the OS scheduler. This prevents context switching and ensures the CPU cache remains hot with your application's data.
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-emerald-400 font-mono">Lock-Free Data Structures</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Avoid mutexes and traditional locks. Use atomic operations, memory barriers, and specialized data structures like lock-free ring buffers (e.g., LMAX Disruptor pattern) for inter-thread communication.
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-mono border-b border-border pb-2 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Common Pitfalls
          </h2>
          
          <div className="space-y-4">
            <Card className="glass-panel border-red-500/20 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-red-400 font-mono">Database in the Critical Path</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Never write to a relational database directly during the matching flow. Persistence should happen asynchronously after the order is sequenced and matched. Synchronous DB calls turn microsecond latency into millisecond latency.
              </CardContent>
            </Card>

            <Card className="glass-panel border-red-500/20 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-red-400 font-mono">Garbage Collection</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Languages with stop-the-world garbage collection (Java, Go, C#) require extreme tuning to be viable for the core matching engine. A 10ms GC pause can queue up thousands of orders and cause severe market dislocation.
              </CardContent>
            </Card>

            <Card className="glass-panel border-red-500/20 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-red-400 font-mono">Ignoring Cache Lines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Modern CPUs fetch memory in 64-byte chunks (cache lines). If multiple threads modify independent variables that happen to share a cache line, performance tanks due to "false sharing." Pad data structures to align with cache boundaries.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 rounded-xl border border-primary/20 bg-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          Recommended References
        </h3>
        <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
          <li><strong>The LMAX Architecture:</strong> How to build high performance financial systems.</li>
          <li><strong>Mechanical Sympathy:</strong> Understanding hardware to write better software (Martin Thompson).</li>
          <li><strong>Aeron Documentation:</strong> The standard for efficient reliable UDP unicast, UDP multicast, and IPC message transport.</li>
          <li><strong>FIX Protocol Specifications:</strong> The Financial Information eXchange protocol documentation.</li>
        </ul>
      </div>
    </div>
  );
}