import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface AuthUser {
  id: string;
  username: string;
  createdAt: string;
}

interface AuthContext {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: () =>
      fetch("/api/auth/me", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    retry: false,
    staleTime: 60_000,
  });

  const login = async (username: string, password: string) => {
    await api.post("/api/auth/login", { username, password });
    qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
    qc.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
  };

  const register = async (username: string, password: string) => {
    await api.post("/api/auth/register", { username, password });
    qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
    qc.invalidateQueries({ queryKey: ["/api/wallet/balances"] });
  };

  const logout = async () => {
    await api.post("/api/auth/logout", {});
    qc.clear();
  };

  return (
    <Ctx.Provider value={{ user: user ?? null, isLoading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
