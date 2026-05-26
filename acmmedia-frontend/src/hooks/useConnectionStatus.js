/**
 * Connection Status Hook
 * 
 * Tracks the real-time connection status of the Socket.IO client.
 * Used by components that display live/disconnected indicators.
 * 
 * @module hooks/useConnectionStatus
 */

import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";

/**
 * Returns the current WebSocket connection status.
 * Automatically updates when connection state changes.
 * 
 * @returns {boolean} True if connected to the Socket.IO server
 */
export const useConnectionStatus = () => {
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  return isConnected;
};
