import { useEffect, useState, useCallback } from "react";
import type { WSMessage } from "@tenshu/shared";

type WSHandler = (message: WSMessage) => void;

let socket: WebSocket | null = null;
const handlers = new Set<WSHandler>();
let isConnecting = false;

function connect() {
  if (isConnecting || (socket && socket.readyState === WebSocket.OPEN)) return;
  isConnecting = true;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

  ws.onopen = () => {
    socket = ws;
    isConnecting = false;
  };

  ws.onmessage = (event) => {
    try {
      const msg: WSMessage = JSON.parse(event.data);
      for (const handler of handlers) {
        handler(msg);
      }
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    socket = null;
    isConnecting = false;
    setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    ws.close();
  };
}

export function useWebSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handler: WSHandler = (msg) => {
      if (msg.type === "connected") setConnected(true);
    };
    handlers.add(handler);
    connect();

    const checkInterval = setInterval(() => {
      setConnected(socket?.readyState === WebSocket.OPEN);
    }, 1000);

    return () => {
      handlers.delete(handler);
      clearInterval(checkInterval);
    };
  }, []);

  const subscribe = useCallback((handler: WSHandler) => {
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }, []);

  return { connected, subscribe };
}
