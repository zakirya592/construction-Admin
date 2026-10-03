import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, SESSION_KEY, TOKEN_KEY } from "@/lib/api";
const AuthContext = createContext(null);
function readSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw || !localStorage.getItem(TOKEN_KEY))
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export function AuthProvider({ children }) {
    const [user, setUser] = useState(readSession);
    useEffect(() => {
        const onUnauthorized = () => setUser(null);
        window.addEventListener("northline-unauthorized", onUnauthorized);
        return () => window.removeEventListener("northline-unauthorized", onUnauthorized);
    }, []);
    const value = useMemo(() => ({
        user,
        async login(email, password) {
            const { data } = await api.post("/auth/login", {
                email,
                password,
            });
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
            setUser(data.user);
        },
        logout() {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(SESSION_KEY);
            setUser(null);
        },
    }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
