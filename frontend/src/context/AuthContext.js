import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🛡️ AuthProvider mounting...');
        // Check for saved user/admin on load
        const savedUser = localStorage.getItem('user');
        const savedAdmin = localStorage.getItem('admin');
        const userToken = localStorage.getItem('userToken');
        const adminToken = localStorage.getItem('adminToken');

        if (savedUser && userToken) {
            setUser(JSON.parse(savedUser));
        }
        if (savedAdmin && adminToken) {
            setAdmin(JSON.parse(savedAdmin));
        }
        setLoading(false);
    }, []);

    const loginUser = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userToken', token);
    };

    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userToken');
    };

    const loginAdmin = (adminData, token) => {
        setAdmin(adminData);
        localStorage.setItem('admin', JSON.stringify(adminData));
        localStorage.setItem('adminToken', token);
    };

    const logoutAdmin = () => {
        setAdmin(null);
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
    };

    return (
        <AuthContext.Provider value={{
            user, admin, loading,
            loginUser, logoutUser,
            loginAdmin, logoutAdmin
        }}>
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
