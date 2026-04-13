import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(url);
    
    wsRef.current.onopen = () => {
      setIsConnected(true);
    };
    
    wsRef.current.onclose = () => {
      setIsConnected(false);
    };
    
    wsRef.current.onmessage = (event) => {
      setLastMessage(event.data);
    };
    
    return () => {
      wsRef.current?.close();
    };
  }, [url]);
  
  const sendMessage = (message: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(message);
    }
  };
  
  return { isConnected, lastMessage, sendMessage };
};
