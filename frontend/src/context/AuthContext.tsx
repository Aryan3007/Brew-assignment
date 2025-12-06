import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

interface User {
    _id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string) => Promise<void>;
    googleLogin: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
            } catch (error) {
                console.log('Not logged in');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email: string, pass: string) => {
        const { data } = await api.post('/auth/login', { email, password: pass });
        setUser(data);
    };

    const register = async (email: string, pass: string) => {
        const { data } = await api.post('/auth/register', { email, password: pass });
        setUser(data);
    };

    const googleLogin = async (token: string) => {
        const { data } = await api.post('/auth/google', { token });
        setUser(data);
    };

    const logout = async () => {
        await api.get('/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout }}>
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
