import { randomUUID } from "crypto";
import type { Order, Trade, TradingSymbol } from "@shared/schema";
import { SYMBOLS } from "@shared/schema";
import { storage } from "../storage";

type TradeCallback = (trade: Trade) => void;
type OrderCallback = (order: Order) => void;

interface PriceLevel {
  orders: Order[];
}

interface OrderBook {
  bids: Map<number, Order[]>; // buy orders, highest first
  asks: Map<number, Order[]>; // sell orders, lowest first
}

class MatchingEngine {
  private books = new Map<TradingSymbol, OrderBook>();
  private tradeCallbacks: TradeCallback[] = [];
  private orderCallbacks: OrderCallback[] = [];

  constructor() {
    for (const sym of SYMBOLS) {
      this.books.set(sym, { bids: new Map(), asks: new Map() });
    }
  }

  onTradeExecution(cb: TradeCallback) {
    this.tradeCallbacks.push(cb);
  }

  onOrderUpdated(cb: OrderCallback) {
    this.orderCallbacks.push(cb);
  }

  getOrderBook(symbol: TradingSymbol) {
    const book = this.books.get(symbol)!;
    const bids = Array.from(book.bids.entries())
      .sort((a, b) => b[0] - a[0])
      .slice(0, 20)
      .map(([price, orders]) => ({
        price,
        quantity: orders.reduce((s, o) => s + (o.quantity - o.filledQty), 0),
        orderCount: orders.length,
      }));
    const asks = Array.from(book.asks.entries())
      .sort((a, b) => a[0] - b[0])
      .slice(0, 20)
      .map(([price, orders]) => ({
        price,
        quantity: orders.reduce((s, o) => s + (o.quantity - o.filledQty), 0),
        orderCount: orders.length,
      }));
    return { bids, asks };
  }

  getBestBid(symbol: TradingSymbol): number | null {
    const book = this.books.get(symbol)!;
    const prices = Array.from(book.bids.keys());
    return prices.length ? Math.max(...prices) : null;
  }

  getBestAsk(symbol: TradingSymbol): number | null {
    const book = this.books.get(symbol)!;
    const prices = Array.from(book.asks.keys());
    return prices.length ? Math.min(...prices) : null;
  }

  async submitOrder(order: Order): Promise<Trade[]> {
    const trades: Trade[] = [];

    if (order.type === "market") {
      await this.matchMarket(order, trades);
    } else {
      await this.matchLimit(order, trades);
    }

    storage.upsertOrder(order);

    for (const trade of trades) {
      storage.insertTrade(trade);
      for (const cb of this.tradeCallbacks) cb(trade);
    }

    for (const cb of this.orderCallbacks) cb(order);
    return trades;
  }

  private async matchLimit(order: Order, trades: Trade[]) {
    const book = this.books.get(order.symbol)!;
    const opposite = order.side === "buy" ? book.asks : book.bids;

    const sorted = Array.from(opposite.keys()).sort((a, b) =>
      order.side === "buy" ? a - b : b - a
    );

    for (const price of sorted) {
      if (order.filledQty >= order.quantity) break;
      if (order.side === "buy" && price > order.price) break;
      if (order.side === "sell" && price < order.price) break;

      const resting = opposite.get(price)!;
      this.fillAgainst(order, resting, price, trades);
      if (resting.length === 0) opposite.delete(price);
    }

    // Rest unfilled portion on book
    if (order.filledQty < order.quantity) {
      const side = order.side === "buy" ? book.bids : book.asks;
      if (!side.has(order.price)) side.set(order.price, []);
      side.get(order.price)!.push(order);
      order.status = order.filledQty > 0 ? "partial" : "open";
    }
  }

  private async matchMarket(order: Order, trades: Trade[]) {
    const book = this.books.get(order.symbol)!;
    const opposite = order.side === "buy" ? book.asks : book.bids;

    const sorted = Array.from(opposite.keys()).sort((a, b) =>
      order.side === "buy" ? a - b : b - a
    );

    for (const price of sorted) {
      if (order.filledQty >= order.quantity) break;
      const resting = opposite.get(price)!;
      this.fillAgainst(order, resting, price, trades);
      if (resting.length === 0) opposite.delete(price);
    }

    if (order.filledQty < order.quantity) {
      order.status = order.filledQty > 0 ? "partial" : "cancelled";
    }
  }

  private fillAgainst(taker: Order, resting: Order[], price: number, trades: Trade[]) {
    let i = 0;
    const now = new Date().toISOString();

    while (i < resting.length && taker.filledQty < taker.quantity) {
      const maker = resting[i];
      const fillQty = Math.min(
        taker.quantity - taker.filledQty,
        maker.quantity - maker.filledQty
      );

      taker.filledQty += fillQty;
      maker.filledQty += fillQty;
      taker.updatedAt = now;
      maker.updatedAt = now;

      if (maker.filledQty >= maker.quantity) {
        maker.status = "filled";
        resting.splice(i, 1);
      } else {
        maker.status = "partial";
        i++;
      }

      if (taker.filledQty >= taker.quantity) taker.status = "filled";

      const isBuyTaker = taker.side === "buy";
      const trade: Trade = {
        id: randomUUID(),
        symbol: taker.symbol,
        price,
        quantity: fillQty,
        buyOrderId: isBuyTaker ? taker.id : maker.id,
        sellOrderId: isBuyTaker ? maker.id : taker.id,
        buyUserId: isBuyTaker ? taker.userId : maker.userId,
        sellUserId: isBuyTaker ? maker.userId : taker.userId,
        createdAt: now,
      };
      trades.push(trade);

      // Settle balances
      const [base, quote] = taker.symbol.split("/") as [string, string];
      const cost = price * fillQty;
      storage.adjustBalance(trade.buyUserId, base, fillQty);
      storage.adjustBalance(trade.buyUserId, quote, -cost);
      storage.adjustBalance(trade.sellUserId, base, -fillQty);
      storage.adjustBalance(trade.sellUserId, quote, cost);

      storage.upsertOrder(maker);
      for (const cb of this.orderCallbacks) cb(maker);
    }
  }

  cancelOrder(orderId: string, userId: string): Order | null {
    const order = storage.getOrder(orderId);
    if (!order || order.userId !== userId) return null;
    if (order.status === "filled" || order.status === "cancelled") return null;

    const book = this.books.get(order.symbol)!;
    const side = order.side === "buy" ? book.bids : book.asks;
    const level = side.get(order.price);
    if (level) {
      const idx = level.findIndex((o) => o.id === orderId);
      if (idx >= 0) level.splice(idx, 1);
      if (level.length === 0) side.delete(order.price);
    }

    const remaining = order.quantity - order.filledQty;
    const [base, quote] = order.symbol.split("/") as [string, string];
    if (order.side === "buy") {
      storage.adjustBalance(userId, quote, order.price * remaining);
    } else {
      storage.adjustBalance(userId, base, remaining);
    }

    order.status = "cancelled";
    order.updatedAt = new Date().toISOString();
    storage.upsertOrder(order);
    return order;
  }

  /** Seed synthetic liquidity around midPrice (called by market simulator) */
  seedLiquidity(symbol: TradingSymbol, midPrice: number) {
    const book = this.books.get(symbol)!;
    const now = new Date().toISOString();
    const spread = midPrice * 0.0008;
    const MAKER = "MARKET_MAKER";

    for (let i = 1; i <= 12; i++) {
      const askPrice = parseFloat((midPrice + spread * i).toFixed(2));
      const bidPrice = parseFloat((midPrice - spread * i).toFixed(2));
      const qty = parseFloat((0.05 + Math.random() * 0.5).toFixed(6));

      if (!book.asks.has(askPrice)) book.asks.set(askPrice, []);
      book.asks.get(askPrice)!.push({
        id: randomUUID(), userId: MAKER, symbol, side: "sell",
        type: "limit", price: askPrice, quantity: qty, filledQty: 0,
        status: "open", createdAt: now, updatedAt: now,
      });

      if (!book.bids.has(bidPrice)) book.bids.set(bidPrice, []);
      book.bids.get(bidPrice)!.push({
        id: randomUUID(), userId: MAKER, symbol, side: "buy",
        type: "limit", price: bidPrice, quantity: qty, filledQty: 0,
        status: "open", createdAt: now, updatedAt: now,
      });
    }
  }

  /** Wipe all market-maker orders (before reseeding) */
  clearMakerOrders(symbol: TradingSymbol) {
    const book = this.books.get(symbol)!;
    const filter = (map: Map<number, Order[]>) => {
      for (const [price, orders] of map) {
        const live = orders.filter((o: Order) => o.userId !== "MARKET_MAKER");
        if (live.length === 0) map.delete(price);
        else map.set(price, live);
      }
    };
    filter(book.bids);
    filter(book.asks);
  }
}

export const matchingEngine = new MatchingEngine();
