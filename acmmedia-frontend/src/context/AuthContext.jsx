import React, { createContext, useState, useEffect } from "react";
import * as authApi from "../api/auth";
import { extractObject, extractToken } from "../utils/api";

export const AuthContext = createContext();
export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const { data } = await authApi.getCurrentUser();
                    setUser(extractObject(data, ["user", "data"]));
                } catch (err) {
                    localStorage.removeItem("token");
                    setUser(null);
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const { data } = await authApi.login({ email, password });
        const token = extractToken(data);

        if (!token) {
            throw new Error("Login succeeded but no token was returned.");
        }

        localStorage.setItem("token", token);

        try {
            const { data: me } = await authApi.getCurrentUser();
            const normalizedUser = extractObject(me, ["user", "data"]);
            setUser(normalizedUser);
            return normalizedUser;
        } catch (err) {
            const fallbackUser = extractObject(data, ["user", "data"]) || { token };
            setUser(fallbackUser);
            return fallbackUser;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
