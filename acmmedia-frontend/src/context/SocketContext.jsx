import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const backendUrl =
            import.meta.env.VITE_SOCKET_URL || 'https://acmmedia-backend.onrender.com';

        const newSocket = io(backendUrl, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server:', newSocket.id);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
