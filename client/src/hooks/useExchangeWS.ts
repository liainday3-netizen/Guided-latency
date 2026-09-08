import { useEffect, useRef, useCallback, useState } from "react";

type Handler = (data: unknown) => void;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const subscribers = new Map<string, Set<Handler>>();
let pendingSubs: string[] = [];

function getSocket(): WebSocket {
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${proto}://${window.location.host}/ws`);

  socket.addEventListener("open", () => {
    // Resubscribe everything on reconnect
    for (const ch of subscribers.keys()) {
      socket!.send(JSON.stringify({ type: "subscribe", channel: ch }));
    }
    for (const ch of pendingSubs) {
      socket!.send(JSON.stringify({ type: "subscribe", channel: ch }));
    }
    pendingSubs = [];
  });

  socket.addEventListener("message", (e) => {
    try {
      const { type, data } = JSON.parse(e.data);
      const set = subscribers.get(type);
      if (set) for (const h of set) h(data);
    } catch {}
  });

  socket.addEventListener("close", () => {
    socket = null;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => getSocket(), 2000);
  });

  return socket;
}

export function subscribe(channel: string, handler: Handler) {
  if (!subscribers.has(channel)) subscribers.set(channel, new Set());
  subscribers.get(channel)!.add(handler);

  const ws = socket;
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "subscribe", channel }));
  } else {
    pendingSubs.push(channel);
    getSocket();
  }

  return () => {
    subscribers.get(channel)?.delete(handler);
    if (subscribers.get(channel)?.size === 0) {
      subscribers.delete(channel);
      const ws2 = socket;
      if (ws2 && ws2.readyState === WebSocket.OPEN) {
        ws2.send(JSON.stringify({ type: "unsubscribe", channel }));
      }
    }
  };
}

export function sendWS(msg: object) {
  const ws = getSocket();
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

export function useChannel<T>(channel: string): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    return subscribe(channel, (d) => setData(d as T));
  }, [channel]);
  return data;
}

// Initialise the socket eagerly
if (typeof window !== "undefined") getSocket();
