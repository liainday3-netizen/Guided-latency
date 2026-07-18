import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Server, Cpu, Database, Network, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Option = {
  id: string;
  title: string;
  description: string;
  icon: any;
  aiInsight: string;
};

type Step = {
  id: string;
  question: string;
  aiPrompt: string;
  options: Option[];
};

const BUILDER_STEPS: Step[] = [
  {
    id: "core-language",
    question: "Select Core Engine Language",
    aiPrompt: "Let's build your exchange. First, we need to choose the language for the core matching engine. This dictates our absolute baseline latency. What is your engineering team's preference?",
    options: [
      { id: "cpp", title: "C++ (17/20)", description: "The industry standard for deterministic latency. Manual memory management.", icon: Cpu, aiInsight: "Excellent choice. C++ provides the deterministic latency required for HFT. We'll utilize template metaprogramming for zero-cost abstractions." },
      { id: "rust", title: "Rust", description: "Memory safety without garbage collection. Gaining heavy traction.", icon: ShieldCheck, aiInsight: "Forward-thinking. Rust's borrow checker will prevent segfaults at compile time while maintaining C-like speeds. We'll use Tokyo for async I/O." },
      { id: "go", title: "Go (Golang)", description: "Great concurrency, but has Garbage Collection pauses. Good for mid-frequency.", icon: Server, aiInsight: "Go selected. We'll need to aggressively tune the Garbage Collector (GOGC) and use sync.Pool to minimize allocations in the hot path." }
    ]
  },
  {
    id: "messaging",
    question: "Select Inter-Process Communication",
    aiPrompt: "Core engine selected. Now, how will our microservices communicate? The matching engine needs to broadcast market data and receive orders instantly.",
    options: [
      { id: "aeron", title: "Aeron Cluster", description: "Ultra-low latency UDP multicast. Lock-free message transport.", icon: Network, aiInsight: "Aeron is the gold standard. We'll configure an active-active cluster using Aeron IPC for microsecond inter-service communication." },
      { id: "kafka", title: "Apache Kafka", description: "High-throughput, persistent event log. Millisecond latency.", icon: Database, aiInsight: "Kafka selected. It's robust for persistence, but we'll bypass it for the direct matching path to avoid disk I/O latency penalties." },
      { id: "zeromq", title: "ZeroMQ", description: "Brokerless messaging queue. Fast and lightweight.", icon: Zap, aiInsight: "ZeroMQ will give us great brokerless speeds. We'll use the PUB/SUB pattern for market data distribution to connected gateways." }
    ]
  },
  {
    id: "deployment",
    question: "Select Deployment Environment",
    aiPrompt: "Messaging layer configured. Finally, where are we deploying the core matching infrastructure? Hardware matters just as much as software.",
    options: [
      { id: "bare-metal", title: "Colocated Bare Metal", description: "Servers physically located next to major liquidity providers. Zero hypervisor overhead.", icon: Server, aiInsight: "Maximum performance unlocked. We'll utilize kernel bypass (DPDK) and pin threads to isolated CPU cores." },
      { id: "aws", title: "AWS Outposts / Dedicated", description: "Cloud convenience with dedicated hardware instances.", icon: Cloud, aiInsight: "Cloud deployment selected. We'll optimize EC2 instances using Elastic Fabric Adapter (EFA) for enhanced network performance." },
      { id: "hybrid", title: "Hybrid Cloud", description: "Core on bare metal, auxiliary services on Kubernetes.", icon: Layers, aiInsight: "Smart balancing. We'll deploy the matching engine on bare metal, while user management and web gateways run flexibly on EKS." }
    ]
  }
];

export default function AIArchitect() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, Option>>({});
  const [isThinking, setIsThinking] = useState(false);
  const [aiMessage, setAiMessage] = useState(BUILDER_STEPS[0].aiPrompt);
  const [isComplete, setIsComplete] = useState(false);

  const handleSelect = (option: Option) => {
    setSelections(prev => ({ ...prev, [BUILDER_STEPS[currentStep].id]: option }));
    setIsThinking(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setAiMessage(option.aiInsight);
      
      setTimeout(() => {
        setIsThinking(false);
        if (currentStep < BUILDER_STEPS.length - 1) {
          setCurrentStep(prev => prev + 1);
          setAiMessage(BUILDER_STEPS[currentStep + 1].aiPrompt);
        } else {
          setIsComplete(true);
          setAiMessage("System architecture compiled successfully. Here is your custom low-latency blueprint.");
        }
      }, 2500); // Time showing the insight before moving to next question
    }, 1000); // Time spent "thinking"
  };

  const resetBuilder = () => {
    setCurrentStep(0);
    setSelections({});
    setIsComplete(false);
    setAiMessage(BUILDER_STEPS[0].aiPrompt);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-8 pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary font-mono mb-2">
          <Sparkles className="mr-1 h-3 w-3" />
          AI System Architect
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Interactive Infra Builder</h1>
        <p className="text-lg text-muted-foreground">
          Let our AI guide you through the critical pivot points of designing your exchange.
        </p>
      </header>

      {/* AI Chat Interface */}
      <div className="glass-panel p-6 rounded-xl border border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/50 relative">
            <Bot className="h-5 w-5 text-primary" />
            {isThinking && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary font-mono">Arch-AI</span>
              {isThinking && <span className="text-xs text-muted-foreground animate-pulse">Analyzing constraints...</span>}
            </div>
            <p className="text-foreground leading-relaxed">
              {aiMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Builder */}
      {!isComplete ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm font-mono text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {BUILDER_STEPS.length}</span>
            <span>{Math.round((currentStep / BUILDER_STEPS.length) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / BUILDER_STEPS.length) * 100} className="h-2 bg-secondary" />

          <h2 className="text-2xl font-bold font-mono mt-8 mb-4">
            {BUILDER_STEPS[currentStep].question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BUILDER_STEPS[currentStep].options.map((option) => {
              const Icon = option.icon;
              const isSelected = selections[BUILDER_STEPS[currentStep].id]?.id === option.id;
              
              return (
                <Card 
                  key={option.id}
                  className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    isSelected 
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-[1.02]' 
                      : 'glass-panel border-border/50 hover:border-primary/50 hover:bg-white/5'
                  } ${isThinking && !isSelected ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => !isThinking && handleSelect(option)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full">
                    <div className={`p-3 rounded-full ${isSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{option.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-primary animate-in zoom-in">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Completion View */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mt-8"
        >
          <div className="glass-panel p-8 rounded-xl border border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full" />
            
            <h2 className="text-2xl font-bold font-mono flex items-center gap-2 mb-6">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              Final System Architecture
            </h2>
            
            <div className="space-y-4">
              {Object.entries(selections).map(([stepId, option], idx) => {
                const step = BUILDER_STEPS.find(s => s.id === stepId);
                const Icon = option.icon;
                return (
                  <div key={stepId} className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50">
                    <div className="p-2 bg-primary/10 rounded-md text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-mono mb-1">{step?.question}</p>
                      <p className="font-bold text-foreground">{option.title}</p>
                    </div>
                    <div className="hidden md:block text-xs text-muted-foreground max-w-xs text-right">
                      {option.aiInsight.split('.')[0]}.
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={resetBuilder}
              className="mt-8 flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-mono"
            >
              <RefreshCw className="h-4 w-4" />
              Reconfigure Architecture
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Importing missed icons
import { Cloud, Zap } from "lucide-react";