import { useState } from "react";
import { Card, FormGroup, Input, Button, Spinner } from "../components/ui.jsx";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default function ForgotPasswordPage({ t, onBack }) {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit() {
    setError("");
    if (!email) { setError(t.emailRequired); return; }
    setLoading(true);
    try {
      await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true); // always show success (don't reveal if email exists)
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080e0c", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #2DD4BF, #F59E0B)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🔑</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#e8f4f1" }}>{t.resetPassword}</div>
        </div>

        <Card>
          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>📬</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e8f4f1", marginBottom: 8 }}>{t.resetPassword}</div>
              <div style={{ fontSize: 14, color: "#7a9e99", lineHeight: 1.6, marginBottom: 24 }}>{t.resetSent}</div>
              <Button variant="ghost" onClick={onBack} style={{ width: "auto", padding: "10px 24px" }}>← {t.login}</Button>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#ef4444", fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <div style={{ fontSize: 14, color: "#7a9e99", marginBottom: 20, lineHeight: 1.6 }}>
                Enter your email address and we'll send you a link to reset your password.
              </div>
              <FormGroup label={t.email}>
                <Input type="email" value={email} placeholder="you@example.com"
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </FormGroup>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? <><Spinner />{t.sendResetLink}...</> : t.sendResetLink}
                </Button>
                <Button variant="ghost" onClick={onBack}>{t.login}</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
