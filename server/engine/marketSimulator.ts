import type { TradingSymbol, TickerData, Trade } from "@shared/schema";
import { SYMBOLS } from "@shared/schema";
import { matchingEngine } from "./matchingEngine";

const INITIAL_PRICES: Record<TradingSymbol, number> = {
  "BTC/USD": 65420,
  "ETH/USD": 3480,
  "SOL/USD": 148.5,
};

class MarketSimulator {
  private prices: Record<TradingSymbol, number> = { ...INITIAL_PRICES };
  private prices24hAgo: Record<TradingSymbol, number> = { ...INITIAL_PRICES };
  private high24h: Record<TradingSymbol, number> = { ...INITIAL_PRICES };
  private low24h: Record<TradingSymbol, number> = { ...INITIAL_PRICES };
  private volume24h: Record<TradingSymbol, number> = {
    "BTC/USD": 142.5,
    "ETH/USD": 8240,
    "SOL/USD": 128000,
  };

  private tickerCallbacks: ((t: TickerData) => void)[] = [];
  private tradeCallbacks: ((t: Trade) => void)[] = [];
  private started = false;

  constructor() {
    // Seed the initial order books
    for (const sym of SYMBOLS) {
      matchingEngine.seedLiquidity(sym, INITIAL_PRICES[sym]);
    }

    matchingEngine.onTradeExecution((trade) => {
      const sym = trade.symbol;
      this.prices[sym] = trade.price;
      this.volume24h[sym] += trade.quantity;
      if (trade.price > this.high24h[sym]) this.high24h[sym] = trade.price;
      if (trade.price < this.low24h[sym]) this.low24h[sym] = trade.price;
      for (const cb of this.tradeCallbacks) cb(trade);
    });
  }

  onTickerUpdate(cb: (t: TickerData) => void) {
    this.tickerCallbacks.push(cb);
  }

  onTradeExecuted(cb: (t: Trade) => void) {
    this.tradeCallbacks.push(cb);
  }

  getTicker(symbol: TradingSymbol): TickerData {
    const price = this.prices[symbol];
    const prev = this.prices24hAgo[symbol];
    return {
      symbol,
      price,
      change24h: parseFloat((price - prev).toFixed(2)),
      changePercent24h: parseFloat((((price - prev) / prev) * 100).toFixed(2)),
      volume24h: parseFloat(this.volume24h[symbol].toFixed(4)),
      high24h: this.high24h[symbol],
      low24h: this.low24h[symbol],
    };
  }

  getAllTickers(): TickerData[] {
    return SYMBOLS.map((s) => this.getTicker(s));
  }

  start() {
    if (this.started) return;
    this.started = true;

    // Price tick every 1.5s — random walk with mean reversion
    setInterval(() => this.tick(), 1500);

    // Refresh synthetic liquidity every 8s
    setInterval(() => this.refreshLiquidity(), 8000);

    // Drift the 24h-ago price gradually so stats stay interesting
    setInterval(() => {
      for (const sym of SYMBOLS) {
        this.prices24hAgo[sym] = this.prices[sym] * (0.97 + Math.random() * 0.06);
      }
    }, 120000);
  }

  private tick() {
    for (const sym of SYMBOLS) {
      const price = this.prices[sym];
      const drift = (INITIAL_PRICES[sym] - price) * 0.0005; // mean reversion
      const volatility = price * 0.0004;
      const change = drift + (Math.random() - 0.5) * 2 * volatility;
      const newPrice = Math.max(price * 0.8, parseFloat((price + change).toFixed(2)));
      this.prices[sym] = newPrice;

      const ticker = this.getTicker(sym);
      for (const cb of this.tickerCallbacks) cb(ticker);
    }
  }

  private refreshLiquidity() {
    for (const sym of SYMBOLS) {
      matchingEngine.clearMakerOrders(sym);
      matchingEngine.seedLiquidity(sym, this.prices[sym]);
    }
  }
}

export const marketSimulator = new MarketSimulator();
