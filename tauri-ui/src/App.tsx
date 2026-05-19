import { useState, useEffect } from "react";
import { apiGet } from "./api";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import AppShell from "./screens/AppShell";
import "./index.css";

type Screen = "login" | "register" | "app";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    apiGet<{ email?: string; name?: string }>("/auth/session").then((s) => {
      if (s.email) { setUser({ email: s.email, name: s.name || s.email }); setScreen("app"); }
    }).catch(() => {});
  }, []);

  if (screen === "app" && user) {
    return <AppShell user={user} onLogout={() => { setUser(null); setScreen("login"); }} />;
  }
  if (screen === "register") {
    return <RegisterScreen onLogin={() => setScreen("login")} onSuccess={(u) => { setUser(u); setScreen("app"); }} />;
  }
  return <LoginScreen onRegister={() => setScreen("register")} onSuccess={(u) => { setUser(u); setScreen("app"); }} />;
}
