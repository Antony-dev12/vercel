import { useState } from "react";
import { Card, Button, FormGroup, Input, Select } from "../components/ui.jsx";
import { PLATFORMS, SECTORS, LOCATIONS } from "../i18n/translations.js";
import { calcLDVS, getGrade, gradeColor, ScoreRing } from "../components/charts.jsx";

const STEPS = 3;

export default function OnboardingPage({ t, onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    businessName: "", sector: "", location: "",
    platforms: [],
    profileComplete: 50, postFreq: 30, engagement: 40, responsiveness: 60,
  });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function togglePlatform(p) {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }));
  }

  const liveScore = calcLDVS(form);
  const grade     = getGrade(liveScore);
  const gc        = gradeColor(grade);

  function handleFinish() {
    onComplete(form);
  }

  // Progress bar
  const progress = ((step + 1) / STEPS) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "#080e0c", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#e8f4f1", marginBottom: 6 }}>{t.onboardingTitle}</div>
          <div style={{ fontSize: 13, color: "#7a9e99" }}>
            {t[`onboardingStep${step + 1}`]}
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? "#2DD4BF" : "#1e2d2a", transition: "background 0.3s" }} />
          ))}
        </div>

        <Card>
          {/* ── Step 0: Business details ── */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FormGroup label={t.businessName}>
                <Input value={form.businessName} placeholder="e.g. Mama Mboga Supplies" onChange={e => set("businessName", e.target.value)} />
              </FormGroup>
              <FormGroup label={t.sector}>
                <Select value={form.sector} onChange={e => set("sector", e.target.value)}>
                  <option value="">— Select —</option>
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label={t.location}>
                <Select value={form.location} onChange={e => set("location", e.target.value)}>
                  <option value="">— Select —</option>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </Select>
              </FormGroup>
            </div>
          )}

          {/* ── Step 1: Platforms ── */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 14, color: "#7a9e99", marginBottom: 16, lineHeight: 1.6 }}>
                Which platforms is your business active on?
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => togglePlatform(p)} style={{
                    padding: "9px 16px", borderRadius: 99, fontSize: 14, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                    border: `1px solid ${form.platforms.includes(p) ? "#2DD4BF" : "#253330"}`,
                    background: form.platforms.includes(p) ? "rgba(45,212,191,0.1)" : "#1e2d2a",
                    color: form.platforms.includes(p) ? "#2DD4BF" : "#7a9e99",
                  }}>{p}</button>
                ))}
              </div>
              <div style={{ marginTop: 16, fontSize: 13, color: "#7a9e99" }}>
                {form.platforms.length} of {PLATFORMS.length} selected
              </div>
            </div>
          )}

          {/* ── Step 2: First score ── */}
          {step === 2 && (
            <div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ position: "relative", width: 120, height: 120 }}>
                  <ScoreRing score={liveScore} size={120} />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, background: `linear-gradient(135deg, ${gc}, #F59E0B)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{liveScore}</div>
                    <div style={{ fontSize: 10, color: "#7a9e99" }}>/100</div>
                  </div>
                </div>
              </div>

              {[
                { key: "profileComplete", label: t.profileComplete, hint: t.profileHint },
                { key: "postFreq",        label: t.postFreq,        hint: t.postHint },
                { key: "engagement",      label: t.engagement,      hint: t.engHint },
                { key: "responsiveness",  label: t.responsiveness,  hint: t.respHint },
              ].map(({ key, label, hint }) => (
                <div key={key} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#2DD4BF" }}>{form[key]}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#7a9e99", marginBottom: 8 }}>{hint}</div>
                  <input type="range" min="0" max="100" value={form[key]} onChange={e => set(key, Number(e.target.value))} />
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>
                {t.onboardingBack}
              </Button>
            )}
            {step < STEPS - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} style={{ flex: 1 }}>
                {t.onboardingNext}
              </Button>
            ) : (
              <Button onClick={handleFinish} style={{ flex: 1 }}>
                {t.onboardingFinish}
              </Button>
            )}
          </div>

          {step < STEPS - 1 && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={handleFinish} style={{ background: "none", border: "none", color: "#7a9e99", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {t.onboardingSkip}
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
