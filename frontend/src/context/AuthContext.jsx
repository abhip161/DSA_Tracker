import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const getInitialAuth = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  return {
    token: token || '',
    user: userString ? JSON.parse(userString) : null,
  };
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getInitialAuth);

  const login = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ token, user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ token: '', user: null });
  };

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
