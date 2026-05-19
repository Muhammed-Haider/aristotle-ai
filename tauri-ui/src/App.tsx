import { useState, useEffect } from "react";
import { apiGet } from "./api";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetLinkScreen from "./screens/ResetLinkScreen";
import TwoFactorScreen from "./screens/TwoFactorScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import AppShell from "./screens/AppShell";
import TryDemoScreen from "./screens/TryDemoScreen";
import "./index.css";

export type Screen =
  | "home" | "login" | "register" | "forgot" | "reset-link"
  | "2fa-login" | "2fa-register" | "onboarding" | "app" | "try-demo";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [pendingEmail, _setPendingEmail] = useState("");

  useEffect(() => {
    apiGet<{ email?: string; name?: string }>("/auth/session").then((s) => {
      if (s.email) { setUser({ email: s.email, name: s.name || s.email }); setScreen("app"); }
    }).catch(() => {});
  }, []);

  const nav = (s: Screen) => setScreen(s);

  if (screen === "app" && user)
    return <AppShell user={user} onLogout={() => { setUser(null); nav("home"); }} />;
  if (screen === "onboarding")
    return <OnboardingScreen onDone={() => nav("app")} />;
  if (screen === "2fa-login")
    return <TwoFactorScreen mode="login" email={pendingEmail} onSuccess={(u) => { setUser(u); nav("app"); }} onBack={() => nav("login")} />;
  if (screen === "2fa-register")
    return <TwoFactorScreen mode="register" email={pendingEmail} onSuccess={(u) => { setUser(u); nav("onboarding"); }} onBack={() => nav("register")} />;
  if (screen === "register")
    return <RegisterScreen onLogin={() => nav("login")} onSuccess={(u) => { setUser(u); nav("onboarding"); }} onHome={() => nav("home")} />;
  if (screen === "forgot")
    return <ForgotPasswordScreen onBack={() => nav("login")} onSent={() => nav("reset-link")} onHome={() => nav("home")} />;
  if (screen === "reset-link")
    return <ResetLinkScreen onBack={() => nav("login")} onHome={() => nav("home")} />;
  if (screen === "try-demo")
    return <TryDemoScreen onBack={() => nav("home")} onLogin={() => nav("login")} onRegister={() => nav("register")} />;
  if (screen === "login")
    return <LoginScreen onRegister={() => nav("register")} onForgot={() => nav("forgot")} onHome={() => nav("home")} onSuccess={(u) => { setUser(u); nav("app"); }} />;

  return <HomeScreen onLogin={() => nav("login")} onRegister={() => nav("register")} onDemo={() => nav("try-demo")} />;
}
