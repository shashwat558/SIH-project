/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  signup as svcSignup,
  login as svcLogin,
  logout as svcLogout,
  getSessionUser,
} from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const signup = async (payload) => {
    const u = await svcSignup(payload);
    setUser(u);
    return u;
  };

  const login = async (payload) => {
    const u = await svcLogin(payload);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await svcLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
