import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface AuthContextProps {
  isAuthenticated: boolean;
  role: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  userId: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check for token in localStorage to persist session
    return !!localStorage.getItem('authToken');
  });
  const [role, setRole] = useState<string | null>(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.role;
    }
    return null;
  });
  const [userId, setUserId] = useState<string | null>(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.id || null;
    }
    return null;
  });


  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/v1/users/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        // Check Content-Type to determine response format
        const contentType = response.headers.get('Content-Type');

        let token: string;

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          token = data.token; // Extract token from JSON response
        } else {
          token = await response.text(); // Parse as plain text
        }

        const decoded: any = jwtDecode(token);

        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
        setRole(decoded.role);
        setUserId(decoded.id);
        // console.log('User ID from token:', decoded.id);
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ProtectedRoute: React.FC<{
  children: ReactNode;
  roles: string[];
}> = ({ children, roles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(role || '')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
