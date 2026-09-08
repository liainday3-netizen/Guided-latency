import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth() {
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, mode: "login" | "register") {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const username = fd.get("username") as string;
    const password = fd.get("password") as string;
    try {
      if (mode === "login") await login(username, password);
      else await register(username, password);
      setLocation("/trade");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <Zap className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">NexTrade Exchange</h1>
            <p className="text-xs text-muted-foreground">Institutional-grade matching engine</p>
          </div>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          {["login", "register"].map((mode) => (
            <TabsContent key={mode} value={mode}>
              <Card className="glass-panel border-border">
                <CardHeader>
                  <CardTitle className="text-white">
                    {mode === "login" ? "Welcome back" : "Get started"}
                  </CardTitle>
                  <CardDescription>
                    {mode === "login"
                      ? "Sign in to access your trading account"
                      : "Create a free account — $10,000 demo balance included"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, mode as "login" | "register")} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`${mode}-username`}>Username</Label>
                      <Input
                        id={`${mode}-username`}
                        name="username"
                        placeholder="trader_pro"
                        required
                        minLength={3}
                        autoComplete="username"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${mode}-password`}>Password</Label>
                      <Input
                        id={`${mode}-password`}
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                      />
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
                    </Button>
                  </form>

                  {mode === "register" && (
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Your account starts with <span className="text-emerald-400 font-semibold">$10,000 USD</span>, 0.1 BTC, 1.5 ETH, and 20 SOL for demo trading.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
}
