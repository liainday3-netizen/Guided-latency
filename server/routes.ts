import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { randomUUID } from "crypto";
import passport from "passport";
import { setupAuth, requireAuth } from "./auth";
import { storage, hashPassword } from "./storage";
import { matchingEngine } from "./engine/matchingEngine";
import { marketSimulator } from "./engine/marketSimulator";
import type { TradingSymbol, Order } from "@shared/schema";
import {
  insertUserSchema,
  placeOrderSchema,
  depositSchema,
  withdrawSchema,
  SYMBOLS,
} from "@shared/schema";
import { z } from "zod";

// ─── WebSocket client registry ────────────────────────────────────────────────
interface WSClient {
  ws: WebSocket;
  userId?: string;
  subs: Set<string>;
}
const clients = new Map<string, WSClient>();

function broadcast(channel: string, data: unknown) {
  const msg = JSON.stringify({ type: channel, data });
  for (const c of clients.values()) {
    if (c.subs.has(channel) && c.ws.readyState === 1) c.ws.send(msg);
  }
}

function sendToUser(userId: string, type: string, data: unknown) {
  const msg = JSON.stringify({ type, data });
  for (const c of clients.values()) {
    if (c.userId === userId && c.ws.readyState === 1) c.ws.send(msg);
  }
}

// ─── Route registration ───────────────────────────────────────────────────────
export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);
  marketSimulator.start();

  // Wire matching engine events → WebSocket broadcasts
  matchingEngine.onTradeExecution((trade) => {
    broadcast(`trades:${trade.symbol}`, trade);
    broadcast(`orderbook:${trade.symbol}`, matchingEngine.getOrderBook(trade.symbol as TradingSymbol));
  });

  matchingEngine.onOrderUpdated((order) => {
    if (order.userId === "MARKET_MAKER") return;
    sendToUser(order.userId, "order_update", order);
    sendToUser(order.userId, "balance_update", storage.getBalances(order.userId));
  });

  marketSimulator.onTickerUpdate((ticker) => {
    broadcast(`ticker:${ticker.symbol}`, ticker);
    broadcast("tickers", marketSimulator.getAllTickers());
  });

  // ─── WebSocket ──────────────────────────────────────────────────
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    const id = randomUUID();
    clients.set(id, { ws, subs: new Set() });

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const client = clients.get(id)!;

        if (msg.type === "subscribe") {
          client.subs.add(msg.channel);
          // Send snapshot immediately on subscribe
          if (msg.channel.startsWith("orderbook:")) {
            const sym = msg.channel.replace("orderbook:", "") as TradingSymbol;
            ws.send(JSON.stringify({ type: msg.channel, data: matchingEngine.getOrderBook(sym) }));
          }
          if (msg.channel.startsWith("ticker:")) {
            const sym = msg.channel.replace("ticker:", "") as TradingSymbol;
            ws.send(JSON.stringify({ type: msg.channel, data: marketSimulator.getTicker(sym) }));
          }
          if (msg.channel.startsWith("trades:")) {
            const sym = msg.channel.replace("trades:", "") as TradingSymbol;
            ws.send(JSON.stringify({ type: msg.channel, data: storage.getTradesBySymbol(sym) }));
          }
          if (msg.channel === "tickers") {
            ws.send(JSON.stringify({ type: "tickers", data: marketSimulator.getAllTickers() }));
          }
        }
        if (msg.type === "unsubscribe") client.subs.delete(msg.channel);
        if (msg.type === "auth" && msg.userId) client.userId = msg.userId;
      } catch {}
    });

    ws.on("close", () => clients.delete(id));
  });

  // ─── Auth ───────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(400).json({ message: "Username already taken" });

      const user = await storage.createUser({ username, password: await hashPassword(password) });
      req.login({ id: user.id, username: user.username, createdAt: user.createdAt }, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after registration" });
        res.json({ id: user.id, username: user.username, createdAt: user.createdAt });
      });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout(() => res.json({ ok: true }));
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });

  // ─── Market Data ────────────────────────────────────────────────
  app.get("/api/market/tickers", (_req, res) => {
    res.json(marketSimulator.getAllTickers());
  });

  app.get("/api/market/ticker/:symbol", (req, res) => {
    const sym = decodeURIComponent(req.params.symbol) as TradingSymbol;
    if (!SYMBOLS.includes(sym)) return res.status(400).json({ message: "Invalid symbol" });
    res.json(marketSimulator.getTicker(sym));
  });

  app.get("/api/market/orderbook/:symbol", (req, res) => {
    const sym = decodeURIComponent(req.params.symbol) as TradingSymbol;
    if (!SYMBOLS.includes(sym)) return res.status(400).json({ message: "Invalid symbol" });
    res.json(matchingEngine.getOrderBook(sym));
  });

  app.get("/api/market/trades/:symbol", (req, res) => {
    const sym = decodeURIComponent(req.params.symbol) as TradingSymbol;
    if (!SYMBOLS.includes(sym)) return res.status(400).json({ message: "Invalid symbol" });
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    res.json(storage.getTradesBySymbol(sym, limit));
  });

  // ─── Orders ─────────────────────────────────────────────────────
  app.post("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = placeOrderSchema.parse(req.body);
      const userId = req.user!.id;
      const [base, quote] = data.symbol.split("/") as [string, string];
      const balances = storage.getBalances(userId);
      const ticker = marketSimulator.getTicker(data.symbol);

      // Reserve funds before submitting
      if (data.type === "limit") {
        if (!data.price) return res.status(400).json({ message: "Price required for limit orders" });
        if (data.side === "buy") {
          const cost = data.price * data.quantity;
          if (balances.USD < cost) return res.status(400).json({ message: `Insufficient USD (need ${cost.toFixed(2)})` });
          storage.adjustBalance(userId, "USD", -cost);
        } else {
          const avail = balances[base as keyof typeof balances] ?? 0;
          if (avail < data.quantity) return res.status(400).json({ message: `Insufficient ${base} (have ${avail})` });
          storage.adjustBalance(userId, base, -data.quantity);
        }
      } else {
        // Market order — reserve at current price + 2% slippage buffer
        if (data.side === "buy") {
          const cost = ticker.price * data.quantity * 1.02;
          if (balances.USD < cost) return res.status(400).json({ message: `Insufficient USD (need ~${cost.toFixed(2)})` });
          storage.adjustBalance(userId, "USD", -cost);
        } else {
          const avail = balances[base as keyof typeof balances] ?? 0;
          if (avail < data.quantity) return res.status(400).json({ message: `Insufficient ${base}` });
          storage.adjustBalance(userId, base, -data.quantity);
        }
      }

      const now = new Date().toISOString();
      const order: Order = {
        id: randomUUID(),
        userId,
        symbol: data.symbol,
        side: data.side,
        type: data.type,
        price: data.price ?? 0,
        quantity: data.quantity,
        filledQty: 0,
        status: "open",
        createdAt: now,
        updatedAt: now,
      };

      await matchingEngine.submitOrder(order);

      // Refund unused market-order reservation
      if (order.type === "market" && data.side === "buy") {
        const unusedQty = order.quantity - order.filledQty;
        if (unusedQty > 0) {
          storage.adjustBalance(userId, "USD", ticker.price * unusedQty * 1.02);
        }
      }

      res.json({ order, balances: storage.getBalances(userId) });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      console.error(err);
      res.status(500).json({ message: "Order submission failed" });
    }
  });

  app.get("/api/orders", requireAuth, (req: Request, res: Response) => {
    res.json(storage.getOrdersByUser(req.user!.id));
  });

  app.get("/api/orders/open", requireAuth, (req: Request, res: Response) => {
    res.json(storage.getOpenOrders(req.user!.id));
  });

  app.delete("/api/orders/:id", requireAuth, (req: Request, res: Response) => {
    const order = matchingEngine.cancelOrder(req.params.id, req.user!.id);
    if (!order) return res.status(404).json({ message: "Order not found or already closed" });
    res.json({ order, balances: storage.getBalances(req.user!.id) });
  });

  app.get("/api/trades", requireAuth, (req: Request, res: Response) => {
    res.json(storage.getTradesByUser(req.user!.id));
  });

  // ─── Wallet ──────────────────────────────────────────────────────
  app.get("/api/wallet/balances", requireAuth, (req: Request, res: Response) => {
    res.json(storage.getBalances(req.user!.id));
  });

  app.post("/api/wallet/deposit", requireAuth, (req: Request, res: Response) => {
    try {
      const { asset, amount } = depositSchema.parse(req.body);
      storage.adjustBalance(req.user!.id, asset, amount);
      const tx = {
        id: randomUUID(),
        userId: req.user!.id,
        type: "deposit" as const,
        asset,
        amount,
        description: `Deposited ${amount} ${asset}`,
        createdAt: new Date().toISOString(),
      };
      storage.insertTransaction(tx);
      res.json({ balances: storage.getBalances(req.user!.id), transaction: tx });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Deposit failed" });
    }
  });

  app.post("/api/wallet/withdraw", requireAuth, (req: Request, res: Response) => {
    try {
      const { asset, amount } = withdrawSchema.parse(req.body);
      const balances = storage.getBalances(req.user!.id);
      if ((balances[asset as keyof typeof balances] ?? 0) < amount) {
        return res.status(400).json({ message: `Insufficient ${asset} balance` });
      }
      storage.adjustBalance(req.user!.id, asset, -amount);
      const tx = {
        id: randomUUID(),
        userId: req.user!.id,
        type: "withdrawal" as const,
        asset,
        amount,
        description: `Withdrew ${amount} ${asset}`,
        createdAt: new Date().toISOString(),
      };
      storage.insertTransaction(tx);
      res.json({ balances: storage.getBalances(req.user!.id), transaction: tx });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Withdrawal failed" });
    }
  });

  app.get("/api/wallet/transactions", requireAuth, (req: Request, res: Response) => {
    res.json(storage.getTransactionsByUser(req.user!.id));
  });

  return httpServer;
}
