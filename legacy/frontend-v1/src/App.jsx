import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import { T, PLATFORMS, SECTORS, LOCATIONS } from "./i18n/translations.js";
import { ScoreRing, SparkLine, getGrade, gradeColor, calcLDVS, getTrend } from "./components/charts.jsx";
import { Card, SectionTitle, Empty, FormGroup, Input, Select, Button, Spinner, Badge, Divider } from "./components/ui.jsx";
import LoginPage       from "./pages/LoginPage.jsx";
import RegisterPage    from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import OnboardingPage  from "./pages/OnboardingPage.jsx";
import SettingsPage    from "./pages/SettingsPage.jsx";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState("login");

  if (loading) return <LoadingScreen />;

  if (!user) {
    if (authView === "forgot")   return <ForgotPasswordPage t={T.en} onBack={() => setAuthView("login")} />;
    if (authView === "register") return <RegisterPage t={T.en} onSwitchToLogin={() => setAuthView("login")} />;
    return <LoginPage t={T.en} onSwitchToRegister={() => setAuthView("register")} onForgotPassword={() => setAuthView("forgot")} />;
  }

  return <MainShell />;
}

function MainShell() {
  const { user, logout } = useAuth();
  const [lang, setLang] = useState(() => localStorage.getItem("dpt_lang") || "en");
  const t = T[lang];

  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem("dpt_onboarded"));
  const [tab, setTab] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pulling, setPulling] = useState({ fb: false, google: false });
  const [authStatus, setAuthStatus] = useState({ facebook: false, google: false });
  const [autoSource, setAutoSource] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    businessName: user?.businessName || "",
    sector: user?.sector || "",
    location: user?.location || "",
    platforms: [],
    profileComplete: 50,
    postFreq: 30,
    engagement: 40,
    responsiveness: 60,
  });

  useEffect(() => { localStorage.setItem("dpt_lang", lang); }, [lang]);

  useEffect(() => {
    checkAuth();
    loadHistory();
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) {
      showToast("\u2713 " + params.get("connected") + " connected!");
      window.history.replaceState({}, "", window.location.pathname);
      checkAuth();
    }
    if (params.get("error")) {
      showToast("Connection failed. Please try again.", true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function checkAuth() {
    try {
      const r = await fetch(API + "/api/auth/status", { credentials: "include" });
      if (r.ok) setAuthStatus(await r.json());
    } catch {}
  }

  async function loadHistory() {
    try {
      const r = await fetch(API + "/api/history", { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setHistory(data.slice(-12));
        if (data.length > 0) setResult(data[data.length - 1]);
      }
    } catch {}
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  }

  function connectFacebook() { window.location.href = API + "/auth/facebook"; }
  function connectGoogle()   { window.location.href = API + "/auth/google"; }

  async function disconnect(platform) {
    await fetch(API + "/api/auth/disconnect", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    setAuthStatus(s => ({ ...s, [platform]: false }));
    setAutoSource(null);
    showToast(t.disconnected);
  }

  async function pullFacebook() {
    setPulling(p => ({ ...p, fb: true }));
    try {
      const r = await fetch(API + "/api/meta/insights", { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      const d = await r.json();
      setForm(f => ({
        ...f,
        businessName: d.pageName || f.businessName,
        profileComplete: d.profileComplete,
        postFreq: d.postFreq,
        engagement: d.engagement,
        responsiveness: d.responsiveness,
        platforms: [...new Set([...f.platforms, "Facebook", ...(d.hasInstagram ? ["Instagram"] : [])])],
      }));
      setAutoSource("Facebook & Instagram");
      showToast("\u2713 Facebook data pulled successfully!");
    } catch {
      showToast("Could not pull Facebook data. Make sure your account is connected.", true);
    }
    setPulling(p => ({ ...p, fb: false }));
  }

  async function pullGoogle() {
    setPulling(p => ({ ...p, google: true }));
    try {
      const r = await fetch(API + "/api/google/insights", { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      const d = await r.json();
      setForm(f => ({
        ...f,
        businessName: d.businessName || f.businessName,
        profileComplete: Math.round((f.profileComplete + d.profileComplete) / 2),
        responsiveness: Math.round((f.responsiveness + d.responsiveness) / 2),
        platforms: [...new Set([...f.platforms, "Google Maps"])],
      }));
      setAutoSource(prev => prev ? prev + " & Google" : "Google Business");
      showToast("\u2713 Google Business data pulled!");
    } catch {
      showToast("Could not pull Google data.", true);
    }
    setPulling(p => ({ ...p, google: false }));
  }

  async function handleCalculate() {
    setLoading(true);
    try {
      const r = await fetch(API + "/api/score", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: lang }),
      });
      if (r.ok) {
        const data = await r.json();
        const newHist = [...history, { score: data.score, date: data.date, timestamp: data.timestamp }].slice(-12);
        setResult(data);
        setHistory(newHist);
        setTab(0);
        showToast(t.saved);
        setLoading(false);
        return;
      }
    } catch {}
    const score = calcLDVS(form);
    const date = new Date().toLocaleDateString("en-KE", { month: "short", day: "numeric" });
    const entry = { ...form, score, grade: getGrade(score), recs: localRecs(form, lang), date, timestamp: Date.now() };
    const newHist = [...history, { score, date, timestamp: Date.now() }].slice(-12);
    setResult(entry);
    setHistory(newHist);
    setTab(0);
    showToast(t.saved);
    setLoading(false);
  }

  function handlePlatform(p) {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }));
  }

  function handleOnboardingComplete(formData) {
    setForm(f => ({ ...f, ...formData }));
    localStorage.setItem("dpt_onboarded", "1");
    setOnboarded(true);
  }

  if (!onboarded) {
    return <OnboardingPage t={t} onComplete={handleOnboardingComplete} />;
  }

  const indicators = result ? [
    { label: t.profileComplete, val: result.profileComplete, weight: "20%", color: "#2DD4BF" },
    { label: t.postFreq,        val: result.postFreq,        weight: "20%", color: "#F59E0B" },
    { label: t.engagement,      val: result.engagement,      weight: "25%", color: "#fb923c" },
    { label: t.responsiveness,  val: result.responsiveness,  weight: "20%", color: "#4ade80" },
    { label: "Platform Presence", weight: "15%", color: "#a78bfa",
      val: Math.round(Math.min(100, ((result.platforms?.length || 0) / PLATFORMS.length) * 100)) },
  ] : [];

  const avgScore = history.length ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) : 0;
  const trend    = getTrend(history, t);
  const gc       = result ? gradeColor(result.grade) : "#2DD4BF";

  return (
    <div style={{ background: "#080e0c", minHeight: "100vh", fontFamily: "\'DM Sans\', sans-serif", color: "#e8f4f1" }}>
      <style>{`
        @import url(\'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap\');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #253330; border-radius: 2px; }
        input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; background: #1e2d2a; border-radius: 99px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: #2DD4BF; border-radius: 50%; cursor: pointer; transition: transform 0.15s; }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        select option { background: #192220; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .fade-in { animation: fadeIn 0.35s ease forwards; }
        .fi { background: #111814; border: 1px solid #1e2d2a; border-radius: 10px; padding: 10px 14px; color: #e8f4f1; font-family: \'DM Sans\', sans-serif; font-size: 14px; outline: none; width: 100%; transition: border-color 0.2s; }
        .fi:focus { border-color: #2DD4BF; }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: toast.isError ? "#7f1d1d" : "#134e4a",
          border: "1px solid " + (toast.isError ? "#ef4444" : "#2DD4BF"),
          color: toast.isError ? "#fca5a5" : "#2DD4BF",
          padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
          zIndex: 999, whiteSpace: "nowrap", animation: "slideUp 0.3s ease",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>{toast.msg}</div>
      )}

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1e2d2a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #2DD4BF, #F59E0B)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>\uD83D\uDCE1</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.5px" }}>{t.appName}</div>
              <div style={{ fontSize: 11, color: "#7a9e99", letterSpacing: "0.8px", textTransform: "uppercase" }}>{t.appSub}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 4, background: "#111814", borderRadius: 10, padding: 3, border: "1px solid #1e2d2a" }}>
              {["EN", "SW"].map(l => (
                <button key={l} onClick={() => setLang(l.toLowerCase())}
                  style={{ padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 600, transition: "all 0.2s", background: lang === l.toLowerCase() ? "#2DD4BF" : "transparent", color: lang === l.toLowerCase() ? "#080e0c" : "#7a9e99" }}>{l}</button>
              ))}
            </div>
            <button onClick={logout} style={{ padding: "8px 14px", background: "transparent", border: "1px solid #253330", color: "#7a9e99", borderRadius: 10, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
              {t.logout}
            </button>
          </div>
        </div>

        <div style={{ padding: "8px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, fontSize: 12, color: "#F59E0B", marginBottom: 20 }}>
          \u2697\uFE0F {t.provisionalWeights}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#111814", borderRadius: 14, padding: 5, border: "1px solid #1e2d2a", overflowX: "auto" }}>
          {t.tabs.concat([t.settingsTitle]).map((label, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              flex: "1 0 auto", padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13, fontWeight: 600, transition: "all 0.2s", whiteSpace: "nowrap",
              background: tab === i ? "#1e2d2a" : "transparent",
              color: tab === i ? "#2DD4BF" : "#7a9e99",
              boxShadow: tab === i ? "0 0 0 1px #253330" : "none",
            }}>
              <span style={{ marginRight: 5 }}>{[...t.tabIcons, "\u2699\uFE0F"][i]}</span>{label}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div className="fade-in">
            {!result ? (
              <Card><Empty icon="\uD83D\uDCCA" title={t.noData} desc={t.noDataSub} /></Card>
            ) : (
              <>
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                    <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
                      <ScoreRing score={result.score} />
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                        <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, background: "linear-gradient(135deg, " + gc + ", #F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{result.score}</div>
                        <div style={{ fontSize: 11, color: "#7a9e99" }}>/100</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: gc, marginBottom: 4 }}>Grade {result.grade} \u2014 {t.grades[result.grade]}</div>
                      <div style={{ fontSize: 14, color: "#7a9e99", lineHeight: 1.6 }}>
                        {result.businessName && <strong style={{ color: "#e8f4f1" }}>{result.businessName}</strong>}
                        {result.sector && <span> \u00B7 {result.sector}</span>}
                        {result.location && <span> \u00B7 {result.location}</span>}
                      </div>
                      {autoSource && <div style={{ marginTop: 8, fontSize: 12, color: "#2DD4BF", background: "rgba(45,212,191,0.08)", padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>\u26A1 {t.autoFilled} {autoSource}</div>}
                      <div style={{ marginTop: 8, fontSize: 12, color: "#7a9e99" }}>{t.lastChecked}: {result.date}</div>
                      {trend && <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: trend.color }}>{trend.label}</div>}
                    </div>
                  </div>
                </Card>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
                  {[{ num: result.score, label: lang === "sw" ? "Alama ya Sasa" : "Current Score", color: gc }, { num: avgScore, label: t.avgScore, color: "#F59E0B" }, { num: history.length, label: t.sessions, color: "#a78bfa" }].map((s, i) => (
                    <div key={i} style={{ background: "#111814", border: "1px solid #1e2d2a", borderRadius: 14, padding: 18, textAlign: "center" }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.num}</div>
                      <div style={{ fontSize: 11, color: "#7a9e99", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <Card>
                  <SectionTitle>{t.breakdown}</SectionTitle>
                  {indicators.map((m, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                        <span style={{ fontWeight: 500 }}>{m.label} <span style={{ color: "#7a9e99", fontSize: 11 }}>({m.weight})</span></span>
                        <span style={{ fontWeight: 700, color: m.color }}>{m.val}</span>
                      </div>
                      <div style={{ height: 7, background: "#1e2d2a", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: m.val + "%", height: "100%", background: m.color, borderRadius: 99, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
                      </div>
                    </div>
                  ))}
                </Card>
                <Card>
                  <SectionTitle>{t.platforms}</SectionTitle>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {PLATFORMS.map(p => {
                      const active = result.platforms?.includes(p);
                      return <span key={p} style={{ padding: "5px 12px", borderRadius: 99, fontSize: 13, fontWeight: 500, background: active ? "rgba(45,212,191,0.12)" : "#1e2d2a", color: active ? "#2DD4BF" : "#7a9e99", border: "1px solid " + (active ? "#2DD4BF" : "#253330") }}>{p}</span>;
                    })}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {tab === 1 && (
          <div className="fade-in">
            <Card>
              <SectionTitle>{t.connectTab}</SectionTitle>
              <p style={{ fontSize: 14, color: "#7a9e99", marginBottom: 24, lineHeight: 1.6 }}>{t.connectDesc}</p>
              {[
                { key: "facebook", icon: "\uD83D\uDD35", name: "Facebook & Instagram", color: "#1877F2", onConnect: connectFacebook, onPull: pullFacebook, isPulling: pulling.fb, desc: lang === "sw" ? "Pulls ukurasa wako, mara za kuchapisha, mwingiliano." : "Pulls your page profile, post frequency, engagement rate, and message response rate." },
                { key: "google",   icon: "\uD83D\uDFE2", name: "Google Business Profile", color: "#34A853", onConnect: connectGoogle, onPull: pullGoogle, isPulling: pulling.google, desc: lang === "sw" ? "Pulls ukamilifu wa wasifu na kiwango cha kujibu maoni." : "Pulls your profile completeness and review response rate from Google Maps." },
              ].map(({ key, icon, name, color, onConnect, onPull, isPulling, desc }) => (
                <div key={key} style={{ padding: 18, background: "#111814", borderRadius: 14, border: "1px solid " + (authStatus[key] ? color + "44" : "#1e2d2a"), marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{name}</div>
                      <div style={{ fontSize: 12, color: "#7a9e99", marginTop: 2 }}>{desc}</div>
                    </div>
                    {authStatus[key] && <span style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", background: "rgba(34,197,94,0.1)", padding: "4px 10px", borderRadius: 99 }}>{t.connected}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!authStatus[key] ? (
                      <button onClick={onConnect} style={{ flex: 1, padding: "10px", background: color, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{key === "facebook" ? t.connectFB : t.connectGoogle}</button>
                    ) : (
                      <>
                        <button onClick={onPull} disabled={isPulling} style={{ flex: 1, padding: "10px", background: isPulling ? "#1e2d2a" : "rgba(45,212,191,0.15)", color: isPulling ? "#7a9e99" : "#2DD4BF", border: "1px solid rgba(45,212,191,0.3)", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: isPulling ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                          {isPulling ? <><Spinner size={12} />{t.pulling}</> : t.pullData}
                        </button>
                        <button onClick={() => disconnect(key)} style={{ padding: "10px 14px", background: "transparent", color: "#7a9e99", border: "1px solid #253330", borderRadius: 10, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{t.disconnect}</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ padding: 16, background: "#1e2d2a", borderRadius: 12, border: "1px solid #253330" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>\uD83D\uDFE1</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>WhatsApp & TikTok</div>
                    <div style={{ fontSize: 13, color: "#7a9e99", lineHeight: 1.5 }}>{t.whatsappManualDesc}</div>
                    <button onClick={() => setTab(2)} style={{ marginTop: 10, padding: "6px 14px", background: "transparent", border: "1px solid #2DD4BF", color: "#2DD4BF", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                      {lang === "sw" ? "Jaza Wewe Mwenyewe \u2192" : "Fill in Manually \u2192"}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === 2 && (
          <div className="fade-in">
            <Card>
              <SectionTitle>{t.inputTitle}</SectionTitle>
              {(authStatus.facebook || authStatus.google) && (
                <div style={{ padding: "10px 14px", background: "rgba(45,212,191,0.08)", borderRadius: 10, border: "1px solid rgba(45,212,191,0.2)", fontSize: 13, color: "#2DD4BF", marginBottom: 20 }}>\u26A1 {t.connectFirst}</div>
              )}
              {autoSource && (
                <div style={{ padding: "10px 14px", background: "rgba(45,212,191,0.05)", borderRadius: 10, border: "1px solid rgba(45,212,191,0.15)", fontSize: 13, color: "#7a9e99", marginBottom: 20 }}>
                  {t.autoFilled} <strong style={{ color: "#2DD4BF" }}>{autoSource}</strong>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormGroup label={t.businessName}><Input placeholder="e.g. Mama Mboga Supplies" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} /></FormGroup>
                <FormGroup label={t.sector}><Select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}><option value="">\u2014 Select \u2014</option>{SECTORS.map(s => <option key={s}>{s}</option>)}</Select></FormGroup>
                <FormGroup label={t.location} style={{ gridColumn: "1/-1" }}><Select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}><option value="">\u2014 Select \u2014</option>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</Select></FormGroup>
              </div>
              <div style={{ marginTop: 20, marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#7a9e99", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 10 }}>{t.platforms}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => handlePlatform(p)} style={{ padding: "7px 14px", borderRadius: 99, border: "1px solid " + (form.platforms.includes(p) ? "#2DD4BF" : "#253330"), background: form.platforms.includes(p) ? "rgba(45,212,191,0.1)" : "#1e2d2a", color: form.platforms.includes(p) ? "#2DD4BF" : "#7a9e99", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.2s" }}>{p}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                {[{ key: "profileComplete", label: t.profileComplete, hint: t.profileHint }, { key: "postFreq", label: t.postFreq, hint: t.postHint }, { key: "engagement", label: t.engagement, hint: t.engHint }, { key: "responsiveness", label: t.responsiveness, hint: t.respHint }].map(({ key, label, hint }) => (
                  <div key={key} style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#7a9e99", marginBottom: 10 }}>{hint}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input type="range" min="0" max="100" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))} />
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#2DD4BF", minWidth: 36, textAlign: "right" }}>{form[key]}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 16px", background: "#1e2d2a", borderRadius: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#7a9e99" }}>{lang === "sw" ? "Hakiki ya Alama" : "Score Preview"}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: gradeColor(getGrade(calcLDVS(form))) }}>{calcLDVS(form)}</span>
              </div>
              <button onClick={handleCalculate} disabled={loading} style={{ width: "100%", padding: "15px", background: loading ? "#1e2d2a" : "linear-gradient(135deg, #2DD4BF, #1a8073)", color: loading ? "#7a9e99" : "#080e0c", fontFamily: "inherit", fontSize: 15, fontWeight: 800, border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                {loading ? <><Spinner />{t.calculating}</> : t.calcScore}
              </button>
            </Card>
          </div>
        )}

        {tab === 3 && (
          <div className="fade-in">
            <Card>
              <SectionTitle>{t.recommendations}</SectionTitle>
              {!result ? <Empty icon="\uD83D\uDCA1" title={t.noData} desc={t.noDataSub} /> : (
                result.recs?.map((rec, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: 16, background: "#111814", borderRadius: 12, border: "1px solid #1e2d2a", marginBottom: 12 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#2DD4BF33"} onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2d2a"}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, background: rec.priority === "high" ? "rgba(239,68,68,0.12)" : rec.priority === "mid" ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)" }}>{rec.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{rec.title}</div>
                      <div style={{ fontSize: 13, color: "#7a9e99", lineHeight: 1.6 }}>{rec.desc}</div>
                    </div>
                    <span style={{ alignSelf: "flex-start", fontSize: 11, padding: "3px 9px", borderRadius: 99, fontWeight: 700, background: rec.priority === "high" ? "rgba(239,68,68,0.15)" : rec.priority === "mid" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)", color: rec.priority === "high" ? "#ef4444" : rec.priority === "mid" ? "#F59E0B" : "#4ade80", whiteSpace: "nowrap" }}>
                      {rec.priority === "high" ? t.highPriority : rec.priority === "mid" ? t.midPriority : t.lowPriority}
                    </span>
                  </div>
                ))
              )}
            </Card>
          </div>
        )}

        {tab === 4 && (
          <div className="fade-in">
            <Card>
              <SectionTitle>{t.history}</SectionTitle>
              {history.length < 2 ? <Empty icon="\uD83D\uDCC8" title={t.noHistory} desc={t.noHistorySub} /> : (
                <>
                  <SparkLine data={history} />
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                    {[...history].reverse().map((h, i) => {
                      const g = getGrade(h.score);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#111814", borderRadius: 10, border: "1px solid #1e2d2a" }}>
                          <span style={{ fontSize: 13, color: "#7a9e99" }}>{h.date}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 80, height: 5, background: "#1e2d2a", borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ width: h.score + "%", height: "100%", background: gradeColor(g), borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 800, color: gradeColor(g) }}>{h.score}</span>
                            <span style={{ fontSize: 12, color: "#7a9e99" }}>\u00B7 {g}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {tab === 5 && (
          <div className="fade-in">
            <SettingsPage t={t} lang={lang} setLang={setLang} authStatus={authStatus} onDisconnect={disconnect} showToast={showToast} />
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#080e0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #2DD4BF, #F59E0B)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>\uD83D\uDCE1</div>
        <Spinner size={24} />
      </div>
    </div>
  );
}

function localRecs({ profileComplete, postFreq, engagement, responsiveness, platforms }, lang) {
  const sw = lang === "sw";
  const recs = [];
  const pc = platforms?.length || 0;
  const ps = Math.min(100, (pc / 7) * 100);
  if (profileComplete < 60) recs.push({ icon: "\uD83D\uDCCB", priority: "high", title: sw ? "Kamilisha Wasifu Wako" : "Complete Your Profile", desc: sw ? "Ongeza nambari ya simu, saa za kufungua, picha ya biashara." : "Add your phone number, opening hours, a profile photo, and a short bio to every platform." });
  if (postFreq < 40)        recs.push({ icon: "\uD83D\uDCC5", priority: "high", title: sw ? "Chapisha Mara kwa Mara" : "Post More Consistently", desc: sw ? "Jaribu kuchapisha mara 4-5 kwa wiki." : "Aim for 4-5 posts per week. Use Canva to create visuals easily." });
  if (engagement < 40)      recs.push({ icon: "\uD83D\uDCAC", priority: "high", title: sw ? "Ongeza Mwingiliano" : "Boost Engagement", desc: sw ? "Uliza maswali mwisho wa kila chapisho." : "End every post with a question. Reply to every comment within 24 hours." });
  if (responsiveness < 60)  recs.push({ icon: "\u26A1", priority: "mid",  title: sw ? "Jibu Haraka Zaidi" : "Reply Faster", desc: sw ? "Weka ujumbe wa kiotometi wa WhatsApp." : "Set a WhatsApp auto-reply. Aim for under 2 hours during business hours." });
  if (ps < 45)              recs.push({ icon: "\uD83C\uDF10", priority: "mid",  title: sw ? "Ongeza Majukwaa Zaidi" : "Expand to More Platforms", desc: sw ? "Ongeza kwenye Google Maps kwanza." : "You\'re on " + pc + " of 7 platforms. Add Google Maps first - it\'s free." });
  if (recs.length === 0)    recs.push({ icon: "\uD83C\uDFC6", priority: "low",  title: sw ? "Unaifanya Vizuri Sana!" : "Excellent Work!", desc: sw ? "Alama yako ya kidijitali ni ya juu sana." : "Your digital presence score is excellent. Keep maintaining quality." });
  return recs;
}
