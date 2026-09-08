import type { User, InsertUser, Order, Trade, Transaction, Balances } from "@shared/schema";
import { randomUUID } from "crypto";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBalances(userId: string): Balances;
  adjustBalance(userId: string, asset: string, delta: number): void;
  getOrder(id: string): Order | undefined;
  upsertOrder(order: Order): void;
  getOrdersByUser(userId: string): Order[];
  getOpenOrders(userId: string): Order[];
  insertTrade(trade: Trade): void;
  getTradesBySymbol(symbol: string, limit?: number): Trade[];
  getTradesByUser(userId: string): Trade[];
  insertTransaction(tx: Transaction): void;
  getTransactionsByUser(userId: string): Transaction[];
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private balances = new Map<string, Balances>();
  private orders = new Map<string, Order>();
  private trades: Trade[] = [];
  private transactions: Transaction[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date().toISOString() };
    this.users.set(id, user);
    // Give every new user demo starting balances
    this.balances.set(id, { USD: 10000, BTC: 0.1, ETH: 1.5, SOL: 20 });
    return user;
  }

  getBalances(userId: string): Balances {
    return this.balances.get(userId) ?? { USD: 0, BTC: 0, ETH: 0, SOL: 0 };
  }

  adjustBalance(userId: string, asset: string, delta: number): void {
    const bal = { ...this.getBalances(userId) };
    const key = asset as keyof Balances;
    if (key in bal) {
      bal[key] = Math.max(0, (bal[key] ?? 0) + delta);
      this.balances.set(userId, bal);
    }
  }

  getOrder(id: string): Order | undefined {
    return this.orders.get(id);
  }

  upsertOrder(order: Order): void {
    this.orders.set(order.id, { ...order });
  }

  getOrdersByUser(userId: string): Order[] {
    return Array.from(this.orders.values())
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOpenOrders(userId: string): Order[] {
    return this.getOrdersByUser(userId).filter(
      (o) => o.status === "open" || o.status === "partial"
    );
  }

  insertTrade(trade: Trade): void {
    this.trades.push(trade);
    if (this.trades.length > 50000) this.trades.shift();
  }

  getTradesBySymbol(symbol: string, limit = 50): Trade[] {
    return this.trades
      .filter((t) => t.symbol === symbol)
      .slice(-limit)
      .reverse();
  }

  getTradesByUser(userId: string): Trade[] {
    return this.trades
      .filter((t) => t.buyUserId === userId || t.sellUserId === userId)
      .slice(-200)
      .reverse();
  }

  insertTransaction(tx: Transaction): void {
    this.transactions.push(tx);
  }

  getTransactionsByUser(userId: string): Transaction[] {
    return this.transactions
      .filter((t) => t.userId === userId)
      .slice(-200)
      .reverse();
  }
}

export const storage = new MemStorage();
