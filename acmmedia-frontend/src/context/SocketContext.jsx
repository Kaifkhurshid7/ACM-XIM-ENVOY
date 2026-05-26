/**
 * Socket.IO Context
 * 
 * Provides a shared WebSocket connection to all components.
 * Manages the Socket.IO client lifecycle (connect, reconnect, disconnect).
 * 
 * The socket connects to the backend on mount and automatically
 * handles reconnection with exponential backoff (up to 5 attempts).
 * 
 * Components access the socket instance via the useSocket() hook
 * to subscribe to real-time events (likes, replies, analytics).
 * 
 * @module context/SocketContext
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

/** Hook to access the Socket.IO client instance */
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const backendUrl =
      import.meta.env.VITE_SOCKET_URL ||
      "https://acmmedia-backend.onrender.com";

    const newSocket = io(backendUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Cleanup: close socket when provider unmounts
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
