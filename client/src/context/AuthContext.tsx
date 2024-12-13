import React, { createContext, useContext, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface AuthContextProps {
    isAuthenticated: boolean;
    role: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        // Check for token in localStorage to persist session
        return !!localStorage.getItem("authToken");
    });
    const [role, setRole] = useState<string | null>(() => {
        return localStorage.getItem("userRole");
    });

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch("http://localhost:8080/api/v1/users/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("userRole", data.role);
                setIsAuthenticated(true);
                setRole(data.role);
            } else {
                console.error("Login failed");
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        setIsAuthenticated(false);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const ProtectedRoute: React.FC<{ children: ReactNode; role?: string }> = ({
                                                                                     children,
                                                                                     role,
                                                                                 }) => {
    const { isAuthenticated, role: userRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role && userRole !== role) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
