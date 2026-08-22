import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("dayflow_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = localStorage.getItem("dayflow_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { user: freshUser, employee: emp } = await authService.getMe();
      setUser(freshUser);
      setEmployee(emp);
      localStorage.setItem("dayflow_user", JSON.stringify(freshUser));
    } catch {
      localStorage.removeItem("dayflow_token");
      localStorage.removeItem("dayflow_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = async (email, password) => {
    const { token, user: loggedInUser } = await authService.login({ email, password });
    localStorage.setItem("dayflow_token", token);
    localStorage.setItem("dayflow_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    await hydrate();
    return loggedInUser;
  };

  const registerUser = async (payload) => {
    const { token, user: newUser } = await authService.register(payload);
    localStorage.setItem("dayflow_token", token);
    localStorage.setItem("dayflow_user", JSON.stringify(newUser));
    setUser(newUser);
    await hydrate();
    return newUser;
  };

  const logout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem("dayflow_token");
    localStorage.removeItem("dayflow_user");
    setUser(null);
    setEmployee(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, employee, loading, login, registerUser, logout, refresh: hydrate }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
