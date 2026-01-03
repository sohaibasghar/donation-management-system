'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '@/types/auth';
import { authenticateUser, getUserById } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for stored user session on mount
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('auth_user_id');
      if (storedUserId) {
        const storedUser = getUserById(storedUserId);
        if (storedUser) {
          setUser(storedUser);
        } else {
          localStorage.removeItem('auth_user_id');
        }
      }
      setIsInitialized(true);
    }
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    const authenticatedUser = authenticateUser(username, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user_id', authenticatedUser.id);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user_id');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
