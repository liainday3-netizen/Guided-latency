import { z } from "zod";

// ─── User ────────────────────────────────────────────────────────────────────
export const insertUserSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: string;
  username: string;
  password: string;
  createdAt: string;
};

// ─── Wallet ───────────────────────────────────────────────────────────────────
export type Balances = {
  USD: number;
  BTC: number;
  ETH: number;
  SOL: number;
};

// ─── Market ───────────────────────────────────────────────────────────────────
export const SYMBOLS = ["BTC/USD", "ETH/USD", "SOL/USD"] as const;
export type TradingSymbol = (typeof SYMBOLS)[number];

export const ORDER_SIDES = ["buy", "sell"] as const;
export type OrderSide = (typeof ORDER_SIDES)[number];

export const ORDER_TYPES = ["limit", "market"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const ORDER_STATUSES = ["open", "partial", "filled", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  userId: string;
  symbol: TradingSymbol;
  side: OrderSide;
  type: OrderType;
  price: number; // 0 for market orders
  quantity: number;
  filledQty: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  symbol: TradingSymbol;
  price: number;
  quantity: number;
  buyOrderId: string;
  sellOrderId: string;
  buyUserId: string;
  sellUserId: string;
  createdAt: string;
}

export const TX_TYPES = ["deposit", "withdrawal", "trade_buy", "trade_sell"] as const;
export type TxType = (typeof TX_TYPES)[number];

export interface Transaction {
  id: string;
  userId: string;
  type: TxType;
  asset: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface TickerData {
  symbol: TradingSymbol;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  orderCount: number;
}

export interface OrderBookSnapshot {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

// ─── API Validation Schemas ───────────────────────────────────────────────────
export const placeOrderSchema = z.object({
  symbol: z.enum(SYMBOLS),
  side: z.enum(ORDER_SIDES),
  type: z.enum(ORDER_TYPES),
  price: z.number().positive().optional(),
  quantity: z.number().positive(),
});

export const depositSchema = z.object({
  asset: z.enum(["USD", "BTC", "ETH", "SOL"]),
  amount: z.number().positive(),
});

export const withdrawSchema = z.object({
  asset: z.enum(["USD", "BTC", "ETH", "SOL"]),
  amount: z.number().positive(),
});
