import { createContext, useContext, useState, useEffect } from "react";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { id, email, businessName, ... }
  const [loading, setLoading] = useState(true);   // true while checking session on mount

  // On mount: check if we have an active session
  useEffect(() => {
    fetch(`${API}/api/auth/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const r = await fetch(`${API}/api/auth/login`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Login failed");
    setUser(data.user);
    return data.user;
  }

  async function register(email, password, businessName) {
    const r = await fetch(`${API}/api/auth/register`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, businessName }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Registration failed");
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setUser(null);
  }

  async function updateProfile(updates) {
    const r = await fetch(`${API}/api/user/profile`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Update failed");
    setUser(u => ({ ...u, ...data.user }));
  }

  async function deleteAccount() {
    const r = await fetch(`${API}/api/user/account`, { method: "DELETE", credentials: "include" });
    if (!r.ok) throw new Error("Delete failed");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
