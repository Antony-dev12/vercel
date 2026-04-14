import { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { Card, SectionTitle, FormGroup, Input, Select, Button, Spinner, Divider } from "../components/ui.jsx";
import { SECTORS, LOCATIONS } from "../i18n/translations.js";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default function SettingsPage({ t, lang, setLang, authStatus, onDisconnect, showToast }) {
  const { user, updateProfile, deleteAccount, logout } = useAuth();

  // Profile form
  const [businessName, setBusiness] = useState(user?.businessName || "");
  const [sector, setSector]         = useState(user?.sector       || "");
  const [location, setLocation]     = useState(user?.location     || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [savingPw, setSavingPw]     = useState(false);
  const [pwError, setPwError]       = useState("");

  // Delete
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting]       = useState(false);

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await updateProfile({ businessName, sector, location });
      showToast(t.settingsSaved);
    } catch {
      showToast(t.error, true);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    setPwError("");
    if (newPw.length < 8) { setPwError(t.passwordShort); return; }
    if (newPw !== confirmPw) { setPwError(t.passwordMismatch); return; }
    setSavingPw(true);
    try {
      const r = await fetch(`${API}/api/auth/change-password`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showToast(t.passwordUpdated);
    } catch (err) {
      setPwError(err.message || t.error);
    } finally {
      setSavingPw(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteAccount();
    } catch {
      showToast(t.error, true);
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* ── Language preference ── */}
      <Card>
        <SectionTitle>{t.langPreference}</SectionTitle>
        <div style={{ display: "flex", gap: 8 }}>
          {["en", "sw"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 14, fontWeight: 700, transition: "all 0.2s",
              background: lang === l ? "#2DD4BF" : "#1e2d2a",
              color: lang === l ? "#080e0c" : "#7a9e99",
            }}>
              {l === "en" ? "🇬🇧 English" : "🇰🇪 Kiswahili"}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Business profile ── */}
      <Card>
        <SectionTitle>{t.settingsProfile}</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormGroup label={t.businessName}>
            <Input value={businessName} onChange={e => setBusiness(e.target.value)} />
          </FormGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label={t.sector}>
              <Select value={sector} onChange={e => setSector(e.target.value)}>
                <option value="">— Select —</option>
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label={t.location}>
              <Select value={location} onChange={e => setLocation(e.target.value)}>
                <option value="">— Select —</option>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </Select>
            </FormGroup>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Button onClick={handleSaveProfile} disabled={savingProfile} style={{ width: "auto", padding: "11px 24px" }}>
            {savingProfile ? <><Spinner size={14} />{t.saveChanges}...</> : t.saveChanges}
          </Button>
        </div>
      </Card>

      {/* ── Connected accounts ── */}
      <Card>
        <SectionTitle>{t.settingsConnections}</SectionTitle>
        {[
          { key: "facebook", label: "Facebook & Instagram", icon: "🔵", color: "#1877F2" },
          { key: "google",   label: "Google Business",      icon: "🟢", color: "#34A853" },
        ].map(({ key, label, icon, color }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #1e2d2a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 12, color: authStatus[key] ? "#4ade80" : "#7a9e99" }}>
                  {authStatus[key] ? t.connected : "Not connected"}
                </div>
              </div>
            </div>
            {authStatus[key] && (
              <Button variant="ghost" onClick={() => onDisconnect(key)} style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}>
                {t.disconnect}
              </Button>
            )}
          </div>
        ))}
      </Card>

      {/* ── Change password ── */}
      <Card>
        <SectionTitle>{t.settingsSecurity}</SectionTitle>
        {pwError && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#ef4444", fontSize: 13, marginBottom: 16 }}>
            {pwError}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormGroup label={t.currentPassword}>
            <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
          </FormGroup>
          <FormGroup label={t.password}>
            <Input type="password" value={newPw} placeholder="Min. 8 characters" onChange={e => setNewPw(e.target.value)} />
          </FormGroup>
          <FormGroup label={t.confirmPassword}>
            <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
          </FormGroup>
        </div>
        <div style={{ marginTop: 20 }}>
          <Button onClick={handleChangePassword} disabled={savingPw} style={{ width: "auto", padding: "11px 24px" }}>
            {savingPw ? <><Spinner size={14} />{t.changePassword}...</> : t.changePassword}
          </Button>
        </div>
      </Card>

      {/* ── Danger zone ── */}
      <Card style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
        <SectionTitle>{t.settingsDanger}</SectionTitle>
        <div style={{ fontSize: 13, color: "#7a9e99", marginBottom: 16, lineHeight: 1.6 }}>
          {t.deleteWarning}
        </div>
        <FormGroup label={t.deleteConfirm}>
          <Input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="DELETE" />
        </FormGroup>
        <div style={{ marginTop: 16 }}>
          <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteInput !== "DELETE" || deleting} style={{ width: "auto", padding: "11px 24px" }}>
            {deleting ? <><Spinner size={14} />{t.deleteAccount}...</> : t.deleteAccount}
          </Button>
        </div>
      </Card>
    </div>
  );
}
