import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './index.css';
import './styles/auth.css';
import './styles/events.css';
import './styles/home.css';
import './styles/forum.css';
import './styles/navbar.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <SocketProvider>
                <App />
            </SocketProvider>
        </AuthProvider>
    </React.StrictMode>
);
