
import { useState, useEffect, useCallback } from 'react';

interface WebSocketHookOptions {
  url: string;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectDelay?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  reconnect = true,
  reconnectDelay = 3000,
}: WebSocketHookOptions) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        if (onConnect) onConnect();
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        if (onDisconnect) onDisconnect();
        
        // Reconnect if enabled
        if (reconnect) {
          setTimeout(() => connect(), reconnectDelay);
        }
      };
      
      ws.onerror = (e) => {
        setError(e);
        if (onError) onError(e);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      setSocket(ws);
      
      return () => {
        ws.close();
      };
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
    }
  }, [url, onConnect, onDisconnect, onError, onMessage, reconnect, reconnectDelay]);
  
  useEffect(() => {
    connect();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);
  
  // Send message function
  const sendMessage = useCallback(
    (data: any) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify(data));
      }
    },
    [socket, isConnected]
  );
  
  return { isConnected, error, sendMessage };
}
