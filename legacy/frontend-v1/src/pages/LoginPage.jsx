import { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { Card, FormGroup, Input, Button, Spinner } from "../components/ui.jsx";

export default function LoginPage({ t, onSwitchToRegister, onForgotPassword }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e) {
    e && e.preventDefault();
    setError("");
    if (!email) { setError(t.emailRequired); return; }
    if (password.length < 8) { setError(t.passwordShort); return; }
    setLoading(true);
    try {
      await login(email, password);
      // AuthProvider updates user → App re-renders to main shell
    } catch (err) {
      setError(t.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080e0c", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #2DD4BF, #F59E0B)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>📡</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#e8f4f1", letterSpacing: "-0.5px" }}>Digital Presence Tracker</div>
          <div style={{ fontSize: 13, color: "#7a9e99", marginTop: 4 }}>For Kenyan SMEs</div>
        </div>

        <Card>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#e8f4f1", marginBottom: 24 }}>{t.login}</div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#ef4444", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FormGroup label={t.email}>
              <Input
                type="email" value={email} placeholder="you@example.com"
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </FormGroup>
            <FormGroup label={t.password}>
              <Input
                type="password" value={password} placeholder="••••••••"
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </FormGroup>
          </div>

          <div style={{ textAlign: "right", marginTop: 8, marginBottom: 20 }}>
            <button onClick={onForgotPassword} style={{ background: "none", border: "none", color: "#2DD4BF", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {t.forgotPassword}
            </button>
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <><Spinner />{t.login}...</> : t.login}
          </Button>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#7a9e99" }}>
            {t.noAccount}{" "}
            <button onClick={onSwitchToRegister} style={{ background: "none", border: "none", color: "#2DD4BF", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
              {t.register}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
