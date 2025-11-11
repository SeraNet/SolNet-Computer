import { useState, useEffect, useRef } from "react";

interface RealTimeSystemData {
  performance: {
    cpu: number;
    memory: number;
    uptime: number;
  };
  database: {
    status: string;
    responseTime: number;
    connections: number;
  };
  services: Array<{
    name: string;
    status: string;
  }>;
  errorStats: {
    totalErrors: number;
    errorsLast24h: number;
    criticalErrors: number;
  };
  timestamp: string;
}

export function useSystemWebSocket() {
  const [data, setData] = useState<RealTimeSystemData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // Use relative URL to go through Vite proxy
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("✅ WebSocket connected for system monitoring");
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "system-update") {
              setData(message.data);
            }
          } catch (err) {
          }
        };

        ws.onclose = (event) => {
          setIsConnected(false);

          // Attempt to reconnect after 5 seconds
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        };

        ws.onerror = (event) => {
          setError("WebSocket connection error");
          setIsConnected(false);
        };
      } catch (err) {
        setError("Failed to create WebSocket connection");
        setIsConnected(false);
      }
    };

    // Only attempt WebSocket connection if WebSocket is supported
    if (typeof WebSocket !== "undefined") {
      connectWebSocket();
    } else {
      setError("WebSocket not supported");
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const reconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    // Reconnect by calling the effect again
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "system-update") {
          setData(message.data);
        }
      } catch (err) {
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);

      // Attempt to reconnect after 5 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnect();
      }, 5000);
    };

    ws.onerror = (event) => {
      setError("WebSocket connection error");
      setIsConnected(false);
    };
  };

  return {
    data,
    isConnected,
    error,
    reconnect,
  };
}