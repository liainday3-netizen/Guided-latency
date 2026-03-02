import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, LayoutTemplate, Layers, Cpu, Code2, Globe } from "lucide-react";

export default function Technologies() {
  const stack = [
    {
      category: "Core Engine (Ultra-Low Latency)",
      icon: Cpu,
      color: "text-emerald-400",
      technologies: [
        { name: "C++ (17/20)", description: "The industry standard for deterministic latency. Manual memory management avoids garbage collection pauses.", tag: "Primary" },
        { name: "Rust", description: "Gaining traction for memory safety without sacrificing speed.", tag: "Emerging" },
        { name: "FPGAs", description: "Hardware acceleration for parsing network packets and risk checks before software even sees them.", tag: "Extreme" }
      ]
    },
    {
      category: "Messaging & Data Bus",
      icon: Layers,
      color: "text-blue-400",
      technologies: [
        { name: "Aeron / Aeron Cluster", description: "Ultra low-latency IPC and network transport over UDP.", tag: "Primary" },
        { name: "Apache Kafka", description: "High-throughput log for post-trade processing, analytics, and settlement.", tag: "Standard" },
        { name: "ZeroMQ", description: "Brokerless messaging for internal component communication.", tag: "Alternative" }
      ]
    },
    {
      category: "Databases & Persistence",
      icon: Database,
      color: "text-purple-400",
      technologies: [
        { name: "Redis", description: "In-memory datastore for rapid session management and caching.", tag: "Hot" },
        { name: "PostgreSQL", description: "ACID compliant relational database for user accounts and final trade settlement.", tag: "Cold" },
        { name: "ClickHouse / kdb+", description: "Columnar databases for massive historical market data analysis.", tag: "Analytics" }
      ]
    },
    {
      category: "Infrastructure & Orchestration",
      icon: Globe,
      color: "text-orange-400",
      technologies: [
        { name: "Bare Metal Servers", description: "Essential for the matching engine to avoid hypervisor overhead.", tag: "Core" },
        { name: "Kubernetes", description: "Orchestration for stateless auxiliary services (web servers, REST APIs).", tag: "Auxiliary" },
        { name: "AWS / GCP", description: "Used primarily for edge networking, DDoS protection, and backups, rarely for core matching.", tag: "Edge" }
      ]
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-8 pb-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Key Technologies for Low Latency</h1>
        <p className="text-lg text-muted-foreground">
          The technology stack of a modern crypto exchange is bifurcated: absolute lowest latency for the core matching flow, and highly scalable cloud-native tools for the rest.
        </p>
      </header>

      <div className="grid gap-6 mt-8">
        {stack.map((group, idx) => {
          const Icon = group.icon;
          return (
            <Card key={idx} className="glass-panel border-border/50 overflow-hidden">
              <CardHeader className="bg-card/50 border-b border-border/50 py-4">
                <CardTitle className="flex items-center gap-2 text-xl font-mono">
                  <Icon className={`h-6 w-6 ${group.color}`} />
                  {group.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {group.technologies.map((tech, tIdx) => (
                    <div key={tIdx} className="p-4 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-white/5 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{tech.name}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{tech.description}</p>
                      </div>
                      <Badge variant="outline" className="w-fit font-mono text-xs border-primary/30 text-primary bg-primary/5">
                        {tech.tag}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-12 p-6 glass-panel rounded-xl border border-primary/20 bg-primary/5">
        <h3 className="text-lg font-bold font-mono text-primary flex items-center gap-2 mb-3">
          <Code2 className="h-5 w-5" />
          The "Kernel Bypass" Concept
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          In standard network processing, data packets travel from the NIC (Network Interface Card) into the OS kernel, which triggers an interrupt, copies the data to user space, and wakes up the application. This process takes tens of microseconds. Low-latency systems use technologies like DPDK or Solarflare to map the NIC directly into the application's user-space memory, bypassing the OS kernel entirely and reducing network ingestion latency to under 2 microseconds.
        </p>
      </div>
    </div>
  );
}